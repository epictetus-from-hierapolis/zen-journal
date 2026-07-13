import { ChangeDetectionStrategy, Component, inject, input, output } from "@angular/core";
import { Notebook } from "@shared/models";

@Component({
    selector: "app-notebooks",
    standalone: true,
    imports: [],
    templateUrl: "./notebook.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotebooksComponent {
    public readonly notebooks = input<Notebook[]>([]);
    public readonly selectedNotebook = input<Notebook | null>(null);

    public readonly notebookSelected = output<Notebook | null>();
}