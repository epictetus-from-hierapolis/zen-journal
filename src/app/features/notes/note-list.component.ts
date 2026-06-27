import { ChangeDetectionStrategy, Component, HostListener, WritableSignal, input, output, signal } from "@angular/core";
import { Note, Notebook } from '@shared/models';
import { ScrollingModule } from "@angular/cdk/scrolling";
import { RelativeTimePipe } from "@shared/pipes";
import { ModalComponent } from "@shared/components";

@Component({
    selector: 'app-note-list',
    standalone: true,
    imports: [RelativeTimePipe, ScrollingModule, ModalComponent],
    templateUrl: './note-list.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoteListComponent {
    public readonly notes = input<Note[]>([]);
    public readonly selectedNotebook = input<Notebook | null>(null);
    public readonly selectedNote = input<Note | null>(null);
    public readonly noteSelected = output<Note>();
    public readonly savedStatus = input<string>('');
    public readonly notebookRenamed = output<{ id: number, name: string }>();
    public readonly notebookRemoved = output<number>();
    public readonly notesCount = input<number>(0);
    public readonly notebooksCount = input<number>(0);
    public readonly isLoading = input<boolean>(false);

    protected readonly isRenameModalOpen: WritableSignal<boolean> = signal(false);
    protected readonly isRemoveModalOpen: WritableSignal<boolean> = signal(false);
    protected readonly isMenuOpen: WritableSignal<boolean> = signal(false);
    protected readonly notebookName: WritableSignal<string> = signal('');

    protected trackNote(index: number, note: Note) {
        return note.id!;
    }

    protected onRenameOpen(): void {
        const selectedNotebook = this.selectedNotebook();
        if (!selectedNotebook) return;
        this.isRenameModalOpen.set(true);
        this.isMenuOpen.set(false);
        this.notebookName.set(selectedNotebook.name);
    }

    protected onNotebookNameChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.notebookName.set(input.value);
    }

    protected onNotebookRename(): void {
        const selectedNotebook = this.selectedNotebook();
        const notebookName = this.notebookName();
        if (!selectedNotebook || !notebookName.trim()) return;
        this.notebookRenamed.emit({ id: selectedNotebook.id!, name: notebookName });
        this.isRenameModalOpen.set(false);
    }

    protected toggleMenu(event: Event): void {
        event.stopPropagation();
        this.isMenuOpen.update(value => !value);
    }

    protected onCancel(): void {
        const selectedNotebook = this.selectedNotebook();
        if (!selectedNotebook || !this.notebookName().trim()) return;
        this.notebookName.set(selectedNotebook.name);
        this.isRenameModalOpen.set(false);
    }

    protected onRemoveOpen(): void {
        this.isMenuOpen.set(false);
        this.isRemoveModalOpen.set(true);
    }

    protected onRemoveCancel(): void {
        this.isRemoveModalOpen.set(false);
    }

    protected onRemoveConfirm(): void {
        const selectedNotebook = this.selectedNotebook();
        if (!selectedNotebook) return;
        this.notebookRemoved.emit(selectedNotebook.id!);
        this.isRemoveModalOpen.set(false);
    }

    @HostListener('document: click')
    protected closeMenu(): void {
        this.isMenuOpen.set(false);
    }
}