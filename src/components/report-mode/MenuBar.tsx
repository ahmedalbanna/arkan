
'use client';

import { useEditorStore } from '@/hooks/core/use-editor-store';
import { Editor } from '@tiptap/react';
import mammoth from 'mammoth';
import { marked } from 'marked';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Download,
  ImageIcon,
  Italic,
  List,
  ListOrdered,
  Quote,
  Sigma,
  Strikethrough,
  Table as TableIcon,
  Upload
} from 'lucide-react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

function handleFile(file: File, editor: Editor) {
  const reader = new FileReader();
  const fileExtension = file.name.split('.').pop()?.toLowerCase();

  if (file.type.startsWith('image/')) {
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      editor.chain().focus().setImage({ src: imageUrl }).run();
    };
    reader.readAsDataURL(file);
  } else if (fileExtension === 'md') {
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const html = marked.parse(content) as string;
      editor.chain().focus().setContent(html).run();
    };
    reader.readAsText(file);
  } else if (fileExtension === 'docx') {
    reader.onload = (event) => {
      const arrayBuffer = event.target?.result as ArrayBuffer;
      mammoth.convertToHtml({ arrayBuffer: arrayBuffer })
        .then((result) => {
          editor.chain().focus().setContent(result.value).run();
        })
        .catch((error) => {
          console.error(error);
          window.alert('Error converting .docx file.');
        });
    };
    reader.readAsArrayBuffer(file);
  } else {
    window.alert('Unsupported file type for drag and drop.');
  }
}

export function MenuBar() {
  const { activeEditor, setDirection } = useEditorStore();

  if (!activeEditor) {
    return null;
  }

  const editor = activeEditor;

  function addImage() {
    const url = window.prompt('Enter image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }

  function addTable() {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }

  function addMath() {
    const formula = window.prompt('Enter LaTeX formula');
    if (formula) {
      editor.chain().focus().insertContent(`<katex-component content="${formula}"></katex-component>`).run()
    }
  }

  async function handleExport() {
    if (!editor) return;

    const format = window.prompt("Export as: 'md' or 'docx'", 'md');

    if (format === 'md') {
      const turndownService = (await import('turndown')).default;
      const markdown = new turndownService({ headingStyle: 'atx' }).turndown(editor.getHTML());
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'document.md';
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'docx') {
      const html = editor.getHTML();
      try {
        const response = await fetch('/api/export/docx', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ html }),
        });

        if (!response.ok) {
          throw new Error('Failed to export as DOCX');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.docx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        console.error(error);
        window.alert('Error exporting .docx file.');
      }

    } else if (format) {
      window.alert("Unsupported format. Please choose 'md' or 'docx'.");
    }
  }

  function handleImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,text/markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && editor) {
        handleFile(file, editor);
      }
    };
    input.click();
  }

  function handleHeadingChange(value: string) {
    if (value === 'p') {
      editor.chain().focus().setParagraph().run();
      return;
    }
    const level = parseInt(value.replace('h', '')) as 1 | 2 | 3 | 4 | 5 | 6;
    editor.chain().focus().toggleHeading({ level }).run();
  }

  function getCurrentHeadingLevel() {
    for (let i = 1; i <= 6; i++) {
      if (editor.isActive('heading', { level: i as 1 | 2 | 3 | 4 | 5 | 6 })) {
        return `h${i}`;
      }
    }
    return 'p';
  }

  return (
    <div
      onMouseDown={(e) => e.preventDefault()} // Prevent editor from losing focus
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 bg-background/80 backdrop-blur-sm border rounded-full shadow-lg flex items-center p-1 gap-1"
    >
      <div className="flex items-center gap-1">
        <Select value={getCurrentHeadingLevel()} onValueChange={handleHeadingChange}>
          <SelectTrigger aria-label="Select heading level" className="h-9 w-32 border-none bg-transparent focus:ring-0 focus:ring-offset-0">
            <SelectValue placeholder="Paragraph" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="p">Paragraph</SelectItem>
            <SelectItem value="h1">Heading 1</SelectItem>
            <SelectItem value="h2">Heading 2</SelectItem>
            <SelectItem value="h3">Heading 3</SelectItem>
          </SelectContent>
        </Select>
        <div className="h-6 w-px bg-border"></div>
        <Button onClick={() => editor.chain().focus().toggleBold().run()} variant={editor.isActive('bold') ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9 rounded-full">
          <Bold className="h-4 w-4" />
        </Button>
        <Button onClick={() => editor.chain().focus().toggleItalic().run()} variant={editor.isActive('italic') ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9 rounded-full">
          <Italic className="h-4 w-4" />
        </Button>
        <Button onClick={() => editor.chain().focus().toggleStrike().run()} variant={editor.isActive('strike') ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9 rounded-full">
          <Strikethrough className="h-4 w-4" />
        </Button>
        <div className="h-6 w-px bg-border"></div>
        <Button onClick={() => editor.chain().focus().toggleBulletList().run()} variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9 rounded-full">
          <List className="h-4 w-4" />
        </Button>
        <Button onClick={() => editor.chain().focus().toggleOrderedList().run()} variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9 rounded-full">
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button onClick={() => editor.chain().focus().toggleBlockquote().run()} variant={editor.isActive('blockquote') ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9 rounded-full">
          <Quote className="h-4 w-4" />
        </Button>
      </div>
      <div className="h-6 w-px bg-border"></div>
      <div className="flex items-center gap-1">
        <Button onClick={() => { editor.chain().focus().setTextAlign('left').run(); setDirection('ltr'); }} variant={editor.isActive({ textAlign: 'left' }) ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9 rounded-full">
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button onClick={() => { editor.chain().focus().setTextAlign('center').run(); }} variant={editor.isActive({ textAlign: 'center' }) ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9 rounded-full">
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button onClick={() => { editor.chain().focus().setTextAlign('right').run(); setDirection('rtl'); }} variant={editor.isActive({ textAlign: 'right' }) ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9 rounded-full">
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button onClick={addMath} variant="ghost" size="icon" className="h-9 w-9 rounded-full">
            <Sigma className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
