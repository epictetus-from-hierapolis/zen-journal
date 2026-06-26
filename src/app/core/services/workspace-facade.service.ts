import { computed, inject, Injectable, Signal, signal, WritableSignal } from "@angular/core";
import { NOTES_SERVICE_TOKEN, NOTEBOOKS_SERVICE_TOKEN } from "@shared/tokens";
import { Note, Notebook } from "@shared/models";
import { IWorkspaceFacadeService } from "@shared/interfaces";
import { toSignal } from "@angular/core/rxjs-interop";
import { BehaviorSubject, debounceTime, distinctUntilChanged } from "rxjs";

@Injectable()
export class WorkspaceFacadeService implements IWorkspaceFacadeService {
    protected readonly notesService = inject(NOTES_SERVICE_TOKEN);
    protected readonly notebooksService = inject(NOTEBOOKS_SERVICE_TOKEN);

    private readonly _notes = signal<Note[]>([]);
    private readonly _notebooks = signal<Notebook[]>([]);
    private readonly _isLoading = signal<boolean>(false);
    private readonly _saveStatus = signal<'idle' | 'saving' | 'saved' | 'offline'>('idle');
    private readonly _selectedNotebook = signal<Notebook | null>(null);
    private readonly _selectedNote = signal<Note | null>(null);

    public readonly notebooks = this._notebooks.asReadonly();
    public readonly notes = this._notes.asReadonly();
    public readonly isLoading = this._isLoading.asReadonly();
    public readonly saveStatus = this._saveStatus.asReadonly();
    public readonly selectedNotebook = this._selectedNotebook.asReadonly();
    public readonly selectedNote = this._selectedNote.asReadonly();

    private isInitialized = false;

    public readonly searchQuery$ = new BehaviorSubject<string>('');

    public readonly visibleNotes = computed(() => {
        const selectedNotebook = this.selectedNotebook();
        if (selectedNotebook) {
            return this.notes().filter(note => note.notebookId === selectedNotebook.id);
        } else {
            return this.notes();
        }
    });

    private readonly debouncedSearch = toSignal(
        this.searchQuery$.pipe(
            debounceTime(300),
            distinctUntilChanged()
        ),
        { initialValue: '' }
    );

    public readonly filteredNotes = computed(() => {
        const query = this.debouncedSearch()?.toLowerCase() ?? '';
        if (!query) return this.notes();
        return this.notes().filter(note => note.title.toLowerCase().includes(query) ||
            note.content.replace(/<[^>]*>/g, ' ').toLowerCase().includes(query));
    });

    public readonly totalNotes = computed(() => this.visibleNotes().length);

    public selectNotebook(notebook: Notebook | null): void {
        this._selectedNotebook.set(notebook);
    }

    public selectNote(note: Note | null): void {
        this._selectedNote.set(note);
    }

    public async loadAll(): Promise<void> {
        if (this.isInitialized) return;
        this._isLoading.set(true);
        try {
            const [notes, notebooks] = await Promise.all([
                this.notesService.loadNotes(),
                this.notebooksService.loadNotebooks()
            ]);
            this._notes.set(notes);
            this._notebooks.set(notebooks);
            this.isInitialized = true;
        } catch (error) {
            throw error;
        } finally {
            this._isLoading.set(false);
        }
    }

