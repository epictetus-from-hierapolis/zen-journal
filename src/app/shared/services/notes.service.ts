import { Injectable, signal, computed, inject } from "@angular/core";
import { DatabaseService } from "./database.service";
import { Note } from '../models/note.model';
import { INotesService } from "./notes.service.interface";
import { toSignal } from "@angular/core/rxjs-interop";
import { BehaviorSubject, debounceTime, distinctUntilChanged, firstValueFrom } from 'rxjs';
import { HandleError } from "../decorators/handle-error.decorator";
import { HttpClient } from "@angular/common/http";
import { APP_CONFIG } from "../config/app.config.token";

@Injectable({
    providedIn: 'root'
})
export class NotesService implements INotesService {
    private readonly httpClient = inject(HttpClient);
    private readonly appConfig = inject(APP_CONFIG);
    private readonly endpoint = `${this.appConfig.apiUrl}/notes`;
    public readonly notes = signal<Note[]>([]);
    public readonly selectedNote = signal<Note | null>(null);
    public readonly isLoading = signal<boolean>(false);
    public readonly saveStatus = signal<'idle' | 'saving' | 'saved'>('idle');

    public readonly searchQuery$ = new BehaviorSubject<string>('');
    private readonly debouncedSearch = toSignal(
        this.searchQuery$.pipe(
            debounceTime(300),
            distinctUntilChanged()
        ),
        { initialValue: '' }
    );
    public readonly filteredNotes = computed(() => {
        const query = this.debouncedSearch()?.toLowerCase() ?? '';
        if (!query) return this.activeNotes();
        return this.activeNotes().filter(note => note.title.includes(query) ||
            note.content.includes(query));
    });

    public readonly totalNotes = computed(() => this.notes().length);
    public readonly archivedNotes = computed(() => this.notes().filter(note => note.status === 'archived'));
    public readonly activeNotes = computed(() => this.notes().filter(note => note.status === 'active'));

    @HandleError
    public async loadNotes(): Promise<void> {
        this.isLoading.set(true);
        const notes = await firstValueFrom(this.httpClient.get<Note[]>(this.endpoint));
        this.notes.set(notes);
        this.isLoading.set(false);
    }

    @HandleError
    public async addNote(note: Omit<Note, 'id'>): Promise<void> {
        const { id } = await firstValueFrom(this.httpClient.post<{ id: number }>(this.endpoint, note));
        const newNote = { ...note, id };
        this.notes.update(notes => [...notes, newNote]);
        this.selectNote(newNote);
    }

    @HandleError
    public async updateNote(id: number, changes: Partial<Note>): Promise<void> {
        this.saveStatus.set('saving');
        await firstValueFrom(this.httpClient.put(`${this.endpoint}/${id}`, changes));
        this.notes.update(notes => notes.map(note => note.id === id ? { ...note, ...changes } : note));
        this.saveStatus.set('saved');
        setTimeout(() => this.saveStatus.set('idle'), 2000); // setTimeout există pentru că saveStatus trece prin trei stări
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
