import { ChangeDetectionStrategy, Component, HostListener, OnInit, WritableSignal, inject, signal } from "@angular/core";
import { Note } from '../../shared/models/note.model';
import { NOTES_SERVICE_TOKEN } from "../../shared/services/notes.token";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { RelativeTimePipe } from "../../shared/ui/relative-time.pipe";
import { NOTEBOOKS_SERVICE_TOKEN } from "../../shared/services/notebooks.token";
import { FormsModule } from "@angular/forms";

@Component({
    selector: 'app-note-list',
    standalone: true,
    imports: [RelativeTimePipe, ScrollingModule, FormsModule],
    templateUrl: './note-list.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoteListComponent implements OnInit {
    protected readonly notesService = inject(NOTES_SERVICE_TOKEN);
    protected readonly notebooksService = inject(NOTEBOOKS_SERVICE_TOKEN);

    protected isRenameModalOpen: WritableSignal<boolean> = signal(false);
    protected isRemoveModalOpen: WritableSignal<boolean> = signal(false);
    protected isMenuOpen: WritableSignal<boolean> = signal(false);
    protected notebookNameInput: WritableSignal<string> = signal('');


    public async ngOnInit(): Promise<void> {
        await this.notesService.loadNotes();
    }

    protected selectNote(note: Note): void {
        this.notesService.selectNote(note);
    }

    protected trackNote(index: number, note: Note) {
        return note.id!;
    }

    protected onOpenRename(): void {
        const selectedNotebook = this.notebooksService.selectedNotebook();
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
        const selectedNotebook = this.notebooksService.selectedNotebook();
        if (!selectedNotebook || !this.notebookNameInput().trim()) return;
        await this.notebooksService.updateNotebook(selectedNotebook.id!, { name: this.notebookNameInput() });
        this.isRenameModalOpen.set(false);
    }

    protected toggleMenu(event: Event): void {
        event.stopPropagation();
        this.isMenuOpen.update(value => !value);
    }

    protected onCancel(): void {
        const selectedNotebook = this.notebooksService.selectedNotebook();
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
        const selectedNotebook = this.notebooksService.selectedNotebook();
        if (!selectedNotebook) return;
        try {
            this.notesService.removeNotesByNotebookId(selectedNotebook?.id!);
            await this.notebooksService.deleteNotebook(selectedNotebook?.id!);
        } catch (error) {
            this.notesService.loadNotes();
            throw error;
        }
        this.isRemoveModalOpen.set(false);
    }

    @HostListener('document: click')
    protected closeMenu(): void {
        this.isMenuOpen.set(false);
    }
}