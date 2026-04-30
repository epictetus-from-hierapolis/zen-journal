import { ChangeDetectionStrategy, Component, OnInit, inject } from "@angular/core";
import { DatePipe } from "@angular/common";
import { NotesService } from "../../shared/services/notes.service";
import { Note } from '../../shared/models/note.model';

@Component({
    selector: 'app-note-list',
    standalone: true,
    imports: [DatePipe],
    templateUrl: './note-list.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoteListComponent implements OnInit {
    protected readonly notesService = inject(NotesService);

    public async ngOnInit(): Promise<void> {
        await this.notesService.loadNotes();
    }

    public selectNote(note: Note): void {
        this.notesService.selectNote(note);
    }
}