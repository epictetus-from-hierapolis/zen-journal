import { Injectable, signal, computed, inject } from "@angular/core";
import { DatabaseService } from "./database.service";
import { Note } from '../models/note.model';
import { INotesService } from "./notes.service.interface";
import { toSignal } from "@angular/core/rxjs-interop";
import { BehaviorSubject, debounceTime, distinctUntilChanged } from 'rxjs';
import { BaseStorageService } from "./base-storage.service";
import { HandleError } from "../decorators/handle-error.decorator";

@Injectable({
    providedIn: 'root'
})
export class NotesService extends BaseStorageService<Note> implements INotesService {
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

    constructor() {
        const db = inject(DatabaseService);
        super(db.notes);
    }

    @HandleError
    public async loadNotes(): Promise<void> {
        this.isLoading.set(true);
        const notes = await this.getAll();
        this.notes.set(notes);
        this.isLoading.set(false);
    }

    @HandleError
    public async addNote(note: Omit<Note, 'id'>): Promise<void> {
        const id = await this.add(note);
        const newNote = { ...note, id };
        this.notes.update(notes => [...notes, newNote]);
        this.selectNote(newNote);
    }

    @HandleError
    public async updateNote(id: number, changes: Partial<Note>): Promise<void> {
        this.saveStatus.set('saving');
        await this.update(id, changes);
        this.notes.update(notes => notes.map(note => note.id === id ? { ...note, ...changes } : note));
        this.saveStatus.set('saved');
        setTimeout(() => this.saveStatus.set('idle'), 2000);
    }

    @HandleError
    public async deleteNote(id: number): Promise<void> {
        await this.delete(id);
        await this.loadNotes();
    }

    public selectNote(note: Note | null): void {
        this.selectedNote.set(note);
    }

    public updateNotesSignal(id: number, changes: Partial<Note>): void {
        if (!id) return;
        this.notes.update(notes =>
            notes.map(note => note.id === id ? { ...note, ...changes } : note));
        this.selectedNote.update(note => note?.id === id ? { ...note, ...changes } : note);
    }
}
