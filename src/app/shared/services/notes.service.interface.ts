import { Signal } from "@angular/core";
import { Note } from "../models/note.model";
import { BehaviorSubject } from "rxjs";

export interface INotesService {
    loadNotes(): Promise<Note[]>;
    addNote(note: Omit<Note, 'id'>): Promise<{ id: number }>;
    updateNote(id: number, changes: Partial<Note>): Promise<void>;
    deleteNote(id: number): Promise<void>;
}