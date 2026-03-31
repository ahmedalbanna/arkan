'use client';

import { create } from 'zustand';
import { Editor } from '@tiptap/react';

interface SelectionState {
  isBold: boolean;
  isItalic: boolean;
  isStrike: boolean;
  isBulletList: boolean;
  isOrderedList: boolean;
  isBlockquote: boolean;
  isCodeBlock: boolean;
  activeHeading: 1 | 2 | 3 | null;
  activeFontSize: string | null;
  activeColor: string | null;
  textAlign: 'left' | 'center' | 'right' | 'justify';
}

interface EditorState {
  activeEditor: Editor | null;
  direction: 'ltr' | 'rtl';
  selection: SelectionState;
  
  setActiveEditor: (editor: Editor | null) => void;
  setDirection: (dir: 'ltr' | 'rtl') => void;
  updateSelectionState: (editor: Editor) => void;
}

const initialSelection: SelectionState = {
  isBold: false,
  isItalic: false,
  isStrike: false,
  isBulletList: false,
  isOrderedList: false,
  isBlockquote: false,
  isCodeBlock: false,
  activeHeading: null,
  activeFontSize: null,
  activeColor: null,
  textAlign: 'left',
};

export const useEditorStore = create<EditorState>((set) => ({
  activeEditor: null,
  direction: 'ltr',
  selection: initialSelection,
  
  setActiveEditor: (editor) => set({ activeEditor: editor }),
  setDirection: (dir) => set({ direction: dir }),
  
  updateSelectionState: (editor) => {
    if (!editor) return;
    
    set({
      selection: {
        isBold: editor.isActive('bold'),
        isItalic: editor.isActive('italic'),
        isStrike: editor.isActive('strike'),
        isBulletList: editor.isActive('bulletList'),
        isOrderedList: editor.isActive('orderedList'),
        isBlockquote: editor.isActive('blockquote'),
        isCodeBlock: editor.isActive('codeBlock'),
        activeHeading: editor.isActive('heading', { level: 1 }) ? 1 : 
                       editor.isActive('heading', { level: 2 }) ? 2 : 
                       editor.isActive('heading', { level: 3 }) ? 3 : null,
        activeFontSize: editor.getAttributes('textStyle').fontSize || null,
        activeColor: editor.getAttributes('textStyle').color || null,
        textAlign: editor.isActive({ textAlign: 'center' }) ? 'center' :
                   editor.isActive({ textAlign: 'right' }) ? 'right' :
                   editor.isActive({ textAlign: 'justify' }) ? 'justify' : 'left',
      }
    });
  },
}));
