import { Injectable, signal, computed, inject, numberAttribute } from "@angular/core";
import { Note } from '../models/note.model';
import { INotesService } from "./notes.service.interface";
import { toSignal } from "@angular/core/rxjs-interop";
import { BehaviorSubject, debounceTime, distinctUntilChanged, firstValueFrom } from 'rxjs';
import { HandleError } from "../decorators/handle-error.decorator";
import { HttpClient } from "@angular/common/http";
import { APP_CONFIG } from "../config/app.config.token";
import { NOTEBOOKS_SERVICE_TOKEN } from "./notebooks.token";

@Injectable({
    providedIn: 'root'
})
export class NotesService implements INotesService {
    private readonly httpClient = inject(HttpClient);
    private readonly appConfig = inject(APP_CONFIG);
    private readonly notebooksService = inject(NOTEBOOKS_SERVICE_TOKEN);
    private readonly endpoint = `${this.appConfig.apiUrl}/notes`;
    public readonly notes = signal<Note[]>([]);
    public readonly selectedNote = signal<Note | null>(null);
    public readonly isLoading = signal<boolean>(false);
    public readonly saveStatus = signal<'idle' | 'saving' | 'saved' | 'offline'>('idle');

    public readonly searchQuery$ = new BehaviorSubject<string>('');
    private readonly debouncedSearch = toSignal(
        this.searchQuery$.pipe(
            debounceTime(300),
            distinctUntilChanged()
        ),
        { initialValue: '' }
    );

    public readonly visibleNotes = computed(() => {
        const selectedNotebook = this.notebooksService.selectedNotebook();
        if (selectedNotebook) {
            return this.notes().filter(note => note.notebookId === selectedNotebook.id);
        } else {
            return this.notes();
        }
    });

    public readonly filteredNotes = computed(() => {
        const query = this.debouncedSearch()?.toLowerCase() ?? '';
        if (!query) return this.notes();
        return this.notes().filter(note => note.title.toLowerCase().includes(query) ||
            note.content.replace(/<[^>]*>/g, ' ').toLowerCase().includes(query));
    });

    public readonly totalNotes = computed(() => this.visibleNotes().length);

    @HandleError
    public async loadNotes(): Promise<void> {
        this.isLoading.set(true);
        try {
            const notes = await firstValueFrom(this.httpClient.get<Note[]>(this.endpoint));
            this.notes.set(notes);
            this.isLoading.set(false);
        } finally {
            this.isLoading.set(false);
        }
    }

    @HandleError
    public async addNote(note: Omit<Note, 'id'>): Promise<void> {
        const tempId: number = -Date.now();
        const tempNote: Note = { ...note, id: tempId };

        this.notes.update(notes => [...notes, tempNote]);
        this.selectNote(tempNote);

        try {
            const { id } = (await firstValueFrom(this.httpClient.post<{ id: number }>(this.endpoint, note)));
            const newNote: Note = { ...note, id };

            this.notes.update(notes => notes.map(note => note.id === tempId ? { ...note, id } : note));
            this.selectNote(newNote);
        } catch (error) {
            this.selectNote(null);
            this.notes.update(notes => notes.filter(note => note.id !== tempId));
            throw error;
        }
    }

    @HandleError
    public async updateNote(id: number, changes: Partial<Note>): Promise<void> {
        this.saveStatus.set('saving');
        try {
            await firstValueFrom(this.httpClient.put(`${this.endpoint}/${id}`, changes));
            this.notes.update(notes => notes.map(note => note.id === id ? { ...note, ...changes } : note));
            this.saveStatus.set('saved');
            setTimeout(() => this.saveStatus.set('idle'), 2000); // setTimeout există pentru că saveStatus trece prin trei stări
        } catch (error) {
            this.saveStatus.set('offline');
            throw error;
        }
    }

    @HandleError
    public async deleteNote(id: number): Promise<void> {
        const notes = this.notes();
        const note = notes.find(n => n.id === id) ?? null;
        this.notes.update(notes => notes.filter(note => note.id !== id));
        this.selectedNote.set(null);
        try {
            await firstValueFrom(this.httpClient.delete(`${this.endpoint}/${id}`));
        } catch (error) {
            this.notes.set([...notes]);
            this.selectedNote.set(note);
            throw error;
        }
    }

    public removeNotesByNotebookId(notebookId: number): void {
        if (this.selectedNote()?.notebookId === notebookId) {
            this.selectedNote.set(null);
        }
        this.notes.update(notes => notes.filter(n => n.notebookId !== notebookId));
    }

    public selectNote(note: Note | null): void {
        this.selectedNote.set(note);
    }

    public applyOptimisticUpdate(id: number, changes: Partial<Note>): void {
        if (!id) return;
        this.notes.update(notes =>
            notes.map(note => note.id === id ? { ...note, ...changes } : note));
        this.selectedNote.update(note => note?.id === id ? { ...note, ...changes } : note);
    }
}
