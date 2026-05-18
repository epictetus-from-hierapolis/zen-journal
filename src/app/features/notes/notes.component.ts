import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { NoteListComponent } from "./note-list.component";
import { NoteEditorComponent } from "./note-editor.component";
import { NoteSearchComponent } from "./note-search.component";
import { NOTES_SERVICE_TOKEN } from "../../shared/services/notes.token";
import { AppSettingsService } from "../../shared/services/app-settings.service";
import { RouterLink } from "@angular/router";


@Component({
    selector: 'app-notes',
    standalone: true,
    imports: [NoteListComponent, NoteEditorComponent, NoteSearchComponent, RouterLink],
    templateUrl: './notes.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotesComponent {
    private readonly notesService = inject(NOTES_SERVICE_TOKEN);
    public readonly appSettingsService = inject(AppSettingsService);

    protected async addNote(): Promise<void> {
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