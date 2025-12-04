
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
import React, { useCallback, useEffect, useState, memo } from 'react';
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
  editor: Editor;
  onTextUpdate: (newText: string, from: number, to: number) => void;
  onWholeUpdate: (newText: string) => void;
}

const SectionToolbar = memo(function SectionToolbar({ editor, onTextUpdate, onWholeUpdate }: SectionToolbarProps) {
  const { t } = useLocalization();
  const [activeAiAction, setActiveAiAction] = useState<string | null>(null);
  const { speak, stop, isSpeaking } = useBrowserSpeech();
  const { toast } = useToast();

  const handleSuccess = (resultText: string) => {
    const { from, to } = editor.state.selection;
    if (from !== to) { // There was a selection
      onTextUpdate(resultText, from, to);
    } else { // Replace whole content
      onWholeUpdate(resultText);
    }
    toast({ title: "AI Action Complete" });
  };
  
  const handleError = (error: Error) => {
    toast({ title: 'AI Action Failed', description: error.message, variant: 'destructive' });
  };

  const aiActionMutation = useWritingTool('/api/writing-tools/manipulate-text', {
    onSuccess: (data: any) => handleSuccess(data.rewrittenText),
    onError: handleError,
    onSettled: () => setActiveAiAction(null),
  });

  const translateMutation = useWritingTool('/api/writing-tools/translate-text', {
    onSuccess: (data: any) => handleSuccess(data.text),
    onError: handleError,
    onSettled: () => setActiveAiAction(null),
  });

  const isProcessing = aiActionMutation.isPending || translateMutation.isPending;

  const handleReadAloudClick = () => {
    if (isSpeaking) {
      stop();
    } else {
      const { from, to } = editor.state.selection;
      const textToRead = editor.state.doc.textBetween(from, to) || editor.getText();
      speak(textToRead);
    }
  };
  
  const detectLanguage = (text: string): 'ar' | 'en' => {
    if (/[\u0600-\u06FF]/.test(text)) return 'ar';
    return 'en';
  };

  const handleAiActionWrapper = (action: string, payload: any = {}) => {
    setActiveAiAction(action);
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to);
    const textToProcess = selectedText || editor.getText();

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
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10 hover:shadow-soft transition-all duration-200" onClick={() => handleAiActionWrapper('summarize')} disabled={isProcessing} >
              {activeAiAction === 'summarize' && isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookText className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>{t('builder.Section.aiActions.summarize')}</p></TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10 hover:shadow-soft transition-all duration-200" onClick={() => handleAiActionWrapper('expand')} disabled={isProcessing} >
              {activeAiAction === 'expand' && isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>{t('builder.Section.aiActions.expand')}</p></TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10 hover:shadow-soft transition-all duration-200" onClick={() => handleAiActionWrapper('grammar')} disabled={isProcessing}>
              {activeAiAction === 'grammar' && isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <SpellCheck className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>{t('builder.Section.aiActions.checkGrammar')}</p></TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10 hover:shadow-soft transition-all duration-200" onClick={() => handleAiActionWrapper('humanize')} disabled={isProcessing}>
              {activeAiAction === 'humanize' && isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
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
                >
                  {activeAiAction === 'rewrite' && isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brush className="h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent><p>{t('builder.Section.aiActions.rewrite')}</p></TooltipContent>
          </Tooltip>
          <DropdownMenuContent className="backdrop-blur-md bg-gradient-to-r from-background/90 to-primary/5 border shadow-soft">
            {rewriteStyles.map(({ label, style }) => (
              <DropdownMenuItem
                className="hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10 hover:shadow-soft transition-all duration-200"
                key={style} onSelect={() => handleAiActionWrapper('rewrite', { style })} disabled={isProcessing}>
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
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10 hover:shadow-soft transition-all duration-200" onClick={() => handleAiActionWrapper('translate')} disabled={isProcessing}>
              {activeAiAction === 'translate' && isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>{t('builder.Section.aiActions.translate')}</p></TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10 hover:shadow-soft transition-all duration-200" onClick={handleReadAloudClick} disabled={isProcessing && activeAiAction !== 'readAloud'}>
              {isSpeaking ? <Square className="h-4 w-4 text-red-500 fill-current" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>{isSpeaking ? 'Stop Speaking' : t('builder.Section.tooltips.readAloud')}</p></TooltipContent>
        </Tooltip>

      </TooltipProvider>
    </div>
  )
});


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

  const handleTextUpdate = useCallback((newText: string, from: number, to: number) => {
    if (!editor) return;
    editor.chain().focus().insertContentAt({ from, to }, newText).run();
    setLocalContent(turndownService.turndown(editor.getHTML()));
  }, [editor]);
  
  const handleWholeUpdate = useCallback((newText: string) => {
    if (!editor) return;
    editor.chain().focus().setContent(newText).run();
    setLocalContent(turndownService.turndown(editor.getHTML()));
  }, [editor]);
  
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
              editor={editor}
              onTextUpdate={handleTextUpdate}
              onWholeUpdate={handleWholeUpdate}
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
