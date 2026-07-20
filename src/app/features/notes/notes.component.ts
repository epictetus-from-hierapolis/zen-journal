import { ChangeDetectionStrategy, Component, effect, inject, OnInit, signal, WritableSignal } from "@angular/core";
import { NoteListComponent, NoteEditorComponent, NoteSearchComponent } from '.';
import { AuthService } from "@core/services";
import { RouterLink } from "@angular/router";
import { NotebookCreateComponent, NotebooksComponent } from '../notebooks';
import { WORKSPACE_FACADE_SERVICE_TOKEN } from "@shared/tokens";
import { Notebook } from "@shared/models";


@Component({
    selector: 'app-notes',
    standalone: true,
    imports: [NoteListComponent, NoteEditorComponent, NoteSearchComponent,
        RouterLink, NotebookCreateComponent, NotebooksComponent],
    templateUrl: './notes.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotesComponent implements OnInit {
    protected readonly workspaceFacadeService = inject(WORKSPACE_FACADE_SERVICE_TOKEN);
    protected readonly authSevice = inject(AuthService);


    protected isSidebarOpen: WritableSignal<boolean> = signal(false);
    protected isNotebooksExpanded: WritableSignal<boolean> = signal(true);
    protected isCreateNotebookModalOpen: WritableSignal<boolean> = signal(false);

    protected readonly isSearchModalOpen = signal<boolean>(false);

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

    protected openSearch(): void {
        this.isSearchModalOpen.set(true);
    }

    protected closeSearch(): void {
        this.isSearchModalOpen.set(false);
    }

    protected closeNotebookCreate(): void {
        this.isCreateNotebookModalOpen.set(false);
    }

    protected openNotebookCreate(): void {
        this.isCreateNotebookModalOpen.set(true);
    }

    protected selectNotebook(notebook: Notebook | null): void {
        this.workspaceFacadeService.selectNotebook(notebook);
        this.workspaceFacadeService.selectNote(null);
        this.isSidebarOpen.set(false);
    }


}