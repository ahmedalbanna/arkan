

'use client';

import { useDebounce } from '@/hooks';
import BubbleMenuExtension from '@tiptap/extension-bubble-menu';
import TextAlign from '@tiptap/extension-text-align';
import { BubbleMenu, Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { marked } from 'marked';
import React, { useEffect, useState } from 'react';
import { SectionToolbar } from '../section/SectionToolbar';

interface MenuBarProps {
  editor: Editor | null;
  setDirection: (dir: 'rtl' | 'ltr') => void;
}

const MenuBar: React.FC<MenuBarProps> = ({ editor, setDirection }) => {
  if (!editor) {
    return null;
  }

  const handleHeadingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'p') {
      editor.chain().focus().setParagraph().run();
      return;
    }
    const level = parseInt(value.replace('h', '')) as 1 | 2 | 3 | 4 | 5 | 6;
    editor.chain().focus().toggleHeading({ level }).run();
  };

  const getCurrentHeadingLevel = () => {
    for (let i = 1; i <= 6; i++) {
      if (editor.isActive('heading', { level: i as 1 | 2 | 3 | 4 | 5 | 6 })) {
        return `h${i}`;
      }
    }
    return 'p'; // Default to paragraph
  };

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full shadow-lg flex items-center p-2 gap-2">
      <div className="flex items-center gap-2">
        <select
          value={getCurrentHeadingLevel()}
          onChange={handleHeadingChange}
          aria-label="Select heading level"
          className="bg-white hover:bg-gray-200 border-none rounded-full p-2 text-sm focus:ring-0 focus:outline-none"
        >
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
          <option value="h5">Heading 5</option>
          <option value="h6">Heading 6</option>
        </select>
        <button onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().chain().focus().toggleBold().run()} className={`p-2 rounded-full ${editor.isActive('bold') ? 'bg-black text-white' : 'bg-white hover:bg-gray-200'}`}>B</button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().chain().focus().toggleItalic().run()} className={`p-2 rounded-full ${editor.isActive('italic') ? 'bg-black text-white' : 'bg-white hover:bg-gray-200'}`}>I</button>
        <button onClick={() => editor.chain().focus().toggleStrike().run()} disabled={!editor.can().chain().focus().toggleStrike().run()} className={`p-2 rounded-full ${editor.isActive('strike') ? 'bg-black text-white' : 'bg-white hover:bg-gray-200'}`}>S</button>
        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 rounded-full ${editor.isActive('bulletList') ? 'bg-black text-white' : 'bg-white hover:bg-gray-200'}`}>•</button>
        <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-2 rounded-full ${editor.isActive('orderedList') ? 'bg-black text-white' : 'bg-white hover:bg-gray-200'}`}>1.</button>
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
  content: string | any; // Expecting Markdown content, but handling other types
  onChange: (markdown: string) => void;
  onAiAction: (action: string, payload?: any) => void;
  onReadAloud: (text: string) => void;
  isProcessingAi: boolean;
  isReadingAloud: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  onAiAction,
  onReadAloud,
  isProcessingAi,
  isReadingAloud,
}) => {
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');
  const [isUpdatingFromProp, setIsUpdatingFromProp] = useState(false);
  const debouncedContent = useDebounce(content, 1000); // Debounce content prop

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      BubbleMenuExtension.configure({
        element: document.querySelector('.menu') as HTMLElement,
      }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      if (isUpdatingFromProp) return; // Prevent loop
      const html = editor.getHTML();
      // A proper HTML to Markdown converter should be used here.
      // For this example, we'll just pass the HTML. A library like `turndown` is recommended.
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none font-serif prose-p:text-[12px] prose-headings:text-[16px] prose-h1:text-[16px] prose-h2:text-[16px] prose-h3:text-[16px] prose-h4:text-[16px] prose-h5:text-[16px] prose-h6:text-[16px] prose-a:text-primary hover:prose-a:text-primary/90',
      },
    },
  });

  const handleAiActionWrapper = (action: string, payload?: any) => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to);
    onAiAction(action, { ...payload, selectedText: selectedText || content });
  };

  const handleReadAloudWrapper = () => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to);
    const contentString = typeof content === 'string' ? content : '';
    onReadAloud(selectedText || contentString);
  }

  // Effect to update editor content when debounced prop changes
  useEffect(() => {
    if (editor && debouncedContent !== undefined) {
      const currentHtml = editor.getHTML();

      // التأكد من أن المحتوى string قبل تمريره إلى marked
      const contentString = typeof debouncedContent === 'string'
        ? debouncedContent
        : JSON.stringify(debouncedContent) || '';

      const newHtml = marked.parse(contentString) as string;

      if (currentHtml !== newHtml) {
        setIsUpdatingFromProp(true);
        editor.commands.setContent(newHtml, false); // `false` means don't trigger update event
        setTimeout(() => setIsUpdatingFromProp(false), 100); // Release the lock shortly after
      }
    }
  }, [debouncedContent, editor]);


  return (
    <div dir={direction}>
      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <SectionToolbar
            isProcessingAi={isProcessingAi}
            onAiAction={handleAiActionWrapper}
            onReadAloud={handleReadAloudWrapper}
            isReadingAloud={isReadingAloud}
          />
        </BubbleMenu>
      )}
      <MenuBar editor={editor} setDirection={setDirection} />
      <div className="rounded-b-lg p-2 min-h-[200px] relative">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default RichTextEditor;
