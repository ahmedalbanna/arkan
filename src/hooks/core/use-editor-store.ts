
'use client';

import { create } from 'zustand';
import { Editor } from '@tiptap/react';

interface EditorState {
  activeEditor: Editor | null;
  direction: 'ltr' | 'rtl';
  setActiveEditor: (editor: Editor | null) => void;
  clearActiveEditor: () => void;
  setDirection: (dir: 'ltr' | 'rtl') => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  activeEditor: null,
  direction: 'ltr',
  setActiveEditor: (editor) => set({ activeEditor: editor }),
  clearActiveEditor: () => set({ activeEditor: null }),
  setDirection: (dir) => set({ direction: dir }),
}));
