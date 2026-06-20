import { ChangeDetectionStrategy, Component, effect, inject, signal, WritableSignal } from "@angular/core";
import { NoteListComponent } from "./note-list.component";
import { NoteEditorComponent } from "./note-editor.component";
import { NoteSearchComponent } from "./note-search.component";
import { NOTES_SERVICE_TOKEN } from "../../shared/services/notes.token";
import { AppSettingsService } from "../../shared/services/app-settings.service";
import { RouterLink } from "@angular/router";
import { NotebookCreateComponent } from "../notebooks/notebook-create.component";
import { NotebooksComponent } from "../notebooks/notebook.component";
import { NOTEBOOKS_SERVICE_TOKEN } from "../../shared/services/notebooks.token";


@Component({
    selector: 'app-notes',
    standalone: true,
    imports: [NoteListComponent, NoteEditorComponent, NoteSearchComponent, RouterLink, NotebookCreateComponent, NotebooksComponent],
    templateUrl: './notes.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotesComponent {
    protected readonly notesService = inject(NOTES_SERVICE_TOKEN);
    protected readonly notebooksService = inject(NOTEBOOKS_SERVICE_TOKEN);
    public readonly appSettingsService = inject(AppSettingsService);

    protected isSidebarOpen: WritableSignal<boolean> = signal(false);
    protected isAddingNotebook: WritableSignal<boolean> = signal(false);


    constructor() {
        effect(() => {
            if (this.notesService.selectedNote() || this.notebooksService.selectedNotebook()) this.isSidebarOpen.set(false);
        });
    }

    protected toggleSidebar() {
        this.isSidebarOpen.update(value => !value);
    }

    protected async addNote(): Promise<void> {
        if (!this.notebooksService.notebooks().length) return;

        await this.notesService.addNote({
            title: '',
            content: '',
            notebookId: (this.notebooksService.selectedNotebook()?.id || this.notebooksService.notebooks()[0].id)!,
            tags: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }
}