import { ChangeDetectionStrategy, Component, ElementRef, signal, viewChild, effect, input, output } from "@angular/core";
import { SnippetPipe } from "@shared/pipes";
import { Note } from "@shared/models";

@Component({
    selector: 'app-note-search',
    standalone: true,
    imports: [SnippetPipe],
    templateUrl: './note-search.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoteSearchComponent {
    public readonly notes = input<Note[]>([]);
    public readonly queryChanged = output<string>();
    public readonly noteSelected = output<Note>();
    public readonly close = output<void>();

    protected readonly query = signal<string>('');
    protected searchInputElement = viewChild<ElementRef<HTMLInputElement>>('searchInputElement');

    constructor() {
        const input = this.searchInputElement();
        effect(() => {
            if (input) {
                this.searchInputElement()?.nativeElement.focus();
            }
        });
    }

    protected onClose(): void {
        this.query.set('');
        this.queryChanged.emit('');
        this.close.emit();
    }

    protected onClear() {
        this.query.set('');
        this.queryChanged.emit('');
        this.searchInputElement()?.nativeElement.focus();
    }

    protected onSearch(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.query.set(input.value);
        this.queryChanged.emit(input.value);
    }

    protected onSnippetSelect(note: Note): void {
        this.noteSelected.emit(note);
        this.onClose();
    }
}