
'use client';

import { Editor } from '@tiptap/react';
import { create } from 'zustand';

interface EditorState {
  activeEditor: Editor | null;
  direction: 'ltr' | 'rtl';
  setActiveEditor: (editor: Editor | null) => void;
  setDirection: (dir: 'ltr' | 'rtl') => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  activeEditor: null,
  direction: 'ltr',
  setActiveEditor: (editor) => set({ activeEditor: editor }),
  setDirection: (dir) => set({ direction: dir }),
}));
