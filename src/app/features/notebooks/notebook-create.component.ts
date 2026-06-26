import { Component, ChangeDetectionStrategy, inject, signal } from "@angular/core";
import { WORKSPACE_FACADE_SERVICE_TOKEN } from "@shared/tokens";
import { ModalComponent } from "@shared/components";

@Component({
    selector: "app-notebook-create",
    standalone: true,
    imports: [ModalComponent],
    templateUrl: "./notebook-create.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotebookCreateComponent {
    private readonly workspaceFacadeService = inject(WORKSPACE_FACADE_SERVICE_TOKEN);

    protected readonly isOpen = signal<boolean>(false);
    protected readonly notebookName = signal<string>('');

    protected onOpen(): void {
        this.isOpen.set(true);
    }

    protected onCancel(): void {
        this.isOpen.set(false);
        this.notebookName.set('');
    }

    protected onInputChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.notebookName.set(input.value);
    }

    protected async onConfirm(): Promise<void> {
        if (!this.notebookName()) return;
        await this.workspaceFacadeService.addNotebook(this.notebookName());
        this.isOpen.set(false);
        this.notebookName.set('');
    }
}