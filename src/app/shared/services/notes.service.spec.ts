import { describe, expect, it, jest } from '@jest/globals';
import { NotesService } from './notes.service';
import { TestBed } from '@angular/core/testing';
import { Note } from '../models/note.model';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

describe('NotesService', () => {
    let service: NotesService;
    let httpMock: HttpTestingController;
    const mockDate = new Date('2026-01-01T00:00:00.000Z');
    const mockNote: Note = {
        id: 1,
        title: '',
        content: '',
        notebookId: 1,
        tags: [],
        createdAt: mockDate,
        updatedAt: mockDate,
        status: 'active'
    }
    const mockNotes: Note[] = [mockNote];

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                NotesService,
                provideHttpClient(),
                provideHttpClientTesting()
            ]
        });

        service = TestBed.inject(NotesService); // create new instance of NotesService
        httpMock = TestBed.inject(HttpTestingController);
        jest.clearAllMocks();
    });

    afterEach(() => {
        httpMock.verify();
    });

    describe('loadNotes()', () => {
        it('should load notes into signal', async () => {
            const promise = service.loadNotes();
            const req = httpMock.expectOne('/api/notes');
            req.flush(mockNotes);
            await promise;
            expect(service.notes()).toEqual(mockNotes);
        });

        it('should reflect loading state during loadNotes', async () => {
            let resolve: (value: Note[]) => void;
            const deferred = new Promise<Note[]>((res) => { resolve = res; });
            mockDb.notes.toArray.mockReturnValueOnce(deferred);
            const promise = service.loadNotes();
            expect(service.isLoading()).toBe(true);
            resolve!(mockNotes);
            await promise;
            expect(service.isLoading()).toBe(false);
        });
    });

    describe('addNote()', () => {
        it('should call db.add with correct note', async () => {
            const { id, ...noteWithoutId } = mockNote;
            await service.addNote(noteWithoutId);
            expect(mockDb.notes.add).toHaveBeenCalledWith(noteWithoutId);
        });

        it('should update notes signal after add', async () => {
            const { id, ...noteWithoutId } = mockNote;
            await service.addNote(noteWithoutId);
            expect(service.notes()).toContainEqual(mockNote);
        });

        it('should select the newly added note', async () => {
            const { id, ...noteWithoutId } = mockNote;
            await service.addNote(noteWithoutId);
            expect(service.selectedNote()).toEqual(mockNote);
        });
    });

    describe('updateNote()', () => {
        it('should reflect saveStatus changes during updateNote', async () => {
            let resolve: () => void;
            const { id, ...noteWithoutId } = mockNote;
            const deffered = new Promise<void>((res) => { resolve = res; });
            mockDb.notes.update.mockReturnValueOnce(deffered);
            const promise = service.updateNote(id!, noteWithoutId);
            expect(service.saveStatus()).toBe('saving');
            resolve!();
            await promise;
            expect(service.saveStatus()).toBe('saved');
        });

        it('should call db.update with correct id and partial note', async () => {
            const { id, ...noteWithoutId } = mockNote;
            await service.updateNote(id!, noteWithoutId);
            expect(mockDb.notes.update).toHaveBeenCalledWith(id!, noteWithoutId);
        });

        it('should update notes signal after update', async () => {
            const { id, ...noteWithoutId } = mockNote;
            service.notes.set(mockNotes);
            await service.updateNote(id!, noteWithoutId);
            expect(service.notes()).toContainEqual(mockNote);
        });

        it('should set saveStatus to idle after 2 seconds', async () => {
            const { id, ...noteWithoutId } = mockNote;
            jest.useFakeTimers();
            await service.updateNote(id!, noteWithoutId);
            jest.advanceTimersByTime(2000);
            expect(service.saveStatus()).toBe('idle');
            jest.useRealTimers();
        });
    });

    describe('deleteNote()', () => {
        it('should call db.delete with correct id', async () => {
            const { id, ...noteWithoutId } = mockNote;
            await service.deleteNote(id!);
            expect(mockDb.notes.delete).toHaveBeenCalledWith(id!);
        });

        it('should update notes signal after deletion', async () => {
            const { id, ...noteWithoutId } = mockNote;
            mockDb.notes.toArray.mockResolvedValueOnce([]);
            await service.deleteNote(id!);
            expect(service.notes()).toEqual([]);
        });

        it('should reload notes from database after deletion', async () => {
            const { id, ...noteWithoutId } = mockNote;
            await service.deleteNote(id!);
            expect(mockDb.notes.toArray).toHaveBeenCalled();
        });
    });

    describe('selectNote()', () => {
        it('should update selectedNote signal with the provided note', () => {
            service.selectNote(mockNote);
            expect(service.selectedNote()).toEqual(mockNote);
        });

        it('should set selectedNote signal to null', () => {
            service.selectNote(null);
            expect(service.selectedNote()).toBeNull();
        });
    });

    describe('applyOptimisticUpdate()', () => {
        it('should update specific note in both notes list and selection', () => {
            service.notes.set([mockNote]);
            service.selectNote(mockNote);

            service.applyOptimisticUpdate(mockNote.id!, { title: 'Titlu nou' });

            expect(service.notes().find((n) => n.id === mockNote.id)?.title).toBe('Titlu nou');
            expect(service.selectedNote()?.title).toBe('Titlu nou');
        });
    });
}); 