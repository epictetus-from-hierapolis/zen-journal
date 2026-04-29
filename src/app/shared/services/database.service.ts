import { Injectable } from "@angular/core";
import Dexie, { Table } from 'dexie';
import { Note, Notebook, Tag } from '../models/note.model';

@Injectable({
    providedIn: 'root'
})
export class DatabaseService extends Dexie {
    public notes!: Table<Note, number>;
    public notebooks!: Table<Notebook, number>;
    public tags!: Table<Tag, number>;

    constructor() {
        super('ZenJournalDb');
        this.version(1).stores({
            notes: '++id, title, notebookId, isArchived, createdAt, updatedAt',
            notebooks: '++id, name, createdAt',
            tags: '++id, name   '
        });
    }

}