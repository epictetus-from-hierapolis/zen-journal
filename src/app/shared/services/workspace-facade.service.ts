import { computed, inject, Injectable, signal, WritableSignal } from "@angular/core";
import { NOTES_SERVICE_TOKEN } from "./notes.token";
import { NOTEBOOKS_SERVICE_TOKEN } from "./notebooks.token";
import { Note, Notebook } from "../models/note.model";
import { IWorkspaceFacadeService } from "./workspace-facade.service.interface";
import { toSignal } from "@angular/core/rxjs-interop";
import { BehaviorSubject, debounceTime, distinctUntilChanged } from "rxjs";

@Injectable({ providedIn: 'root' })
export class WorkspaceFacadeService implements IWorkspaceFacadeService {
    protected readonly notesService = inject(NOTES_SERVICE_TOKEN);
    protected readonly notebooksService = inject(NOTEBOOKS_SERVICE_TOKEN);

    public notebooks: WritableSignal<Notebook[]> = signal([]);
    public notes: WritableSignal<Note[]> = signal([]);
    public isLoading: WritableSignal<boolean> = signal(false);
    public saveStatus: WritableSignal<'idle' | 'saving' | 'saved' | 'offline'> = signal('idle')

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


    public selectedNotebook: WritableSignal<Notebook | null> = signal(null);
    public selectedNote: WritableSignal<Note | null> = signal(null);

    public selectNotebook(notebook: Notebook | null): void {
        this.selectedNotebook.set(notebook);
    }

    public selectNote(note: Note | null): void {
        this.selectedNote.set(note);
    }

    public async loadAll(): Promise<void> {
        if (this.isInitialized) return;
        this.isLoading.set(true);
        try {
            const [notes, notebooks] = await Promise.all([
                this.notesService.loadNotes(),
                this.notebooksService.loadNotebooks()
            ]);
            this.notes.set(notes);
            this.notebooks.set(notebooks);
            this.isInitialized = true;
        } catch (error) {
            throw error;
        } finally {
            this.isLoading.set(false);
        }
    }

    public async addNote(note: Omit<Note, 'id'>): Promise<void> {
        const tempId: number = -Date.now();
        const tempNote: Note = { ...note, id: tempId };

        this.notes.update(notes => [...notes, tempNote]);
        this.selectNote(tempNote);

        try {
            const { id } = await this.notesService.addNote(note);
            const newNote: Note = { ...note, id };
            this.notes.update(notes => notes.map(note => note.id === tempId ? { ...note, id } : note));
            this.selectNote(newNote);
        } catch (error) {
            this.selectNote(null);
            this.notes.update(notes => notes.filter(note => note.id !== tempId));
            throw error;
        }
    }

    public async addNotebook(name: string): Promise<void> {
        const newNotebook: Omit<Notebook, 'id'> = { name, createdAt: new Date() };
        const tempId: number = -Date.now();
        const tempNotebook: Notebook = { ...newNotebook, id: tempId };
        this.notebooks.update(notebooks => [...notebooks, tempNotebook]);
        try {
            const { id } = await this.notebooksService.addNotebook(newNotebook);
            this.notebooks.update(notebooks => notebooks.map(notebook => notebook.id === tempId ? { ...notebook, id } : notebook))
        } catch (error) {
            this.notebooks.update(notebooks => notebooks.filter(notebook => notebook.id !== tempId));
            throw error;
        }
    }

    public async updateNotebook(id: number, changes: Partial<Notebook>): Promise<void> {
        const currentNotebook = this.notebooks().find(notebook => notebook.id === id) ?? null;

        if (!currentNotebook) throw new Error(`Notebook  with ${id} doesn't exist`);

        const copyCurrentNotebook = { ...currentNotebook };

        this.notebooks.update(notebooks => notebooks.map(notebook => notebook.id === id ? { ...notebook, ...changes } : notebook));

        if (this.selectedNotebook()?.id === id) this.selectedNotebook.set({ ...currentNotebook, ...changes });
        try {
            await this.notebooksService.updateNotebook(id, changes);
        } catch (error) {
            if (this.selectedNotebook()?.id === id) this.selectedNotebook.set(copyCurrentNotebook);
            this.notebooks.update(notebooks => notebooks.map(notebook => notebook.id === id ? copyCurrentNotebook : notebook));
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
        this.notebooks.update(notebooks => notebooks.filter(notebook => notebook.id !== id));
        if (previousNotebook?.id === id) this.selectedNotebook.set(null);

        try {
            await this.notebooksService.deleteNotebook(id);

        } catch (error) {
            this.notebooks.set(currentNotebooks);
            this.notes.set(previousNotes);
            this.selectedNotebook.set(previousNotebook);
            throw error;
        }
    }

    public async updateNote(id: number, changes: Partial<Note>): Promise<void> {
        this.saveStatus.set('saving');
        try {
            await this.notesService.updateNote(id, changes);
            this.notes.update(notes => notes.map(note => note.id === id ? { ...note, ...changes } : note));
            this.saveStatus.set('saved');
            setTimeout(() => this.saveStatus.set('idle'), 2000); // setTimeout există pentru că saveStatus trece prin trei stări
        } catch (error) {
            this.saveStatus.set('offline');
            throw error;
        }
    }

    public async deleteNote(id: number): Promise<void> {
        const notes = this.notes();
        const note = notes.find(n => n.id === id) ?? null;
        this.notes.update(notes => notes.filter(note => note.id !== id));
        this.selectedNote.set(null);
        try {
            await this.notesService.deleteNote(id);
        } catch (error) {
            this.notes.set([...notes]);
            this.selectedNote.set(note);
            throw error;
        }
    }

    public applyOptimisticUpdate(id: number, changes: Partial<Note>): void {
        if (!id) return;
        this.notes.update(notes =>
            notes.map(note => note.id === id ? { ...note, ...changes } : note));
        this.selectedNote.update(note => note?.id === id ? { ...note, ...changes } : note);
    }

    private removeNotesByNotebookId(notebookId: number): void {
        if (this.selectedNote()?.notebookId === notebookId) {
            this.selectedNote.set(null);
        }
        this.notes.update(notes => notes.filter(n => n.notebookId !== notebookId));
    }
}