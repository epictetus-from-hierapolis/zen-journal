import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NoteListComponent } from './features/notes/note-list.component';

@Component({
  selector: 'app-root',
  imports: [NoteListComponent],
  standalone: true,
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {

}
