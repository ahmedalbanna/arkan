'use client';

import { Editor } from '@tiptap/react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SelectionState {
  isBold: boolean;
  isItalic: boolean;
  isStrike: boolean;
  isUnderline: boolean;
  isBulletList: boolean;
  isOrderedList: boolean;
  isBlockquote: boolean;
  isCodeBlock: boolean;
  isHorizontalRule: boolean;
  activeHeading: 1 | 2 | 3 | 4 | null;
  activeFontSize: string | null;
  activeColor: string | null;
  activeHighlight: string | null;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  hasSelection: boolean;
  selectionText: string;
  selectionLength: number;
  selectionFrom: number;
  selectionTo: number;
}

interface EditorHistory {
  canUndo: boolean;
  canRedo: boolean;
}

interface EditorPreferences {
  fontSize: number;
  lineHeight: number;
  fontFamily: 'serif' | 'sans' | 'mono';
  showWordCount: boolean;
  showLineNumbers: boolean;
  autoSave: boolean;
  spellCheck: boolean;
}

interface EditorState {
  activeEditor: Editor | null;
  direction: 'ltr' | 'rtl';
  selection: SelectionState;
  history: EditorHistory;
  preferences: EditorPreferences;
  isTyping: boolean;
  lastSavedAt: Date | null;
  setActiveEditor: (editor: Editor | null) => void;
  setDirection: (dir: 'ltr' | 'rtl') => void;
  updateSelectionState: (editor: Editor) => void;
  updateHistory: (editor: Editor) => void;
  setIsTyping: (isTyping: boolean) => void;
  setLastSavedAt: (date: Date) => void;
  updatePreference: <K extends keyof EditorPreferences>(key: K, value: EditorPreferences[K]) => void;
  resetPreferences: () => void;
}

const initialSelection: SelectionState = {
  isBold: false,
  isItalic: false,
  isStrike: false,
  isUnderline: false,
  isBulletList: false,
  isOrderedList: false,
  isBlockquote: false,
  isCodeBlock: false,
  isHorizontalRule: false,
  activeHeading: null,
  activeFontSize: null,
  activeColor: null,
  activeHighlight: null,
  textAlign: 'left',
  hasSelection: false,
  selectionText: '',
  selectionLength: 0,
  selectionFrom: 0,
  selectionTo: 0,
};

const initialPreferences: EditorPreferences = {
  fontSize: 16,
  lineHeight: 1.75,
  fontFamily: 'serif',
  showWordCount: true,
  showLineNumbers: false,
  autoSave: true,
  spellCheck: true,
};

export const useEditorStore = create<EditorState>()(
  persist(
    (set) => ({
      activeEditor: null,
      direction: 'ltr',
      selection: initialSelection,
      history: { canUndo: false, canRedo: false },
      preferences: initialPreferences,
      isTyping: false,
      lastSavedAt: null,

      setActiveEditor: (editor) => set({ activeEditor: editor }),

      setDirection: (dir) => set({ direction: dir }),

      updateSelectionState: (editor) => {
        if (!editor) return;
        const { from, to } = editor.state.selection;
        const selectionText = editor.state.doc.textBetween(from, to);
        const hasSelection = from !== to && selectionText.trim().length > 0;

        set({
          selection: {
            isBold: editor.isActive('bold'),
            isItalic: editor.isActive('italic'),
            isStrike: editor.isActive('strike'),
            isUnderline: editor.isActive('underline'),
            isBulletList: editor.isActive('bulletList'),
            isOrderedList: editor.isActive('orderedList'),
            isBlockquote: editor.isActive('blockquote'),
            isCodeBlock: editor.isActive('codeBlock'),
            isHorizontalRule: editor.isActive('horizontalRule'),
            activeHeading: editor.isActive('heading', { level: 1 }) ? 1 :
              editor.isActive('heading', { level: 2 }) ? 2 :
                editor.isActive('heading', { level: 3 }) ? 3 :
                  editor.isActive('heading', { level: 4 }) ? 4 : null,
            activeFontSize: editor.getAttributes('textStyle').fontSize || null,
            activeColor: editor.getAttributes('textStyle').color || null,
            activeHighlight: editor.getAttributes('highlight')?.color || null,
            textAlign: editor.isActive({ textAlign: 'center' }) ? 'center' :
              editor.isActive({ textAlign: 'right' }) ? 'right' :
                editor.isActive({ textAlign: 'justify' }) ? 'justify' : 'left',
            hasSelection,
            selectionText: selectionText.slice(0, 100), // Limit for performance
            selectionLength: selectionText.length,
            selectionFrom: from,
            selectionTo: to,
          }
        });
      },

      updateHistory: (editor) => {
        if (!editor) return;
        set({
          history: {
            canUndo: editor.can().undo(),
            canRedo: editor.can().redo(),
          }
        });
      },

      setIsTyping: (isTyping) => set({ isTyping }),

      setLastSavedAt: (date) => set({ lastSavedAt: date }),

      updatePreference: (key, value) => set((state) => ({
        preferences: { ...state.preferences, [key]: value }
      })),

      resetPreferences: () => set({ preferences: initialPreferences }),
    }),
    {
      name: 'editor-preferences',
      partialize: (state) => ({ preferences: state.preferences }),
    }
  )
);
