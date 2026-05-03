import { ChangeDetectionStrategy, Component, OnInit, inject } from "@angular/core";
import { DatePipe } from "@angular/common";
import { Note } from '../../shared/models/note.model';
import { NOTES_SERVICE_TOKEN } from "../../shared/services/notes.token";
import { ScrollingModule } from "@angular/cdk/scrolling";

@Component({
    selector: 'app-note-list',
    standalone: true,
    imports: [DatePipe, ScrollingModule],
    templateUrl: './note-list.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoteListComponent implements OnInit {
    protected readonly notesService = inject(NOTES_SERVICE_TOKEN);

    public async ngOnInit(): Promise<void> {
        await this.notesService.loadNotes();
    }

    protected selectNote(note: Note): void {
        this.notesService.selectNote(note);
    }

    protected trackNote(index: number, note: Note) {
        return note.id!;
    }
}