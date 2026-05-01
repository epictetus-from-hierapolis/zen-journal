import { ChangeDetectionStrategy, Component, OnInit, inject } from "@angular/core";
import { DatePipe } from "@angular/common";
import { Note } from '../../shared/models/note.model';
import { NOTES_SERVICE_TOKEN } from "../../shared/services/notes.token";

@Component({
    selector: 'app-note-list',
    standalone: true,
    imports: [DatePipe],
    templateUrl: './note-list.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoteListComponent implements OnInit {
    protected readonly notesService = inject(NOTES_SERVICE_TOKEN);

    public async ngOnInit(): Promise<void> {
        await this.notesService.loadNotes();
    }

    public selectNote(note: Note): void {
        this.notesService.selectNote(note);
    }
}