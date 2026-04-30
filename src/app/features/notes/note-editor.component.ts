import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NotesService } from '../../shared/services/notes.service';

@Component({
    selector: 'app-note-editor',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './note-editor.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoteEditorComponent {
    protected readonly notesService = inject(NotesService);

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
}