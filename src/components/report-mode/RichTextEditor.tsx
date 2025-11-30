'use client';

import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useBrowserSpeech, useDebounce, useToast, useWritingTool } from '@/hooks';
import BubbleMenuExtension from '@tiptap/extension-bubble-menu';
import Dropcursor from '@tiptap/extension-dropcursor';
import { FileHandler } from '@tiptap/extension-file-handler';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import TextAlign from '@tiptap/extension-text-align';
import { BubbleMenu, Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import 'katex/dist/katex.min.css';
import {
  Bold,
  BookText,
  Brush,
  Italic,
  Languages,
  List,
  ListOrdered,
  Loader2,
  Maximize,
  Quote,
  Sigma,
  Sparkles,
  SpellCheck,
  Square,
  Strikethrough,
  Table as TableIcon,
  UserCheck,
  Volume2
} from 'lucide-react';
import mammoth from 'mammoth';
import { marked } from 'marked';
import React, { useEffect, useState } from 'react';
import Katex from 'tiptap-katex';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Separator } from '../ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useEditorStore } from '@/hooks/core/use-editor-store';
import { handleFilePaste } from '@/lib/utils/paste-handler';

interface SectionToolbarProps {
  onAiAction: (action: string, payload?: any) => void;
  onReadAloud: (text: string) => void;
  isProcessing: boolean;
  activeAction: string | null;
  isSpeaking: boolean;
  stopSpeaking: () => void;
}

