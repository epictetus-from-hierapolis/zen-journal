import { ChangeDetectionStrategy, Component, inject, OnInit } from "@angular/core";
import { Notebook } from "../../shared/models/note.model";
import { WORKSPACE_FACADE_SERVICE_TOKEN } from "../../shared/services/workspace-facade.token";

@Component({
    selector: "app-notebooks",
    standalone: true,
    imports: [],
    templateUrl: "./notebook.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotebooksComponent {
    protected readonly workspaceFacadeService = inject(WORKSPACE_FACADE_SERVICE_TOKEN);
}