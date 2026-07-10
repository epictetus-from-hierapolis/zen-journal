import { Extension } from '@tiptap/core';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        indent: {
            indent: () => ReturnType;
            outdent: () => ReturnType;
        }
    }
}

export const Indent = Extension.create({
    name: 'indent',

    addOptions() {
        return {
            types: ['paragraph', 'heading'],
            minIndent: 0,
            maxIndent: 8,
            indentWidth: 24,
        };
    },

    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    indent: {
                        default: null,
                        parseHTML: element => {
                            const paddingLeft = element.style.paddingLeft || '';
                            const match = paddingLeft.match(/^(\d+)px$/);
                            if (!match) return null;
                            const val = parseInt(match[1], 10) / this.options.indentWidth;
                            return val > 0 ? val : null;
                        },
                        renderHTML: attributes => {
                            if (!attributes['indent']) {
                                return {};
                            }
                            return {
                                style: `padding-left: ${attributes['indent'] * this.options.indentWidth}px`,
                            };
                        },
                    },
                },
            },
        ];
    },

    addCommands() {
        return {
            indent: () => ({ tr, state, dispatch }) => {
                const { selection } = state;
                tr.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
                    if (this.options.types.includes(node.type.name)) {
                        const currentIndent = node.attrs['indent'] || 0;
                        const nextIndent = Math.min(currentIndent + 1, this.options.maxIndent);
                        tr.setNodeMarkup(pos, undefined, {
                            ...node.attrs,
                            indent: nextIndent,
                        });
                    }
                });
                if (dispatch) dispatch(tr);
                return true;
            },
            outdent: () => ({ tr, state, dispatch }) => {
                const { selection } = state;
                tr.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
                    if (this.options.types.includes(node.type.name)) {
                        const currentIndent = node.attrs['indent'] || 0;
                        const nextIndent = Math.max(currentIndent - 1, this.options.minIndent);
                        tr.setNodeMarkup(pos, undefined, {
                            ...node.attrs,
                            indent: nextIndent > 0 ? nextIndent : null,
                        });
                    }
                });
                if (dispatch) dispatch(tr);
                return true;
            },
        };
    },
});
