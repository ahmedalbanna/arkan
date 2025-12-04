
'use client';

import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useBrowserSpeech, useDebounce, useToast, useWritingTool } from '@/hooks';
import BubbleMenuExtension from '@tiptap/extension-bubble-menu';
import Dropcursor from '@tiptap/extension-dropcursor';
import { FileHandler } from '@tiptap/extension-file-handler';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
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
import React, { useCallback, useEffect, useState } from 'react';
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
import { handleFileDrop } from '@/lib/utils/drop-handler';


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
    <div className="flex items-center gap-1 rounded-full border bg-gradient-to-r from-background/80 to-primary/5 backdrop-blur-md p-1 shadow-soft hover:shadow-glow transition-all duration-200"
      onMouseDown={(e) => e.preventDefault()} // Prevent editor from losing focus
    >
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
                key={style} onSelect={() => onAiAction('rewrite', { style })} disabled={isProcessing}>
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


interface RichTextEditorProps {
  content: string;
  onChange: (markdown: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
}) => {
  const setActiveEditor = useEditorStore((state) => state.setActiveEditor);
  
  const uniqueId = React.useId();
  
  const [localContent, setLocalContent] = useState(content);
  const debouncedLocalContent = useDebounce(localContent, 500);

  const { toast } = useToast();
  const [activeAiAction, setActiveAiAction] = useState<string | null>(null);

  const { speak, stop, isSpeaking } = useBrowserSpeech();

  const aiActionMutation = useWritingTool('/api/writing-tools/manipulate-text', {
    onSuccess: (data: any) => {
      if (!editor) return;
      const { from, to } = editor.state.selection;
      const newMarkdown = turndownService.turndown(data.rewrittenText);
      
      const contentToInsert = data.rewrittenText;

      // Update the editor content directly
      if (from !== to) { // If there was a selection
        editor.chain().focus().insertContentAt({ from, to }, contentToInsert).run();
      } else { // Replace the whole content
        editor.chain().focus().setContent(contentToInsert).run();
      }
      
      // Update local state, which will trigger the debounced onChange
      setLocalContent(newMarkdown);
      
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
      const newMarkdown = turndownService.turndown(data.text);

      if (from !== to) {
        editor.chain().focus().insertContentAt({ from, to }, data.text).run();
      } else {
        editor.chain().focus().setContent(data.text).run();
      }
      setLocalContent(newMarkdown);
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
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing or use AI...',
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      BubbleMenuExtension.configure({
        element: document.querySelector('.menu') as HTMLElement,
        pluginKey: `bubbleMenu-${uniqueId}`,
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
          files.forEach(file => handleFileDrop(currentEditor, file));
          return true;
        },
        onPaste: (currentEditor, files, htmlContent) => {
          if (htmlContent) return false;
          files.forEach(file => handleFilePaste(currentEditor, file));
          return true;
        }
      }),
    ],
    content: marked.parse(content) as string,
    onUpdate: ({ editor }) => {
        const markdown = turndownService.turndown(editor.getHTML());
        setLocalContent(markdown);
    },
    onBlur: ({ editor }) => {
        const markdown = turndownService.turndown(editor.getHTML());
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

  useEffect(() => {
    // This effect now listens to the debounced local content
    // and calls the main onChange prop.
    if (debouncedLocalContent !== content) {
        onChange(debouncedLocalContent);
    }
  }, [debouncedLocalContent, onChange, content]);

  useEffect(() => {
    // This effect ensures that if the `content` prop changes from the parent,
    // the local state and editor content are updated.
    if (editor && !editor.isFocused) {
        const newHtml = marked.parse(content) as string;
        // Check if the content is actually different to avoid unnecessary updates
        if (editor.getHTML() !== newHtml) {
            editor.commands.setContent(newHtml, false);
            setLocalContent(content);
        }
    }
  }, [content, editor]);


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
    const textToProcess = selectedText || localContent;

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
    const textToRead = editor.state.doc.textBetween(from, to) || localContent;
    speak(textToRead);
  }
  
  return (
    <div className="relative">
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100, placement: 'top' }}
          pluginKey={`bubbleMenu-${uniqueId}`}
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
