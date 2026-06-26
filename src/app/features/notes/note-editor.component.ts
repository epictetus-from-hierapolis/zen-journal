import { Component, DestroyRef, inject, ChangeDetectionStrategy, signal, HostListener, effect, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { from, Subject, timer } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, take } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Note } from '@shared/models';
import { APP_CONFIG } from '@shared/tokens';
import { WordCountPipe } from '@shared/pipes';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { TiptapEditorDirective } from 'ngx-tiptap';
import { WORKSPACE_FACADE_SERVICE_TOKEN } from '@shared/tokens';
import Placeholder from '@tiptap/extension-placeholder';

@Component({
    selector: 'app-note-editor',
    standalone: true,
    imports: [FormsModule, WordCountPipe, TiptapEditorDirective],
    templateUrl: './note-editor.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoteEditorComponent {
    protected readonly workspaceFacadeService = inject(WORKSPACE_FACADE_SERVICE_TOKEN);
    private readonly destroyRef = inject(DestroyRef);

    protected readonly localSaveStatus = signal<'idle' | 'saving' | 'saved' | 'offline'>('idle');

    private readonly appConfig = inject(APP_CONFIG);

    private readonly autoSave$ = new Subject<{ id: number; changes: Partial<Note> }>();
    protected isMenuOpen = signal<boolean>(false);
    protected saveStatus = computed(() => {
        switch (this.localSaveStatus()) {
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
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Start writing here...',
            })],
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

        effect(() => {
            const status = this.workspaceFacadeService.saveStatus();

            if (status === 'saving' || status === 'offline') {
                this.localSaveStatus.set(status);
            } else if (status === 'saved') {
                this.localSaveStatus.set('saved');
                timer(2000).pipe(
                    take(1),
                    takeUntilDestroyed(this.destroyRef)
                ).subscribe(() => {
                    this.localSaveStatus.set('idle');
                });
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