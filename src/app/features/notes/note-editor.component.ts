import { Component, DestroyRef, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotesService } from '../../shared/services/notes.service';
import { Note } from '../../shared/models/note.model';

@Component({
    selector: 'app-note-editor',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './note-editor.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoteEditorComponent {
    private readonly destroyRef = inject(DestroyRef);
    private readonly autoSave$ = new Subject<Partial<Note>>();

    protected readonly notesService = inject(NotesService);

    constructor() {
        this.autoSave$.pipe(
            debounceTime(800),
            distinctUntilChanged(),
            takeUntilDestroyed(this.destroyRef)
        )
            .subscribe(async (changes) => {
                const note = this.notesService.selectedNote();
                if (note?.id && typeof changes === 'object') {
                    await this.notesService.updateNote(note.id, { ...changes, updatedAt: new Date() });
                }
            })
    }

    public async addTestNote(): Promise<void> {
        await this.notesService.addNote({
            title: 'Prima nota',
            content: 'Continut test',
            notebookId: 1,
            tags: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            isArchived: false
        })
    }



    // moved inside controller to stop editor complanining about $event.target.value in case of textarea
    // Solved this way the [ERROR] TS2339: Property 'value' does not exist on type 'EventTarget'
    public onTextareaChange(event: Event): void {
        const textarea = event.target! as HTMLInputElement;
        this.autoSave$.next({ content: textarea.value });
    }
    // the same mechanism applied for input for consistancy
    public onInputChange(event: Event): void {
        const input = event.target! as HTMLInputElement;
        this.autoSave$.next({ title: input.value });
    }
}