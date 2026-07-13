import { Component, ChangeDetectionStrategy, signal, output } from "@angular/core";
import { ModalComponent } from "@shared/components";

@Component({
    selector: "app-notebook-create",
    standalone: true,
    imports: [ModalComponent],
    templateUrl: "./notebook-create.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotebookCreateComponent {
    public readonly notebookAdded = output<string>();
    protected readonly notebookName = signal<string>('');
    public readonly close = output<void>();

    protected onCancel(): void {
        this.notebookName.set('');
        this.close.emit();
    }

    protected onNameChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.notebookName.set(input.value);
    }

    protected async onConfirm(): Promise<void> {
        if (!this.notebookName()) return;
        this.notebookAdded.emit(this.notebookName());
        this.notebookName.set('');
        this.close.emit();
    }
}