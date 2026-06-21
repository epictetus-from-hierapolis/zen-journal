import { ChangeDetectionStrategy, Component, effect, inject, OnInit, signal, WritableSignal } from "@angular/core";
import { NoteListComponent } from "./note-list.component";
import { NoteEditorComponent } from "./note-editor.component";
import { NoteSearchComponent } from "./note-search.component";
import { AppSettingsService } from "../../shared/services/app-settings.service";
import { RouterLink } from "@angular/router";
import { NotebookCreateComponent } from "../notebooks/notebook-create.component";
import { NotebooksComponent } from "../notebooks/notebook.component";
import { WORKSPACE_FACADE_SERVICE_TOKEN } from "../../shared/services/workspace-facade.token";


@Component({
    selector: 'app-notes',
    standalone: true,
    imports: [NoteListComponent, NoteEditorComponent, NoteSearchComponent, RouterLink, NotebookCreateComponent, NotebooksComponent],
    templateUrl: './notes.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotesComponent implements OnInit {
    protected readonly workspaceFacadeService = inject(WORKSPACE_FACADE_SERVICE_TOKEN);
    public readonly appSettingsService = inject(AppSettingsService);

    protected isSidebarOpen: WritableSignal<boolean> = signal(false);
    protected isAddingNotebook: WritableSignal<boolean> = signal(false);


    constructor() {
        effect(() => {
            if (this.workspaceFacadeService.selectedNote() || this.workspaceFacadeService.selectedNotebook()) this.isSidebarOpen.set(false);
        });
    }

    async ngOnInit(): Promise<void> {
        await this.workspaceFacadeService.loadAll();
    }

    protected toggleSidebar() {
        this.isSidebarOpen.update(value => !value);
    }

    protected async addNote(): Promise<void> {
        if (!this.workspaceFacadeService.notebooks().length) return;

        await this.workspaceFacadeService.addNote({
            title: '',
            content: '',
            notebookId: (this.workspaceFacadeService.selectedNotebook()?.id || this.workspaceFacadeService.notebooks()[0].id)!,
            tags: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }
}