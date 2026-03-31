'use client';

import { Editor } from '@tiptap/react';
import { useEditorStore } from '@/modules/ai-content/adapters/state/use-editor-store';
import { useMemo } from 'react';

/**
 * EditorController provides a clean imperative API to interact with the Tiptap editor
 * while ensuring the global editor store remains synchronized.
 */
export class EditorController {
    constructor(private editor: Editor, private updateStore: (editor: Editor) => void) {}

    private execute(command: () => boolean) {
        const result = command();
        if (result) {
            this.updateStore(this.editor);
        }
        return result;
    }

    // --- Basic Formatting ---
    toggleBold = () => this.execute(() => this.editor.chain().focus().toggleBold().run());
    isBold = () => this.editor.isActive('bold');

    toggleItalic = () => this.execute(() => this.editor.chain().focus().toggleItalic().run());
    isItalic = () => this.editor.isActive('italic');

    toggleStrike = () => this.execute(() => this.editor.chain().focus().toggleStrike().run());
    isStrike = () => this.editor.isActive('strike');

    toggleUnderline = () => this.execute(() => (this.editor.chain().focus() as any).toggleUnderline().run());
    isUnderline = () => this.editor.isActive('underline');

    // --- Headings ---
    setParagraph = () => this.execute(() => this.editor.chain().focus().setParagraph().run());
    isParagraph = () => this.editor.isActive('paragraph');

    toggleHeading = (level: 1 | 2 | 3) => this.execute(() => this.editor.chain().focus().toggleHeading({ level }).run());
    isHeading = (level: 1 | 2 | 3) => this.editor.isActive('heading', { level });

    // --- Font Size & Color ---
    setFontSize = (size: string) => this.execute(() => (this.editor.chain().focus() as any).setFontSize(size).run());
    isFontSize = (size: string) => this.editor.isActive('textStyle', { fontSize: size });
    
    setColor = (color: string) => this.execute(() => this.editor.chain().focus().setColor(color).run());
    isColor = (color: string) => this.editor.isActive('textStyle', { color });

    // --- Alignment ---
    setTextAlign = (alignment: 'left' | 'center' | 'right' | 'justify') => this.execute(() => this.editor.chain().focus().setTextAlign(alignment).run());
    isTextAlign = (alignment: 'left' | 'center' | 'right' | 'justify') => this.editor.isActive({ textAlign: alignment });

    // --- Lists ---
    toggleBulletList = () => this.execute(() => this.editor.chain().focus().toggleBulletList().run());
    isBulletList = () => this.editor.isActive('bulletList');

    toggleOrderedList = () => this.execute(() => this.editor.chain().focus().toggleOrderedList().run());
    isOrderedList = () => this.editor.isActive('orderedList');

    // --- Blocks ---
    toggleBlockquote = () => this.execute(() => this.editor.chain().focus().toggleBlockquote().run());
    isBlockquote = () => this.editor.isActive('blockquote');

    toggleCodeBlock = () => this.execute(() => this.editor.chain().focus().toggleCodeBlock().run());
    isCodeBlock = () => this.editor.isActive('codeBlock');

    // --- Tables ---
    insertTable = (rows = 3, cols = 3) => this.execute(() => this.editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run());
    isTable = () => this.editor.isActive('table');
    
    // --- Utils ---
    undo = () => this.execute(() => this.editor.chain().focus().undo().run());
    redo = () => this.execute(() => this.editor.chain().focus().redo().run());
    
    insertMath = () => {
        const formula = window.prompt('Enter LaTeX formula');
        if (formula) {
          this.execute(() => this.editor.chain().focus().insertContent(`<katex-component content="${formula}"></katex-component>`).run());
        }
    };
}

/**
 * Hook to access the EditorController for the active editor
 */
export function useEditorController(providedEditor?: Editor | null) {
    const activeEditor = useEditorStore(state => state.activeEditor);
    const updateSelectionState = useEditorStore(state => state.updateSelectionState);
    
    const editor = providedEditor || activeEditor;
    
    return useMemo(() => {
        if (!editor) return null;
        return new EditorController(editor, updateSelectionState);
    }, [editor, updateSelectionState]);
}
