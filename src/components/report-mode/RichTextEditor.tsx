
'use client';

import { BubbleMenu, Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { marked } from 'marked';
import React, { useEffect, useState } from 'react';
import { useDebounce, useToast, useWritingTool, useTextToSpeech } from '@/hooks';
import BubbleMenuExtension from '@tiptap/extension-bubble-menu';
import TextAlign from '@tiptap/extension-text-align';
import { Bold, Italic, Strikethrough, List, ListOrdered, Quote, ImageIcon, Table as TableIcon, Sigma, Upload, Download, Palette, PenSquare, BrainCircuit, Workflow, Wrench, LifeBuoy, MoreVertical } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import Image from '@tiptap/extension-image';
import Dropcursor from '@tiptap/extension-dropcursor';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Katex from 'tiptap-katex';
import 'katex/dist/katex.min.css';
import mammoth from 'mammoth';
import FileHandler from '@tiptap/extension-file-handler';
import { uploadProjectFile } from '@/services/api/projectService';
import { useAuth } from '@/context/AuthContext';
//import { processPlantUml } from '@/lib/utils/processPlantUml';

import {
  BookText,
  Brush,
  GitCommitVertical,
  Languages,
  Loader2,
  Maximize,
  SpellCheck,
  UserCheck,
  Volume2,
  Trash2,
} from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '../ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useLocalization } from '@/context/LocalizationContext';
import { Separator } from '../ui/separator';

interface SectionToolbarProps {
  onAiAction: (action: string, payload?: any) => void;
  onReadAloud: (text: string) => void;
  isProcessing: boolean;
  activeAction: string | null;
}

export function SectionToolbar({ onAiAction, onReadAloud, isProcessing, activeAction }: SectionToolbarProps) {
  const { t } = useLocalization();

  const rewriteStyles = [
    { label: t('writingTools.textStylist.styles.formal'), style: 'Formal' },
    { label: t('writingTools.textStylist.styles.friendly'), style: 'Friendly' },
    { label: t('writingTools.textStylist.styles.simple'), style: 'Simple' },
    { label: t('writingTools.textStylist.styles.creative'), style: 'Creative' },
    { label: t('writingTools.textStylist.styles.professional'), style: 'Professional' },
    { label: t('writingTools.textStylist.styles.academic'), style: 'Academic' },
  ];

  return (
    <div className="flex items-center gap-1 rounded-full border bg-background p-1 shadow-lg">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => onAiAction('summarize')} disabled={isProcessing} >
              {activeAction === 'summarize' && isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookText className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>{t('builder.Section.aiActions.summarize')}</p></TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => onAiAction('expand')} disabled={isProcessing} >
              {activeAction === 'expand' && isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>{t('builder.Section.aiActions.expand')}</p></TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => onAiAction('grammar')} disabled={isProcessing}>
              {activeAction === 'grammar' && isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <SpellCheck className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>{t('builder.Section.aiActions.checkGrammar')}</p></TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => onAiAction('humanize')} disabled={isProcessing}>
              {activeAction === 'humanize' && isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>{t('builder.Section.aiActions.humanize')}</p></TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full" disabled={isProcessing}>
                  {activeAction === 'rewrite' && isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brush className="h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent><p>{t('builder.Section.aiActions.rewrite')}</p></TooltipContent>
          </Tooltip>
          <DropdownMenuContent>
            {rewriteStyles.map(({ label, style }) => (
              <DropdownMenuItem key={style} onClick={() => onAiAction('rewrite', { style })}>
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => onReadAloud('')} disabled={isProcessing}>
              {activeAction === 'readAloud' && isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>{t('builder.Section.tooltips.readAloud')}</p></TooltipContent>
        </Tooltip>


      </TooltipProvider>
    </div>
  )
}
// Initialize Turndown service with GFM for tables
const turndownService = new TurndownService({ headingStyle: 'atx' });
turndownService.use(gfm);

interface MenuBarProps {
  editor: Editor | null;
  setDirection: (dir: 'rtl' | 'ltr') => void;
}

const MenuBar: React.FC<MenuBarProps> = ({ editor, setDirection }) => {
  if (!editor) {
    return null;
  }

  const addImage = () => {
    const url = window.prompt('Enter image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const addMath = () => {
    const formula = window.prompt('Enter LaTeX formula');
    if (formula) {
      editor.chain().focus().insertContent(`<katex-component content="${formula}"></katex-component>`).run()
    }
  }

  const handleExport = async () => {
    if (!editor) return;

    const format = window.prompt("Export as: 'md' or 'docx'", 'md');

    if (format === 'md') {
      const markdown = turndownService.turndown(editor.getHTML());
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
        const response = await fetch('/api/export-docx', {
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
  };

  const handleImport = () => {
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
  };

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
        <Button onClick={handleImport} size="icon" className="h-9 w-9 rounded-full">
          <Upload className="h-4 w-4" />
        </Button>
        <Button onClick={handleExport} size="icon" className="h-9 w-9 rounded-full">
          <Download className="h-4 w-4" />
        </Button>
        <div className="h-6 w-px bg-border"></div>
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
        <Button onClick={() => editor.chain().focus().toggleBold().run()} variant={editor.isActive('bold') ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9 rounded-full">
          <Bold className="h-4 w-4" />
        </Button>
        <Button onClick={() => editor.chain().focus().toggleItalic().run()} variant={editor.isActive('italic') ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9 rounded-full">
          <Italic className="h-4 w-4" />
        </Button>
        <Button onClick={() => editor.chain().focus().toggleStrike().run()} variant={editor.isActive('strike') ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9 rounded-full">
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button onClick={() => editor.chain().focus().toggleBulletList().run()} variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9 rounded-full">
          <List className="h-4 w-4" />
        </Button>
        <Button onClick={() => editor.chain().focus().toggleOrderedList().run()} variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9 rounded-full">
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button onClick={() => editor.chain().focus().toggleBlockquote().run()} variant={editor.isActive('blockquote') ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9 rounded-full">
          <Quote className="h-4 w-4" />
        </Button>
        <Button onClick={addImage} size="icon" className="h-9 w-9 rounded-full">
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button onClick={addTable} size="icon" className="h-9 w-9 rounded-full">
          <TableIcon className="h-4 w-4" />
        </Button>
        <Button onClick={addMath} size="icon" className="h-9 w-9 rounded-full">
          <Sigma className="h-4 w-4" />
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

const handleFile = (file: File, editor: Editor) => {
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

interface RichTextEditorProps {
  content: string;
  onChange: (markdown: string) => void;
  onAiSuggestion: (suggestion: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  onAiSuggestion,
}) => {
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');
  const [isUpdatingFromProp, setIsUpdatingFromProp] = useState(false);
  const debouncedContent = useDebounce(content, 1000);
  const { firebaseUser } = useAuth();
  const { toast } = useToast();
  const [activeAiAction, setActiveAiAction] = useState<string | null>(null);

  const aiActionMutation = useWritingTool('/api/writing-tools/manipulate-text', {
    onSuccess: (data: any) => {
      onAiSuggestion(data.rewrittenText);
      toast({ title: "AI Suggestion Ready" });
      setActiveAiAction(null);
    },
    onError: (error) => {
      toast({ title: 'AI Action Failed', description: error.message, variant: 'destructive' });
      setActiveAiAction(null);
    }
  });

  const readAloudMutation = useTextToSpeech({
    onSuccess: (data) => {
      const audio = new Audio(data.audioDataUri);
      audio.play();
      setActiveAiAction(null);
    },
    onError: () => {
      setActiveAiAction(null);
    }
  });

  const handleImagePaste = async (editor: Editor, file: File) => {
    if (!firebaseUser) {
      toast({ title: 'Authentication required', description: 'You must be logged in to upload images.', variant: 'destructive' });
      return;
    }
    toast({ title: 'Uploading Image...', description: 'Your image is being uploaded to storage.' });
    try {
      const token = await firebaseUser.getIdToken();
      const { publicUrl } = await uploadProjectFile({ file, token });
      editor.chain().focus().setImage({ src: publicUrl }).run();
    } catch (error) {
      console.error("Image upload failed:", error);
      toast({ title: 'Upload Failed', description: 'Could not upload your image.', variant: 'destructive' });
    }
  };


  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        table: false,
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      BubbleMenuExtension.configure({
        element: document.querySelector('.menu') as HTMLElement,
      }),
      Image,
      Dropcursor,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Katex.configure({}),
      FileHandler.configure({
        onDrop: (currentEditor, files, pos) => {
          files.forEach(file => handleFile(file, currentEditor));
          return true;
        },
        onPaste: (currentEditor, files, htmlContent) => {
          if (htmlContent) {
            return false; // Let the default paste handler deal with HTML
          }
          files.forEach(file => {
            if (file.type.startsWith('image/')) {
              handleImagePaste(currentEditor, file);
            } else {
              handleFile(file, currentEditor)
            }
          });
          return true;
        }
      }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      if (isUpdatingFromProp) return;
      const html = editor.getHTML();
      const markdown = turndownService.turndown(html);
      onChange(markdown);
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none font-serif prose-p:text-[12px] prose-headings:text-[16px] prose-h1:text-[16px] prose-h2:text-[16px] prose-h3:text-[16px] prose-h4:text-[16px] prose-h5:text-[16px] prose-h6:text-[16px] prose-a:text-primary hover:prose-a:text-primary/90 prose-table:w-full prose-table:table-fixed prose-tr:border-b prose-th:text-left prose-th:p-2 prose-td:p-2',
      },
    },
    immediatelyRender: false,
  });

  const handleAiActionWrapper = (action: string, payload: any = {}) => {
    if (!editor) return;
    setActiveAiAction(action);
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to);
    const textToProcess = selectedText || content;

    const commandMap: Record<string, string> = {
      summarize: `Summarize this text concisely: "${textToProcess}"`,
      expand: `Expand on this topic, adding more detail and explanation: "${textToProcess}"`,
      grammar: `Correct any spelling and grammar mistakes in this text: "${textToProcess}"`,
      humanize: `Rewrite this text to sound more natural and human-like: "${textToProcess}"`,
      rewrite: `Rewrite this text in a ${payload.style || 'default'} style: "${textToProcess}"`
    };

    const command = commandMap[action];

    if (command) {
      aiActionMutation.mutate({ textToManipulate: content, command });
    } else {
      setActiveAiAction(null);
    }
  };

  const handleReadAloudWrapper = () => {
    if (!editor) return;
    setActiveAiAction('readAloud');
    const { from, to } = editor.state.selection;
    const textToRead = editor.state.doc.textBetween(from, to) || content;
    readAloudMutation.mutate({ text: textToRead });
  }

  useEffect(() => {
    if (editor && debouncedContent !== undefined) {
      (async () => {
        //const processedMarkdown = await processPlantUml(editor.getText());
        const currentMarkdown = turndownService.turndown(editor.getHTML());
        if (currentMarkdown !== debouncedContent) {
          const newHtml = marked.parse(debouncedContent) as string;
          setIsUpdatingFromProp(true);
          editor.commands.setContent(newHtml, false);
          setTimeout(() => setIsUpdatingFromProp(false), 100);
        }
      })();
    }
  }, [debouncedContent, editor]);


  return (
    <div dir={direction}>
      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100, placement: 'top' }}>
          {editor.isActive('table') ? (
            <div className="bg-background p-1 rounded-lg shadow-lg border flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().addColumnBefore().run()}>Add Col Before</Button>
              <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().addColumnAfter().run()}>Add Col After</Button>
              <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().deleteColumn().run()}>Delete Col</Button>
              <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().addRowBefore().run()}>Add Row Before</Button>
              <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().addRowAfter().run()}>Add Row After</Button>
              <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().deleteRow().run()}>Delete Row</Button>
              <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().deleteTable().run()}>Delete Table</Button>
            </div>
          ) : (
            <SectionToolbar
              onAiAction={handleAiActionWrapper}
              onReadAloud={handleReadAloudWrapper}
              isProcessing={aiActionMutation.isPending || readAloudMutation.isPending}
              activeAction={activeAiAction}
            />
          )}
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

