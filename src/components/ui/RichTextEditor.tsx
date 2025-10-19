

'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks';
import BubbleMenuExtension from '@tiptap/extension-bubble-menu';
import TextAlign from '@tiptap/extension-text-align';
import { BubbleMenu, Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { AlignLeft, AlignRight, Bold, Italic, List, ListOrdered, Type } from 'lucide-react';
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
    <AnimatedContainer animation="fade-in-up" delay={200}>
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-background/90 to-primary/5 backdrop-blur-md border border-primary/20 rounded-full shadow-soft hover:shadow-glow flex items-center p-2 gap-2 transition-all duration-200">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Type className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <select
              value={getCurrentHeadingLevel()}
              onChange={handleHeadingChange}
              aria-label="Select heading level"
              className="bg-gradient-to-r from-background/80 to-primary/5 hover:from-background hover:to-primary/10 border-none rounded-full pl-8 pr-4 py-2 text-sm focus:ring-0 focus:outline-none transition-all duration-200 shadow-soft"
            >
              <option value="p">Paragraph</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
              <option value="h4">Heading 4</option>
              <option value="h5">Heading 5</option>
              <option value="h6">Heading 6</option>
            </select>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={`rounded-full transition-all duration-200 ${editor.isActive('bold') ? 'bg-gradient-to-r from-primary to-primary-600 text-white shadow-soft' : 'hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10 hover:shadow-soft'}`}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={`rounded-full transition-all duration-200 ${editor.isActive('italic') ? 'bg-gradient-to-r from-primary to-primary-600 text-white shadow-soft' : 'hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10 hover:shadow-soft'}`}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={!editor.can().chain().focus().toggleStrike().run()}
            className={`rounded-full transition-all duration-200 ${editor.isActive('strike') ? 'bg-gradient-to-r from-primary to-primary-600 text-white shadow-soft' : 'hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10 hover:shadow-soft'}`}
          >
            S
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`rounded-full transition-all duration-200 ${editor.isActive('bulletList') ? 'bg-gradient-to-r from-primary to-primary-600 text-white shadow-soft' : 'hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10 hover:shadow-soft'}`}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`rounded-full transition-all duration-200 ${editor.isActive('orderedList') ? 'bg-gradient-to-r from-primary to-primary-600 text-white shadow-soft' : 'hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10 hover:shadow-soft'}`}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>
        <div className="h-6 w-px bg-gradient-to-b from-muted to-primary/20"></div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { editor.chain().focus().setTextAlign('left').run(); setDirection('ltr'); }}
            className={`rounded-full transition-all duration-200 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gradient-to-r from-primary to-primary-600 text-white shadow-soft' : 'hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10 hover:shadow-soft'}`}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { editor.chain().focus().setTextAlign('right').run(); setDirection('rtl'); }}
            className={`rounded-full transition-all duration-200 ${editor.isActive({ textAlign: 'right' }) ? 'bg-gradient-to-r from-primary to-primary-600 text-white shadow-soft' : 'hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10 hover:shadow-soft'}`}
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </AnimatedContainer>
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
        class: 'prose dark:prose-invert max-w-none focus:outline-none font-serif prose-p:text-[14px] prose-headings:text-[28px] prose-h1:text-[28px] prose-h2:text-[18px] prose-h3:text-[16px] prose-h4:text-[16px] prose-h5:text-[16px] prose-h6:text-[16px] prose-a:text-primary hover:prose-a:text-primary/90',
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
    <AnimatedContainer animation="fade-in-up" delay={200}>
      <div dir={direction} className="relative">
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
        <AnimatedContainer animation="fade-in-up" delay={300}>

            <EditorContent editor={editor} />

        </AnimatedContainer>
      </div>
    </AnimatedContainer>
  );
};

export default RichTextEditor;
