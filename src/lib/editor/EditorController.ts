// @ts-nocheck

'use client';

import { Editor } from '@tiptap/react';

export class EditorController {
  constructor(private editor: Editor) { }

  // --- Basic Formatting ---
  toggleBold = () => this.editor.chain().focus().toggleBold().run();
  isBold = () => this.editor.isActive('bold');

  toggleItalic = () => this.editor.chain().focus().toggleItalic().run();
  isItalic = () => this.editor.isActive('italic');

  toggleStrike = () => this.editor.chain().focus().toggleStrike().run();
  isStrike = () => this.editor.isActive('strike');

  // --- Headings ---
  setParagraph = () => this.editor.chain().focus().setParagraph().run();
  isParagraph = () => this.editor.isActive('paragraph');

  toggleHeading = (level: 1 | 2 | 3) => this.editor.chain().focus().toggleHeading({ level }).run();
  isHeading = (level: 1 | 2 | 3) => this.editor.isActive('heading', { level });

  // --- Font Size & Color ---
  // @ts-expect-error - TipTap extension command
  setFontSize = (size: string) => this.editor.chain().focus().setFontSize(size).run();
  isFontSize = (size: string) => this.editor.isActive('textStyle', { fontSize: size });

  setColor = (color: string) => this.editor.chain().focus().setColor(color).run();
  isColor = (color: string) => this.editor.isActive('textStyle', { color });

  // --- Alignment ---
  setTextAlign = (alignment: 'left' | 'center' | 'right') => this.editor.chain().focus().setTextAlign(alignment).run();
  isTextAlign = (alignment: 'left' | 'center' | 'right') => this.editor.isActive({ textAlign: alignment });

  // --- Lists ---
  toggleBulletList = () => this.editor.chain().focus().toggleBulletList().run();
  isBulletList = () => this.editor.isActive('bulletList');

  toggleOrderedList = () => this.editor.chain().focus().toggleOrderedList().run();
  isOrderedList = () => this.editor.isActive('orderedList');

  // --- Blocks ---
  toggleBlockquote = () => this.editor.chain().focus().toggleBlockquote().run();
  isBlockquote = () => this.editor.isActive('blockquote');

  insertTable = (rows = 3, cols = 3) => this.editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
  isTable = () => this.editor.isActive('table');

  insertMath = () => {
    const formula = window.prompt('Enter LaTeX formula');
    if (formula) {
      this.editor.chain().focus().insertContent(`<katex-component content="${formula}"></katex-component>`).run();
    }
  };
}
