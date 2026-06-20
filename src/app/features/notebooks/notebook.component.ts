import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from "@angular/core";
import { NOTEBOOKS_SERVICE_TOKEN } from "../../shared/services/notebooks.token";
import { Notebook } from "../../shared/models/note.model";

@Component({
    selector: "app-notebooks",
    standalone: true,
    imports: [],
    templateUrl: "./notebook.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotebooksComponent implements OnInit {
    protected readonly notebooksService = inject(NOTEBOOKS_SERVICE_TOKEN);

    public async ngOnInit(): Promise<void> {
        this.notebooksService.loadNotebooks();
    }

    protected selectNotebook(notebook: Notebook): void {
        this.notebooksService.selectNotebook(notebook);
    }
}