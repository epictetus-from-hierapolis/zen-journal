import { Injectable, signal, computed, inject } from "@angular/core";
import { DatabaseService } from "./database.service";
import { Note } from '../models/note.model';

@Injectable({
    providedIn: 'root'
})
export class NotesService {
    private readonly db = inject(DatabaseService);

    public readonly notes = signal<Note[]>([]);
    public readonly selectedNote = signal<Note | null>(null);
    public readonly isLoading = signal<boolean>(false);
    public readonly saveStatus = signal<'idle' | 'saving' | 'saved'>('idle');

    public readonly totalNotes = computed(() => this.notes().length);
    public readonly archivedNotes = computed(() => this.notes().filter(note => note.isArchived));
    public readonly activeNotes = computed(() => this.notes().filter(note => !note.isArchived));

    public async loadNotes(): Promise<void> {
        this.isLoading.set(true);
        const notes = await this.db.notes.toArray();
        this.notes.set(notes);
        this.isLoading.set(false);
    }

    public async addNote(note: Omit<Note, 'id'>): Promise<void> {
        await this.db.notes.add(note);
        await this.loadNotes();
    }

    public async updateNote(id: number, changes: Partial<Note>): Promise<void> {
        this.saveStatus.set('saving');
        await this.db.notes.update(id, changes);
        await this.loadNotes();
        this.saveStatus.set('saved');
        setTimeout(() => this.saveStatus.set('idle'), 2000);
    }

    public async deleteNote(id: number): Promise<void> {
        await this.db.notes.delete(id);
        await this.loadNotes();
    }

    public selectNote(note: Note | null): void {
        this.selectedNote.set(note);
    }
}
