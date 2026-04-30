import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NoteListComponent } from './features/notes/note-list.component';
import { NoteEditorComponent } from './features/notes/note-editor.component';

@Component({
  selector: 'app-root',
  imports: [NoteListComponent, NoteEditorComponent],
  standalone: true,
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {

}
