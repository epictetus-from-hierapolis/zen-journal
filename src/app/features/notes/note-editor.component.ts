import { Component, DestroyRef, inject, ChangeDetectionStrategy, signal, HostListener, effect, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, timer } from 'rxjs';
import { debounceTime, distinctUntilChanged, take, tap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Note } from '@shared/models';
import { APP_CONFIG } from '@shared/tokens';
import { WordCountPipe } from '@shared/pipes';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { TiptapEditorDirective } from 'ngx-tiptap';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontSize } from '@shared/editor/font-size.extension';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import FontFamily from '@tiptap/extension-font-family';
import { Indent } from '@shared/editor/indent.extension';

@Component({
    selector: 'app-note-editor',
    standalone: true,
    imports: [FormsModule, WordCountPipe, TiptapEditorDirective],
    templateUrl: './note-editor.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoteEditorComponent {
    private readonly destroyRef = inject(DestroyRef);

    public readonly selectedNote = input<Note | null>(null);
    public readonly savedStatus = input<string>('');
    public readonly noteChanged = output<{ id: number, changes: Partial<Note> }>();
    public readonly noteSaved = output<{ id: number, changes: Partial<Note> }>();
    public readonly noteRemoved = output<number>();
    public readonly noteAdded = output();
    public readonly noteSelected = output<Note | null>();


    protected readonly localSaveStatus = signal<'idle' | 'saving' | 'saved' | 'offline'>('idle');

    private readonly appConfig = inject(APP_CONFIG);

    private readonly autoSave$ = new Subject<{ id: number; changes: Partial<Note> }>();
    protected isMenuOpen = signal(false);
    protected isFontFamilyOpen = signal(false);
    protected isFontSizeOpen = signal(false);
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
            TextStyle,
            Color,
            Highlight.configure({ multicolor: true }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            FontFamily,
            Indent,
            FontSize,
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            Placeholder.configure({
                placeholder: 'Start writing here...',
            })],
        onUpdate: ({ editor }) => {
            const content = editor.getHTML(); // textul formatat HTML introdus de utilizator

            if (this.loadedNoteId && this.loadedNoteId === this.selectedNote()?.id) {
                this.noteChanged.emit({ id: this.loadedNoteId, changes: { content } });
                this.autoSave$.next({ id: this.loadedNoteId, changes: { content } });
            }
        }
    });
    protected get currentFontSize(): string {
        return this.editor.getAttributes('textStyle')['fontSize'] || '';
    }

    protected get currentFontFamily(): string {
        return this.editor.getAttributes('textStyle')['fontFamily'] || '';
    }

    protected onFontSizeChange(event: Event): void {
        const select = event.target as HTMLSelectElement;
        const size = select.value;
        if (size) {
            this.editor.chain().focus().setFontSize(size).run();
        } else {
            this.editor.chain().focus().unsetFontSize().run();
        }
    }

    protected onFontFamilyChange(event: Event): void {
        const select = event.target as HTMLSelectElement;
        const family = select.value;
        if (family) {
            this.editor.chain().focus().setFontFamily(family).run();
        } else {
            this.editor.chain().focus().unsetFontFamily().run();
        }
    }

    protected toggleFontFamily(): void {
        this.isFontFamilyOpen.update(v => !v);
        this.isFontSizeOpen.set(false);
    }

    protected toggleFontSize(): void {
        this.isFontSizeOpen.update(v => !v);
        this.isFontFamilyOpen.set(false);
    }

    protected selectFontFamily(family: string): void {
        if (family) {
            this.editor.chain().focus().setFontFamily(family).run();
        } else {
            this.editor.chain().focus().unsetFontFamily().run();
        }
        this.isFontFamilyOpen.set(false);
    }

    protected selectFontSize(size: string): void {
        if (size) {
            this.editor.chain().focus().setFontSize(size).run();
        } else {
            this.editor.chain().focus().unsetFontSize().run();
        }
        this.isFontSizeOpen.set(false);
    }

    protected scrollSelectIntoView(event: Event): void {
        const element = event.target as HTMLElement;
        element.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }

    protected onTextColorChange(color: string): void {
        this.editor.chain().focus().setColor(color).run();
    }

    protected onBgColorChange(color: string): void {
        this.editor.chain().focus().setHighlight({ color }).run();
    }

    @HostListener('document: click')
    protected closeMenu(): void {
        this.isMenuOpen.set(false);
        this.isFontFamilyOpen.set(false);
        this.isFontSizeOpen.set(false);
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
            tap(({ id, changes }) => this.noteSaved.emit({ id, changes: { ...changes, updatedAt: new Date() } })),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe();

        effect(() => {
            const note = this.selectedNote();
            if (this.loadedNoteId !== note?.id) {
                this.editor.commands.setContent(note?.content ?? '');
                this.loadedNoteId = note?.id;
            }
        });

        effect(() => {
            const status = this.savedStatus();

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

    protected onTitleChange(event: Event): void {
        const title = (event.target! as HTMLInputElement).value;
        const id = this.selectedNote()?.id;
        if (id) {
            this.noteChanged.emit({ id, changes: { title } });
            this.autoSave$.next({ id, changes: { title } });
        }
    }

    protected onNoteRemove() {
        const id = this.selectedNote()?.id;
        if (!id) return;
        this.noteRemoved.emit(id);
    }

    protected toggleMenu(event: Event) {
        event.stopPropagation();
        this.isMenuOpen.update(value => !value);
    }
}