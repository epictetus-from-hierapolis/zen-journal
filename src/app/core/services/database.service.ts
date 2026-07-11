import { Injectable } from "@angular/core";
import Dexie, { Table } from 'dexie';
import { Note, Notebook, Tag } from '@shared/models';

@Injectable({
    providedIn: 'root'
})
export class DatabaseService extends Dexie {
    public notes!: Table<Note, number>;
    public notebooks!: Table<Notebook, number>;
    public settings!: Table<{ key: string, value: unknown }, string>;

    constructor() {
        super('ZenJournalDb');
        this.version(1).stores({
            notes: '++id, title, notebookId, createdAt, updatedAt',
            notebooks: '++id, name, createdAt',
            settings: 'key'
        });

        this.on('populate', async () => {
            const notebookId = await this.notebooks.add({ name: 'Personal Notes', createdAt: new Date() });
            const defaultNote: Note = {
                title: 'Welcome to Zen Journal 🧘‍♂️',
                content: `
                    <h1>Your space for mindful writing.</h1>
                    <p>This is a demo note to help you get started. Here are a few things you can do:</p>
                    <ul>
                        <li>Create new notes using the button below.</li>
                        <li>Organize them using notebooks in the sidebar.</li>
                        <li>Search through your thoughts instantly.</li>
                    </ul>
                `,
                notebookId: notebookId,
                createdAt: new Date(),
                updatedAt: new Date(),
            }
            await this.notes.add(defaultNote);
        });
    }
}