export function SectionToolbar({ onAiAction, onReadAloud, isProcessing, activeAction, isSpeaking, stopSpeaking }: SectionToolbarProps) {
  const { t } = useLocalization();

  const handleReadAloudClick = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      onReadAloud('');
    }
  };

  const rewriteStyles = [
    { label: t('writingTools.textStylist.styles.formal'), style: 'Formal' },
    { label: t('writingTools.textStylist.styles.friendly'), style: 'Friendly' },
    { label: t('writingTools.textStylist.styles.simple'), style: 'Simple' },
    { label: t('writingTools.textStylist.styles.creative'), style: 'Creative' },
    { label: t('writingTools.textStylist.styles.professional'), style: 'Professional' },
    { label: t('writingTools.textStylist.styles.academic'), style: 'Academic' },
  ];

  return (
    <div className="flex items-center gap-1 rounded-full border bg-gradient-to-r from-background/80 to-primary/5 backdrop-blur-md p-1 shadow-soft hover:shadow-glow transition-all duration-200">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10 hover:shadow-soft transition-all duration-200" onClick={() => onAiAction('summarize')} disabled={isProcessing} >
              {activeAction === 'summarize' && isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookText className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>{t('builder.Section.aiActions.summarize')}</p></TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10 hover:shadow-soft transition-all duration-200" onClick={() => onAiAction('expand')} disabled={isProcessing} >
              {activeAction === 'expand' && isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>{t('builder.Section.aiActions.expand')}</p></TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10 hover:shadow-soft transition-all duration-200" onClick={() => onAiAction('grammar')} disabled={isProcessing}>
              {activeAction === 'grammar' && isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <SpellCheck className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>{t('builder.Section.aiActions.checkGrammar')}</p></TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10 hover:shadow-soft transition-all duration-200" onClick={() => onAiAction('humanize')} disabled={isProcessing}>
              {activeAction === 'humanize' && isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>{t('builder.Section.aiActions.humanize')}</p></TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10 hover:shadow-soft transition-all duration-200"
                  disabled={isProcessing}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  {activeAction === 'rewrite' && isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brush className="h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent><p>{t('builder.Section.aiActions.rewrite')}</p></TooltipContent>
          </Tooltip>
          <DropdownMenuContent className="backdrop-blur-md bg-gradient-to-r from-background/90 to-primary/5 border shadow-soft">
            {rewriteStyles.map(({ label, style }) => (
              <DropdownMenuItem
                className="hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10 hover:shadow-soft transition-all duration-200"
                key={style} onClick={() => onAiAction('rewrite', { style })} disabled={isProcessing}>
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-gradient-to-br from-muted to-muted/80">
                    <Sparkles className="h-3 w-3 text-muted-foreground" />
                  </div>
                  {label}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10 hover:shadow-soft transition-all duration-200" onClick={() => onAiAction('translate')} disabled={isProcessing}>
              {activeAction === 'translate' && isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>{t('builder.Section.aiActions.translate')}</p></TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10 hover:shadow-soft transition-all duration-200" onClick={handleReadAloudClick} disabled={isProcessing && activeAction !== 'readAloud'}>
              {isSpeaking ? <Square className="h-4 w-4 text-red-500 fill-current" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>{isSpeaking ? 'Stop Speaking' : t('builder.Section.tooltips.readAloud')}</p></TooltipContent>
        </Tooltip>

      </TooltipProvider>
    </div>
  )
}

const turndownService = new TurndownService({ headingStyle: 'atx' });
turndownService.use(gfm);


const handleFileDrop = (file: File, editor: Editor) => {
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
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
}) => {
  const setActiveEditor = useEditorStore((state) => state.setActiveEditor);
  
  const [isUpdatingFromProp, setIsUpdatingFromProp] = useState(false);
  const debouncedContent = useDebounce(content, 1000);
  const { toast } = useToast();
  const [activeAiAction, setActiveAiAction] = useState<string | null>(null);

  const { speak, stop, isSpeaking } = useBrowserSpeech();

  const aiActionMutation = useWritingTool('/api/writing-tools/manipulate-text', {
    onSuccess: (data: any) => {
      if (!editor) return;
      const { from, to } = editor.state.selection;
      if (from !== to) {
        editor.chain().focus().insertContentAt({ from, to }, data.rewrittenText).run();
      } else {
        editor.chain().focus().setContent(data.rewrittenText).run();
      }
      toast({ title: "AI Action Complete" });
      setActiveAiAction(null);
    },
    onError: (error) => {
      toast({ title: 'AI Action Failed', description: error.message, variant: 'destructive' });
      setActiveAiAction(null);
    }
  });

  const translateMutation = useWritingTool('/api/writing-tools/translate-text', {
    onSuccess: (data: any) => {
      if (!editor) return;
      const { from, to } = editor.state.selection;
      if (from !== to) {
        editor.chain().focus().insertContentAt({ from, to }, data.text).run();
      } else {
        editor.chain().focus().setContent(data.text).run();
      }
      toast({ title: "Translation Ready" });
      setActiveAiAction(null);
    },
    onError: (error) => {
      toast({ title: 'Translation Failed', description: error.message, variant: 'destructive' });
      setActiveAiAction(null);
    }
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        table: false,
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      BubbleMenuExtension.configure({
        element: document.querySelector('.menu') as HTMLElement,
        pluginKey: `bubbleMenu-${React.useId()}`,
        // Prevent focus loss when clicking menu
        pluginProps: {
          handleDOMEvents: {
            mousedown: (view, event) => {
              // Prevent default only for clicks inside the menu
              if (view.dom.parentElement?.querySelector('.menu')?.contains(event.target as Node)) {
                event.preventDefault();
              }
              return false;
            },
          },
        },
      }),
      Image,
      Dropcursor,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Katex.configure({}),
      FileHandler.configure({
        onDrop: (currentEditor, files) => {
          files.forEach(file => handleFileDrop(file, currentEditor));
          return true;
        },
        onPaste: (currentEditor, files, htmlContent) => {
          if (htmlContent) {
            return false;
          }
          files.forEach(file => {
            if (file.type.startsWith('image/')) {
              handleFilePaste(currentEditor, file);
            } else {
              handleFileDrop(file, currentEditor)
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
    onSelectionUpdate: ({ editor }) => {
      setActiveEditor(editor);
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none font-serif prose-p:text-[12px] prose-headings:text-[16px] prose-h1:text-[16px] prose-h2:text-[16px] prose-h3:text-[16px] prose-h4:text-[16px] prose-h5:text-[16px] prose-h6:text-[16px] prose-a:text-primary hover:prose-a:text-primary/90 prose-table:w-full prose-table:table-fixed prose-tr:border-b prose-th:text-left prose-th:p-2 prose-td:p-2',
      },
    },
    immediatelyRender: false,
  });

  // A simple language detection function based on character ranges.
  const detectLanguage = (text: string): 'ar' | 'en' => {
    // Basic check for Arabic characters. If any are found, assume Arabic.
    if (/[\u0600-\u06FF]/.test(text)) {
      return 'ar';
    }
    return 'en';
  };

  const handleAiActionWrapper = (action: string, payload: any = {}) => {
    if (!editor) return;
    setActiveAiAction(action);
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to);
    const textToProcess = selectedText || content;

    if (action === 'translate') {
      const sourceLang = detectLanguage(textToProcess);
      const targetLang = sourceLang === 'ar' ? 'en' : 'ar';
      translateMutation.mutate({ text: textToProcess, targetLang: targetLang });
      return;
    }

    const commandMap: Record<string, string> = {
      summarize: `Summarize this text concisely: "${textToProcess}"`,
      expand: `Expand on this topic, adding more detail and explanation: "${textToProcess}"`,
      grammar: `Correct any spelling and grammar mistakes in this text: "${textToProcess}"`,
      humanize: `Rewrite this text to sound more natural and human-like: "${textToProcess}"`,
      rewrite: `Rewrite this text in a ${payload.style || 'default'} style: "${textToProcess}"`
    };

    const command = commandMap[action];

    if (command) {
      aiActionMutation.mutate({ textToManipulate: textToProcess, command });
    } else {
      setActiveAiAction(null);
    }
  };

  const handleReadAloudWrapper = () => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const textToRead = editor.state.doc.textBetween(from, to) || content;
    speak(textToRead);
  }

  useEffect(() => {
    if (editor && debouncedContent !== undefined) {
      const currentMarkdown = turndownService.turndown(editor.getHTML());
      if (currentMarkdown !== debouncedContent) {
        const newHtml = marked.parse(debouncedContent) as string;
        setIsUpdatingFromProp(true);
        editor.commands.setContent(newHtml, false);
        setTimeout(() => setIsUpdatingFromProp(false), 100);
      }
    }
  }, [debouncedContent, editor]);


  return (
    <div className="relative">
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100, placement: 'top' }}
          pluginKey={`bubbleMenu-${React.useId()}`}
        >
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
              isProcessing={aiActionMutation.isPending || translateMutation.isPending}
              activeAction={activeAiAction}
              isSpeaking={isSpeaking}
              stopSpeaking={stop}
            />
          )}
        </BubbleMenu>
      )}
      <div className="rounded-b-lg p-2 min-h-[200px] relative">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default RichTextEditor;
