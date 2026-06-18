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
        this.version(23).stores({
            notes: '++id, title, notebookId, status, createdAt, updatedAt',
            notebooks: '++id, name, createdAt',
            tags: '++id, name   '
        }).upgrade(tx => {
            return tx.table('notes').toCollection().modify((note: any) => {
                note.status = note.isArchived ? 'archived' : 'active';
                note.archivedAt = note.isArchived ? new Date() : undefined;
                delete note.isArchived;
            });
        });
        this.version(24).stores({
            notes: '++id, title, notebookId, createdAt, updatedAt',
            notebooks: '++id, name, createdAt',
            tags: '++id, name   '
        }).upgrade(tx => {
            return tx.table('notes').toCollection().modify((note: any) => {
                delete note.status;
                delete note.archivedAt;
                delete note.deletedAt
                delete note.isArchived;
            });
        });
    }

}