    public async addNote(): Promise<void> {
        if (!this.notebooks().length) return;

        const emptyNote: Omit<Note, 'id'> = {
            title: '',
            content: '',
            notebookId: (this.selectedNotebook()?.id || this.notebooks()[0].id)!,
            tags: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        const tempId: number = -Date.now();
        const tempNote: Note = { ...emptyNote, id: tempId };

        this._notes.update(notes => [...notes, tempNote]);
        this.selectNote(tempNote);

        try {
            const { id } = await this.notesService.addNote(emptyNote);
            const newNote: Note = { ...emptyNote, id };
            this._notes.update(notes => notes.map(note => note.id === tempId ? { ...note, id } : note));
            this.selectNote(newNote);
        } catch (error) {
            this.selectNote(null);
            this._notes.update(notes => notes.filter(note => note.id !== tempId));
            throw error;
        }
    }

    public async addNotebook(name: string): Promise<void> {
        const newNotebook: Omit<Notebook, 'id'> = { name, createdAt: new Date() };
        const tempId: number = -Date.now();
        const tempNotebook: Notebook = { ...newNotebook, id: tempId };
        this._notebooks.update(notebooks => [...notebooks, tempNotebook]);
        try {
            const { id } = await this.notebooksService.addNotebook(newNotebook);
            this._notebooks.update(notebooks => notebooks.map(notebook => notebook.id === tempId ? { ...notebook, id } : notebook))
        } catch (error) {
            this._notebooks.update(notebooks => notebooks.filter(notebook => notebook.id !== tempId));
            throw error;
        }
    }

    public async updateNotebook(id: number, changes: Partial<Notebook>): Promise<void> {
        const currentNotebook = this.notebooks().find(notebook => notebook.id === id) ?? null;

        if (!currentNotebook) throw new Error(`Notebook  with ${id} doesn't exist`);

        const copyCurrentNotebook = { ...currentNotebook };

        this._notebooks.update(notebooks => notebooks.map(notebook => notebook.id === id ? { ...notebook, ...changes } : notebook));

        if (this.selectedNotebook()?.id === id) this._selectedNotebook.set({ ...currentNotebook, ...changes });
        try {
            await this.notebooksService.updateNotebook(id, changes);
        } catch (error) {
            if (this.selectedNotebook()?.id === id) this._selectedNotebook.set(copyCurrentNotebook);
            this._notebooks.update(notebooks => notebooks.map(notebook => notebook.id === id ? copyCurrentNotebook : notebook));
            throw error;
        }
    }

    public async deleteNotebook(id: number): Promise<void> {
        const currentNotebook = this.notebooks().find(notebook => notebook.id === id) ?? null;
        if (!currentNotebook) throw new Error(`Notebook  with ${id} doesn't exist`);

        const currentNotebooks = this.notebooks();
        const previousNotes = [...this.notes()];
        const previousNotebook = this.selectedNotebook();
        this.removeNotesByNotebookId(id);
        this._notebooks.update(notebooks => notebooks.filter(notebook => notebook.id !== id));
        if (previousNotebook?.id === id) this._selectedNotebook.set(null);

        try {
            await this.notebooksService.deleteNotebook(id);

        } catch (error) {
            this._notebooks.set(currentNotebooks);
            this._notes.set(previousNotes);
            this._selectedNotebook.set(previousNotebook);
            throw error;
        }
    }

    public async updateNote(id: number, changes: Partial<Note>): Promise<void> {
        this._saveStatus.set('saving');
        try {
            await this.notesService.updateNote(id, changes);
            this._notes.update(notes => notes.map(note => note.id === id ? { ...note, ...changes } : note));
            this._saveStatus.set('saved');
        } catch (error) {
            this._saveStatus.set('offline');
            throw error;
        }
    }

    public async deleteNote(id: number): Promise<void> {
        const notes = this.notes();
        const note = notes.find(n => n.id === id) ?? null;
        this._notes.update(notes => notes.filter(note => note.id !== id));
        this._selectedNote.set(null);
        try {
            await this.notesService.deleteNote(id);
        } catch (error) {
            this._notes.set([...notes]);
            this._selectedNote.set(note);
            throw error;
        }
    }

    public applyOptimisticUpdate(id: number, changes: Partial<Note>): void {
        if (!id) return;
        this._notes.update(notes =>
            notes.map(note => note.id === id ? { ...note, ...changes } : note));
        this._selectedNote.update(note => note?.id === id ? { ...note, ...changes } : note);
    }

    private removeNotesByNotebookId(notebookId: number): void {
        if (this.selectedNote()?.notebookId === notebookId) {
            this._selectedNote.set(null);
        }
        this._notes.update(notes => notes.filter(n => n.notebookId !== notebookId));
    }
}