import { Component, DestroyRef, inject, ChangeDetectionStrategy, effect, untracked, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { from, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Note } from '../../shared/models/note.model';
import { NOTES_SERVICE_TOKEN } from '../../shared/services/notes.token';
import { APP_CONFIG } from '../../shared/config/app.config.token';
import { WordCountPipe } from '../../shared/ui/word-count.pipe';

@Component({
    selector: 'app-note-editor',
    standalone: true,
    imports: [FormsModule, WordCountPipe],
    templateUrl: './note-editor.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoteEditorComponent {
    private readonly destroyRef = inject(DestroyRef);
    protected readonly notesService = inject(NOTES_SERVICE_TOKEN);
    private readonly appConfig = inject(APP_CONFIG);

    private readonly autoSave$ = new Subject<{ id: number; changes: Partial<Note> }>();

    constructor() {
        this.autoSave$.pipe(
            debounceTime(this.appConfig.autosaveDelay),
            distinctUntilChanged((prev, curr) =>
                prev.id === curr.id &&
                Object.keys(curr.changes).every(key =>
                    prev.changes[key as keyof Note] === curr.changes[key as keyof Note]
                )
            ),
            switchMap(({ id, changes }) => from(this.notesService.updateNote(id, { ...changes, updatedAt: new Date() }))),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe();
    }

    protected async addTestNote(): Promise<void> {
        await this.notesService.addNote({
            title: 'Prima nota',
            content: 'Continut test',
            notebookId: 1,
            tags: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'active'
        })
    }

    protected onInputChange(event: Event): void {
        const title = (event.target! as HTMLInputElement).value;
        const id = this.notesService.selectedNote()?.id;

        if (id) {
            this.notesService.updateNotesSignal(id, { title });
            this.autoSave$.next({ id, changes: { title } });
        }
    }

    protected onTextareaChange(event: Event): void {
        const content = (event.target! as HTMLInputElement).value;
        const id = this.notesService.selectedNote()?.id;

        if (id) {
            this.notesService.updateNotesSignal(id, { content });
            this.autoSave$.next({ id, changes: { content } });
        }
    }
}