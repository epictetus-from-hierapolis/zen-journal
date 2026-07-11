import { inject, Injectable } from "@angular/core";
import { INotesService } from "@shared/interfaces";
import { NotesService } from "./notes.service";
import { EncryptionService } from "./encryption.service";
import { Note } from "@shared/models";

@Injectable()
export class EncryptedNotesService implements INotesService {
    private readonly notesService = inject(NotesService);
    private readonly encryptionService = inject(EncryptionService);

    public async loadNotes(): Promise<Note[]> {
        const notes = await this.notesService.loadNotes();

        if (!this.encryptionService.isUnlocked()) {
            return notes;
        }

        return await Promise.all(notes.map(async (note) => ({
            ...note,
            content: note.contentIv ? await this.encryptionService.decrypt(note.content, note.contentIv) : note.content,
            title: note.titleIv ? await this.encryptionService.decrypt(note.title, note.titleIv) : note.title
        })));

    }

    public async addNote(note: Omit<Note, "id">): Promise<{ id: number; }> {
        if (this.encryptionService.isUnlocked()) {
            const [encodedTitle, encodedContent] = await Promise.all(
                [
                    this.encryptionService.encrypt(note.title),
                    this.encryptionService.encrypt(note.content)
                ]
            );
            return await this.notesService.addNote(
                {
                    ...note,
                    title: encodedTitle.ciphertext,
                    titleIv: encodedTitle.iv,
                    content: encodedContent.ciphertext,
                    contentIv: encodedContent.iv
                });
        } else {
            return await this.notesService.addNote(note)
        }
    }

    public async updateNote(id: number, changes: Partial<Note>): Promise<void> {
        if (this.encryptionService.isUnlocked()) {
            const encryptedChanges = { ...changes };

            const titlePromise = encryptedChanges.title !== undefined
                ? this.encryptionService.encrypt(encryptedChanges.title)
                : Promise.resolve(null);

            const contentPromise = encryptedChanges.content !== undefined
                ? this.encryptionService.encrypt(encryptedChanges.content)
                : Promise.resolve(null);

            const [encodedTitle, encodedContent] = await Promise.all([titlePromise, contentPromise]);

            if (encodedTitle) {
                encryptedChanges.title = encodedTitle.ciphertext;
                encryptedChanges.titleIv = encodedTitle.iv;
            }

            if (encodedContent) {
                encryptedChanges.content = encodedContent.ciphertext;
                encryptedChanges.contentIv = encodedContent.iv;
            }

            return await this.notesService.updateNote(id, encryptedChanges);

        } else {
            return await this.notesService.updateNote(id, changes);

        }
    }

    public async deleteNote(id: number): Promise<void> {
        await this.notesService.deleteNote(id);
    }
}