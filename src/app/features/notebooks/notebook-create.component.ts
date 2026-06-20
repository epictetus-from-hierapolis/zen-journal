import { Component, ChangeDetectionStrategy, inject, signal } from "@angular/core";
import { NOTEBOOKS_SERVICE_TOKEN } from "../../shared/services/notebooks.token";
import { FormsModule } from "@angular/forms";

@Component({
    selector: "app-notebook-create",
    standalone: true,
    imports: [FormsModule],
    templateUrl: "./notebook-create.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotebookCreateComponent {
    private readonly notebooksService = inject(NOTEBOOKS_SERVICE_TOKEN);

    protected isOpen = signal<boolean>(false);
    protected notebookName = signal<string>('');

    protected onOpen(): void {
        this.isOpen.set(true);
    }

    protected onCancel() {
        this.isOpen.set(false);
        this.notebookName.set('');
    }

    protected onInputChange(event: Event) {
        const input = event.target as HTMLInputElement;
        this.notebookName.set(input.value);
    }

    public async onCreate(): Promise<void> {
        if (!this.notebookName()) return;
        await this.notebooksService.addNotebook(this.notebookName());
        this.isOpen.set(false);
        this.notebookName.set('');
    }
}