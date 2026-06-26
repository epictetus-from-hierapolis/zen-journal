import { ChangeDetectionStrategy, Component, HostListener, WritableSignal, inject, signal } from "@angular/core";
import { Note } from '@shared/models';
import { ScrollingModule } from "@angular/cdk/scrolling";
import { RelativeTimePipe } from "@shared/pipes";
import { WORKSPACE_FACADE_SERVICE_TOKEN } from "@shared/tokens";
import { ModalComponent } from "@shared/components";

@Component({
    selector: 'app-note-list',
    standalone: true,
    imports: [RelativeTimePipe, ScrollingModule, ModalComponent],
    templateUrl: './note-list.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoteListComponent {
    protected readonly workspaceFacadeService = inject(WORKSPACE_FACADE_SERVICE_TOKEN);

    protected isRenameModalOpen: WritableSignal<boolean> = signal(false);
    protected isRemoveModalOpen: WritableSignal<boolean> = signal(false);
    protected isMenuOpen: WritableSignal<boolean> = signal(false);
    protected notebookNameInput: WritableSignal<string> = signal('');

    protected trackNote(index: number, note: Note) {
        return note.id!;
    }

    protected onOpenRename(): void {
        const selectedNotebook = this.workspaceFacadeService.selectedNotebook();
        if (!selectedNotebook) return;
        this.isRenameModalOpen.set(true);
        this.isMenuOpen.set(false);
        this.notebookNameInput.set(selectedNotebook.name);
    }

    protected onInputChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.notebookNameInput.set(input.value);
    }

    protected async onSaveRename(): Promise<void> {
        const selectedNotebook = this.workspaceFacadeService.selectedNotebook();
        if (!selectedNotebook || !this.notebookNameInput().trim()) return;
        await this.workspaceFacadeService.updateNotebook(selectedNotebook.id!, { name: this.notebookNameInput() });
        this.isRenameModalOpen.set(false);
    }

    protected toggleMenu(event: Event): void {
        event.stopPropagation();
        this.isMenuOpen.update(value => !value);
    }

    protected onCancel(): void {
        const selectedNotebook = this.workspaceFacadeService.selectedNotebook();
        if (!selectedNotebook || !this.notebookNameInput().trim()) return;
        this.notebookNameInput.set(selectedNotebook.name);
        this.isRenameModalOpen.set(false);
    }

    protected onOpenRemove(): void {
        this.isMenuOpen.set(false);
        this.isRemoveModalOpen.set(true);
    }

    protected onCancelRemove(): void {
        this.isRemoveModalOpen.set(false);
    }

    protected async onConfirmRemove(): Promise<void> {
        const selectedNotebook = this.workspaceFacadeService.selectedNotebook();
        if (!selectedNotebook) return;
        try {
            await this.workspaceFacadeService.deleteNotebook(selectedNotebook?.id!);
        } catch (error) {
            throw error;
        }
        this.isRemoveModalOpen.set(false);
    }

    @HostListener('document: click')
    protected closeMenu(): void {
        this.isMenuOpen.set(false);
    }
}