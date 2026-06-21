import { Component, DestroyRef, inject, ChangeDetectionStrategy, signal, HostListener, effect, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { from, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Note } from '../../shared/models/note.model';
import { APP_CONFIG } from '../../shared/config/app.config.token';
import { WordCountPipe } from '../../shared/ui/word-count.pipe';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { TiptapEditorDirective } from 'ngx-tiptap';
import { WORKSPACE_FACADE_SERVICE_TOKEN } from '../../shared/services/workspace-facade.token';

@Component({
    selector: 'app-note-editor',
    standalone: true,
    imports: [FormsModule, WordCountPipe, TiptapEditorDirective],
    templateUrl: './note-editor.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoteEditorComponent {

    private readonly destroyRef = inject(DestroyRef);
    protected readonly workspaceFacadeService = inject(WORKSPACE_FACADE_SERVICE_TOKEN);

    private readonly appConfig = inject(APP_CONFIG);

    private readonly autoSave$ = new Subject<{ id: number; changes: Partial<Note> }>();
    protected isMenuOpen = signal<boolean>(false);
    protected saveStatus = computed(() => {
        switch (this.workspaceFacadeService.saveStatus()) {
            case 'saving':
                return 'Saving...';
            case 'saved':
                return 'Saved';
            case 'offline':
                return 'Offline';
            default:
                return undefined;
        }
    });
    private loadedNoteId: undefined | number = undefined;
    protected readonly editor = new Editor({
        extensions: [StarterKit],
        onUpdate: ({ editor }) => {
            const content = editor.getHTML(); // textul formatat HTML introdus de utilizator

            if (this.loadedNoteId && this.loadedNoteId === this.workspaceFacadeService.selectedNote()?.id) {
                this.workspaceFacadeService.applyOptimisticUpdate(this.loadedNoteId, { content });
                this.autoSave$.next({ id: this.loadedNoteId, changes: { content } });
            }
        }
    });


    @HostListener('document: click')
    protected closeMenu(): void {
        this.isMenuOpen.set(false);
    }

    constructor() {
        this.autoSave$.pipe(
            debounceTime(this.appConfig.autosaveDelay),
            distinctUntilChanged((prev, curr) =>
                prev.id === curr.id &&
                Object.keys(curr.changes).every(key =>
                    prev.changes[key as keyof Note] === curr.changes[key as keyof Note]
                )
            ),
            switchMap(({ id, changes }) => from(this.workspaceFacadeService.updateNote(id, { ...changes, updatedAt: new Date() }))),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe();

        effect(() => {
            const note = this.workspaceFacadeService.selectedNote();
            if (this.loadedNoteId !== note?.id) {
                this.editor.commands.setContent(note?.content ?? '');
                this.loadedNoteId = note?.id;
            }
        });

        this.destroyRef.onDestroy(() => {
            this.editor.destroy();
        });
    }

    protected onInputChange(event: Event): void {
        const title = (event.target! as HTMLInputElement).value;
        const id = this.workspaceFacadeService.selectedNote()?.id;
        if (id) {
            this.workspaceFacadeService.applyOptimisticUpdate(id, { title });
            this.autoSave$.next({ id, changes: { title } });
        }
    }

    protected deleteNote() {
        const id = this.workspaceFacadeService.selectedNote()?.id;
        if (!id) return;
        this.workspaceFacadeService.deleteNote(id);
    }

    protected toggleMenu(event: Event) {
        event.stopPropagation();
        this.isMenuOpen.update(value => !value);
    }
}