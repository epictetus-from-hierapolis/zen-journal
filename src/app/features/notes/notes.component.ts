import { ChangeDetectionStrategy, Component, effect, inject, OnInit, signal, WritableSignal } from "@angular/core";
import { NoteListComponent, NoteEditorComponent, NoteSearchComponent } from '.';
import { AppSettingsService } from "@core/services";
import { RouterLink } from "@angular/router";
import { NotebookCreateComponent, NotebooksComponent } from '../notebooks';
import { WORKSPACE_FACADE_SERVICE_TOKEN } from "@shared/tokens";


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
    protected isNotebooksExpanded: WritableSignal<boolean> = signal(false);

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
}