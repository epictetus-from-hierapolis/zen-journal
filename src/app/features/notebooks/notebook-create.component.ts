import { Component, ChangeDetectionStrategy, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { WORKSPACE_FACADE_SERVICE_TOKEN } from "../../shared/services/workspace-facade.token";

@Component({
    selector: "app-notebook-create",
    standalone: true,
    imports: [FormsModule],
    templateUrl: "./notebook-create.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotebookCreateComponent {
    private readonly workspaceFacadeService = inject(WORKSPACE_FACADE_SERVICE_TOKEN);

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
        await this.workspaceFacadeService.addNotebook(this.notebookName());
        this.isOpen.set(false);
        this.notebookName.set('');
    }
}