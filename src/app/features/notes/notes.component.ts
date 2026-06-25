import { ChangeDetectionStrategy, Component, effect, inject, OnInit, signal, WritableSignal } from "@angular/core";
import { NoteListComponent } from "./note-list.component";
import { NoteEditorComponent } from "./note-editor.component";
import { NoteSearchComponent } from "./note-search.component";
import { AppSettingsService } from "../../shared/services/app-settings.service";
import { NavigationEnd, Router, RouterLink, RouterOutlet } from "@angular/router";
import { NotebookCreateComponent } from "../notebooks/notebook-create.component";
import { NotebooksComponent } from "../notebooks/notebook.component";
import { WORKSPACE_FACADE_SERVICE_TOKEN } from "../../shared/services/workspace-facade.token";
import { toSignal } from "@angular/core/rxjs-interop";
import { filter, map } from "rxjs";


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
    private readonly routerService = inject(Router);


    protected isSidebarOpen: WritableSignal<boolean> = signal(false);
    protected isAddingNotebook: WritableSignal<boolean> = signal(false);
    protected isNotebooksExpanded: WritableSignal<boolean> = signal(false);

    protected readonly isNoteSelected = toSignal(
        this.routerService.events.pipe(
            filter(event => event instanceof NavigationEnd),
            map(() => this.routerService.url.includes('/notes/') && this.routerService.url.split('/').length > 2)
        ),
        {
            initialValue: this.routerService.url.includes('/notes/') && this.routerService.url.split('/').length > 2
        }
    );


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