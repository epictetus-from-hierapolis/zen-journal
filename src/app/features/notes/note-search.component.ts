import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild, afterNextRender, effect, Input } from "@angular/core";
import { SnippetPipe } from "../../shared/ui/snipet.pipe";
import { Note } from "../../shared/models/note.model";
import { WORKSPACE_FACADE_SERVICE_TOKEN } from "../../shared/services/workspace-facade.token";

@Component({
    selector: 'app-note-search',
    standalone: true,
    imports: [SnippetPipe],
    templateUrl: './note-search.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoteSearchComponent {
    @Input() public mode: 'full' | 'icon' = 'full';
    protected readonly workspaceFacadeService = inject(WORKSPACE_FACADE_SERVICE_TOKEN);


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

    protected onOpen(): void {
        this.isOpen.set(true);
    }

    protected onClose(): void {
        this.isOpen.set(false);
        this.searchInput.set('');
        this.workspaceFacadeService.searchQuery$.next('');
    }

    protected onClear() {
        this.searchInput.set('');
        this.workspaceFacadeService.searchQuery$.next('');
        this.searchInputEl()?.nativeElement.focus();
    }

    protected onSearch(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.searchInput.set(input.value);
        this.workspaceFacadeService.searchQuery$.next(input.value);
    }

    protected onSnippetClick(note: Note): void {
        this.workspaceFacadeService.selectNote(note);
        this.onClose();
    }
}