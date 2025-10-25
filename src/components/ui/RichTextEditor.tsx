

'use client';

import { BubbleMenu, Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { marked } from 'marked';
import React, { useCallback, useEffect, useState } from 'react';
import { useDebounce } from '@/hooks';
import { SectionToolbar } from '../section/SectionToolbar';
import BubbleMenuExtension from '@tiptap/extension-bubble-menu';
import TextAlign from '@tiptap/extension-text-align';
import { Bold, Italic, Strikethrough, List, ListOrdered, ChevronDown } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

interface MenuBarProps {
  editor: Editor | null;
  setDirection: (dir: 'rtl' | 'ltr') => void;
}

const MenuBar: React.FC<MenuBarProps> = ({ editor, setDirection }) => {
  if (!editor) {
    return null;
  }

  const handleHeadingChange = (value: string) => {
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
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 bg-background/80 backdrop-blur-sm border rounded-full shadow-lg flex items-center p-1 gap-1">
      <div className="flex items-center gap-1">
        <Select value={getCurrentHeadingLevel()} onValueChange={handleHeadingChange}>
            <SelectTrigger aria-label="Select heading level" className="h-9 w-32 border-none bg-transparent focus:ring-0 focus:ring-offset-0">
                <SelectValue placeholder="Paragraph"/>
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="p">Paragraph</SelectItem>
                <SelectItem value="h1">Heading 1</SelectItem>
                <SelectItem value="h2">Heading 2</SelectItem>
                <SelectItem value="h3">Heading 3</SelectItem>
            </SelectContent>
        </Select>
        <Button onClick={() => editor.chain().focus().toggleBold().run()} variant={editor.isActive('bold') ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9 rounded-full">
            <Bold className="h-4 w-4"/>
        </Button>
        <Button onClick={() => editor.chain().focus().toggleItalic().run()} variant={editor.isActive('italic') ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9 rounded-full">
            <Italic className="h-4 w-4"/>
        </Button>
         <Button onClick={() => editor.chain().focus().toggleStrike().run()} variant={editor.isActive('strike') ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9 rounded-full">
            <Strikethrough className="h-4 w-4"/>
        </Button>
        <Button onClick={() => editor.chain().focus().toggleBulletList().run()} variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9 rounded-full">
            <List className="h-4 w-4"/>
        </Button>
        <Button onClick={() => editor.chain().focus().toggleOrderedList().run()} variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9 rounded-full">
            <ListOrdered className="h-4 w-4"/>
        </Button>
      </div>
      <div className="h-6 w-px bg-border"></div>
      <div className="flex items-center gap-1">
        <Button onClick={() => { editor.chain().focus().setTextAlign('left').run(); setDirection('ltr'); }} variant={editor.isActive({ textAlign: 'left' }) ? 'secondary' : 'ghost'} className="h-9 rounded-full">LTR</Button>
        <Button onClick={() => { editor.chain().focus().setTextAlign('right').run(); setDirection('rtl'); }} variant={editor.isActive({ textAlign: 'right' }) ? 'secondary' : 'ghost'} className="h-9 rounded-full">RTL</Button>
      </div>
    </div>
  );
};


interface RichTextEditorProps {
  content: string; // Expecting Markdown content
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
    onReadAloud(selectedText || content);
  }

  // Effect to update editor content when debounced prop changes
  useEffect(() => {
    if (editor && debouncedContent !== undefined) {
      const currentHtml = editor.getHTML();
      const newHtml = marked.parse(debouncedContent) as string;

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
