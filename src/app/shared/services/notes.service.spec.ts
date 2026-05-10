import { describe, expect, it, jest } from '@jest/globals';
import { NotesService } from './notes.service';
import { TestBed } from '@angular/core/testing';
import { DatabaseService } from './database.service';
import { Note } from '../models/note.model';

describe('NotesService', () => {
    let service: NotesService;
    const mockDb = {
        notes: {
            toArray: jest.fn<() => Promise<Note[]>>().mockResolvedValue([]),
            add: jest.fn().mockResolvedValue(1),
            update: jest.fn<() => Promise<void>>().mockResolvedValue(void 0),
            delete: jest.fn<() => Promise<void>>().mockResolvedValue(void 0),
        }
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                NotesService,
                {
                    provide: DatabaseService,
                    useValue: mockDb
                }
            ]
        });

        service = TestBed.inject(NotesService);
    });

    it('should return an empty array', async () => {
        const result = await service.getAll();
        expect(result).toEqual([]);
    });

    it('should return notes', async () => {
        const mockDate = new Date('2026-01-01T00:00:00.000Z');
        const mockNotes: Note[] = [{
            id: 1,
            title: '',
            content: '',
            notebookId: 1,
            tags: [],
            createdAt: mockDate,
            updatedAt: mockDate,
            status: 'active'
        }];

        mockDb.notes.toArray.mockResolvedValueOnce(mockNotes);

        const result = await service.getAll();
        expect(result).toEqual(mockNotes);
    });

}); 