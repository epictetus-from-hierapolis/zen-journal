import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { NoteListComponent } from './features/notes/note-list.component';
import { NoteEditorComponent } from './features/notes/note-editor.component';
import { NotesService } from './shared/services/notes.service';

@Component({
  selector: 'app-root',
  imports: [NoteListComponent, NoteEditorComponent],
  standalone: true,
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  private readonly notesService = inject(NotesService);

  public async addNote(): Promise<void> {
    await this.notesService.addNote({
      title: '',
      content: '',
      notebookId: 1,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isArchived: false
    });
  }
}
