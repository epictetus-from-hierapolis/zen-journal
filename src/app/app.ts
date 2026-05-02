import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { NoteListComponent } from './features/notes/note-list.component';
import { NoteEditorComponent } from './features/notes/note-editor.component';
import { NOTES_SERVICE_TOKEN } from './shared/services/notes.token';
import { NoteSearchComponent } from './features/notes/note-search.component';

@Component({
  selector: 'app-root',
  imports: [NoteListComponent, NoteEditorComponent, NoteSearchComponent],
  standalone: true,
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  private readonly notesService = inject(NOTES_SERVICE_TOKEN);

  public async addNote(): Promise<void> {
    await this.notesService.addNote({
      title: '',
      content: '',
      notebookId: 1,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active'
    });
  }
}
