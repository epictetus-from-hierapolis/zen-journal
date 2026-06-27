import { Signal } from "@angular/core";
import { Note, Notebook } from "../models/note.model";
import { BehaviorSubject } from "rxjs";

export interface IWorkspaceFacadeService {
    selectedNotebook: Signal<Notebook | null>;
    selectedNote: Signal<Note | null>;
    selectNotebook(notebook: Notebook | null): void;
    selectNote(note: Note | null): void;
    notebooks: Signal<Notebook[]>;
    notes: Signal<Note[]>;
    isLoading: Signal<boolean>;
    saveStatus: Signal<'idle' | 'saving' | 'saved' | 'offline'>;
    visibleNotes: Signal<Note[]>;
    filteredNotes: Signal<Note[]>;
    searchQuery$: BehaviorSubject<string>;
    totalNotes: Signal<number>;
    notebooksCount: Signal<number>;
    loadAll(): Promise<void>;
    addNotebook(name: string): Promise<void>;
    updateNotebook(id: number, changes: Partial<Notebook>): Promise<void>;
    deleteNotebook(id: number): Promise<void>;
    addNote(): Promise<void>;
    updateNote(id: number, changes: Partial<Note>): Promise<void>;
    deleteNote(id: number): Promise<void>;
    applyOptimisticUpdate(id: number, changes: Partial<Note>): void;
}