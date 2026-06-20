import { Signal } from "@angular/core";
import { Note } from "../models/note.model";
import { BehaviorSubject } from "rxjs";

export interface INotesService {
    notes: Signal<Note[]>;
    selectedNote: Signal<Note | null>;
    isLoading: Signal<boolean>;
    saveStatus: Signal<'idle' | 'saving' | 'saved' | 'offline'>;
    totalNotes: Signal<number>;
    loadNotes(): Promise<void>;
    addNote(note: Omit<Note, 'id'>): Promise<void>;
    updateNote(id: number, changes: Partial<Note>): Promise<void>;
    deleteNote(id: number): Promise<void>;
    removeNotesByNotebookId(notebookId: number): void;
    selectNote(note: Note | null): void;
    applyOptimisticUpdate(id: number, changes: Partial<Note>): void;
    filteredNotes: Signal<Note[]>;
    visibleNotes: Signal<Note[]>;
    searchQuery$: BehaviorSubject<string>;
}