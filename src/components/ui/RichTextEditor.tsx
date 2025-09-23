'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useEditor, EditorContent, Editor, BubbleMenu, Range } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { marked } from 'marked';

interface MenuBarProps {
    editor: Editor | null;
    setDirection: (dir: 'rtl' | 'ltr') => void;
}

const MenuBar: React.FC<MenuBarProps> = ({ editor, setDirection }) => {
    if (!editor) {
        return null;
    }
    return (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full shadow-lg flex items-center p-2 gap-2">
            <div className="flex items-center gap-2">
                <button onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().chain().focus().toggleBold().run()} className={`p-2 rounded-full ${editor.isActive('bold') ? 'bg-black text-white' : 'bg-white hover:bg-gray-200'}`}>Bold</button>
                <button onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().chain().focus().toggleItalic().run()} className={`p-2 rounded-full ${editor.isActive('italic') ? 'bg-black text-white' : 'bg-white hover:bg-gray-200'}`}>Italic</button>
                <button onClick={() => editor.chain().focus().toggleStrike().run()} disabled={!editor.can().chain().focus().toggleStrike().run()} className={`p-2 rounded-full ${editor.isActive('strike') ? 'bg-black text-white' : 'bg-white hover:bg-gray-200'}`}>Strike</button>
                <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 rounded-full ${editor.isActive('bulletList') ? 'bg-black text-white' : 'bg-white hover:bg-gray-200'}`}>List</button>
                <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-2 rounded-full ${editor.isActive('orderedList') ? 'bg-black text-white' : 'bg-white hover:bg-gray-200'}`}>Numbered</button>
            </div>
            <div className="h-6 w-px bg-gray-300"></div> {/* Separator */}
            <div className="flex items-center gap-2">
                <button onClick={() => { editor.chain().focus().setTextAlign('left').run(); setDirection('ltr'); }} className={`p-2 rounded-full ${editor.isActive({ textAlign: 'left' }) ? 'bg-black text-white' : 'bg-white hover:bg-gray-200'}`}>LTR</button>
                <button onClick={() => { editor.chain().focus().setTextAlign('right').run(); setDirection('rtl'); }} className={`p-2 rounded-full ${editor.isActive({ textAlign: 'right' }) ? 'bg-black text-white' : 'bg-white hover:bg-gray-200'}`}>RTL</button>
            </div>
        </div>
    );
};


interface RichTextEditorProps {
  content: string; // Expecting Markdown content
}

// Define types for AI state
interface AIState {
  isLoading: boolean;
  data: string | null;
  error: string | null;
}

type AIAction = 'summarize' | 'rewrite' | 'humanize' | 'grammar';

const RichTextEditor: React.FC<RichTextEditorProps> = ({ content }) => {
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('rtl');
  const [aiState, setAIState] = useState<AIState>({ isLoading: false, data: null, error: null });
  const [selectionRange, setSelectionRange] = useState<Range | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none',
      },
    },
  });

  useEffect(() => {
    if (editor && content) {
      const html = marked.parse(content) as string;
      editor.commands.setContent(html);
      editor.chain().focus().setTextAlign(direction).run();
    }
  }, [editor, content]);

  const resetAIState = useCallback(() => {
    setAIState({ isLoading: false, data: null, error: null });
    setSelectionRange(null);
  }, []);

  const handleAIAction = useCallback(async (action: AIAction) => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to);

    if (!selectedText) return;

    setSelectionRange({ from, to });
    setAIState({ isLoading: true, data: null, error: null });

    try {
      const response = await fetch('/api/ai-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: selectedText, action }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch AI result');
      }

      const result = await response.json();
      setAIState({ isLoading: false, data: result.result, error: null });
    } catch (e) {
      setAIState({ isLoading: false, data: null, error: (e as Error).message });
    }
  }, [editor]);

  const handleReplace = useCallback(() => {
    if (editor && selectionRange && aiState.data) {
      editor.chain().focus().setTextSelection(selectionRange).insertContent(aiState.data).run();
      resetAIState();
    }
  }, [editor, selectionRange, aiState.data, resetAIState]);

  const aiActions: { key: AIAction; label: string }[] = [
    { key: 'summarize', label: '✨ تلخيص' },
    { key: 'rewrite', label: '🔄 إعادة صياغة' },
    { key: 'humanize', label: '😊 أنسنة' },
    { key: 'grammar', label: '✍️ تدقيق' },
  ];

  return (
    <div className="m-4" dir={direction}>
        {editor && (
            <BubbleMenu
                editor={editor}
                shouldShow={({ from, to }) => from !== to} // Show whenever text is selected
                tippyOptions={{ 
                    duration: 100, 
                    placement: 'top',
                    // Move menu to the selection when AI state changes
                    getReferenceClientRect: selectionRange ? () => {
                        if (!editor.view.dom.isConnected) return new DOMRect(0,0,0,0);
                        return editor.view.coordsAtPos(selectionRange.from, selectionRange.to);
                    } : null,
                }}
            >
                {/* Conditionally render content inside the single BubbleMenu */}
                {aiState.isLoading || aiState.data || aiState.error ? (
                    <div className="bg-white rounded-lg shadow-xl p-4 border border-gray-200 w-80">
                        {aiState.isLoading && <div className="text-center">جاري المعالجة...</div>}
                        {aiState.error && <div className="text-red-500">خطأ: {aiState.error}</div>}
                        {aiState.data && (
                            <div>
                                <p className="text-sm text-gray-700 mb-3">{aiState.data}</p>
                                <div className="flex justify-end gap-2">
                                    <button onClick={resetAIState} className="text-sm px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">إغلاق</button>
                                    <button onClick={handleReplace} className="text-sm px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600">استبدال</button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-black text-white rounded-lg shadow-xl p-1 flex flex-wrap gap-1">
                        {aiActions.map(action => (
                            <button key={action.key} onClick={() => handleAIAction(action.key)} className="px-2 py-1 text-sm hover:bg-gray-700 rounded">
                                {action.label}
                            </button>
                        ))}
                    </div>
                )}
            </BubbleMenu>
        )}

      <MenuBar editor={editor} setDirection={setDirection} />
      <div className="border border-gray-300 rounded-b-lg p-2 min-h-[200px] relative">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default RichTextEditor;