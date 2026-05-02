import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild, afterNextRender, effect } from "@angular/core";
import { NOTES_SERVICE_TOKEN } from "../../shared/services/notes.token";
import { SnippetPipe } from "../../shared/ui/snipet.pipe";
import { Note } from "../../shared/models/note.model";

@Component({
    selector: 'app-note-search',
    standalone: true,
    imports: [SnippetPipe],
    templateUrl: './note-search.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoteSearchComponent {
    protected readonly notesService = inject(NOTES_SERVICE_TOKEN);

    protected isOpen = signal<boolean>(false);
    protected searchInput = signal<string>('');
    protected searchInputEl = viewChild<ElementRef<HTMLInputElement>>('searchInputEl');

    constructor() {
        effect(() => {
            if (this.isOpen()) {
                this.searchInputEl()?.nativeElement.focus();
            }
        });
    }

    public onOpen(): void {
        this.isOpen.set(true);

    }

    public onClose(): void {
        this.isOpen.set(false);
        this.searchInput.set('');
        this.notesService.searchQuery$.next('');
    }

    public onSearch(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.searchInput.set(input.value);
        this.notesService.searchQuery$.next(input.value);
    }

    public onSnippetClick(note: Note): void {
        this.notesService.selectNote(note);
        this.onClose();
    }
}