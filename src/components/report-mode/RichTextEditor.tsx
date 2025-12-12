'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { useBrowserSpeech, useDebounce } from '@/hooks';
import { useEditorStore } from '@/hooks/core/use-editor-store';
import { useAiActions } from '@/hooks/report-mode/use-ai-actions';
import { editorExtensions } from '@/lib/tiptap-extensions';
import { BubbleMenu, Editor, EditorContent, useEditor } from '@tiptap/react';
import { marked } from 'marked';
import React, { memo, useCallback, useEffect, useState } from 'react';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

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
  Volume2,
} from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Separator } from '../ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

// Toolbar Component
interface SectionToolbarProps {
  editor: Editor;
  onTextUpdate: (newText: string, from: number, to: number) => void;
  onWholeUpdate: (newText: string) => void;
}

const SectionToolbar = memo(function SectionToolbar({ editor, onTextUpdate, onWholeUpdate }: SectionToolbarProps) {
  const { t } = useLocalization();
  const { speak, stop, isSpeaking } = useBrowserSpeech();
  const { activeAiAction, isProcessing, handleAiAction, rewriteStyles } = useAiActions({
    editor,
    onTextUpdate,
    onWholeUpdate,
  });

  const handleReadAloudClick = () => {
    if (isSpeaking) {
      stop();
    } else {
      const { from, to } = editor.state.selection;
      const textToRead = editor.state.doc.textBetween(from, to) || editor.getText();
      speak(textToRead);
    }
  };

  const formatButtons = [
    { action: () => editor.chain().focus().toggleBold().run(), isActive: editor.isActive('bold'), icon: Bold, label: t('builder.Section.tooltips.bold') },
    { action: () => editor.chain().focus().toggleItalic().run(), isActive: editor.isActive('italic'), icon: Italic, label: t('builder.Section.tooltips.italic') },
    { action: () => editor.chain().focus().toggleStrike().run(), isActive: editor.isActive('strike'), icon: Strikethrough, label: t('builder.Section.tooltips.strike') },
  ];

  return (
    <div className="flex items-center gap-1 rounded-full border bg-gradient-to-r from-background/80 to-primary/5 backdrop-blur-md p-1 shadow-soft hover:shadow-glow transition-all duration-200"
         onMouseDown={(e) => e.preventDefault()} // Prevent editor from losing focus
    >
      <TooltipProvider>
        {/* Formatting Buttons */}
        {formatButtons.map(({ action, isActive, icon: Icon, label }) => (
          <Tooltip key={label}>
            <TooltipTrigger asChild>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                size="icon"
                className="rounded-full h-8 w-8"
                onClick={action}
              >
                <Icon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>{label}</p></TooltipContent>
          </Tooltip>
        ))}

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* AI Action Buttons */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => handleAiAction('summarize')} disabled={isProcessing} >
              {activeAiAction === 'summarize' && isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookText className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>{t('builder.Section.aiActions.summarize')}</p></TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" disabled={isProcessing}>
                  {activeAiAction === 'rewrite' && isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brush className="h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent><p>{t('builder.Section.aiActions.rewrite')}</p></TooltipContent>
          </Tooltip>
          <DropdownMenuContent className="backdrop-blur-md bg-gradient-to-r from-background/90 to-primary/5 border shadow-soft">
            {rewriteStyles.map(({ label, style }) => (
              <DropdownMenuItem key={style} onSelect={() => handleAiAction('rewrite', { style })} disabled={isProcessing}>
                  {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Utility Buttons */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => handleAiAction('translate')} disabled={isProcessing}>
              {activeAiAction === 'translate' && isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>{t('builder.Section.aiActions.translate')}</p></TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={handleReadAloudClick}>
              {isSpeaking ? <Square className="h-4 w-4 text-red-500 fill-current" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>{isSpeaking ? 'Stop Speaking' : t('builder.Section.tooltips.readAloud')}</p></TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
});

// Turndown Service Initialization
const turndownService = new TurndownService({ headingStyle: 'atx' });
turndownService.use(gfm);

// Main Editor Component
interface RichTextEditorProps {
  content: string;
  onChange: (markdown: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange }) => {
  const setActiveEditor = useEditorStore((state) => state.setActiveEditor);
  const uniqueId = React.useId();

  const [localContent, setLocalContent] = useState(content);
  const debouncedLocalContent = useDebounce(localContent, 500);

  const editor = useEditor({
    extensions: editorExtensions(uniqueId),
    content: marked.parse(content) as string,
    onUpdate: ({ editor }) => {
      const markdown = turndownService.turndown(editor.getHTML());
      setLocalContent(markdown);
    },
    onSelectionUpdate: ({ editor }) => {
      setActiveEditor(editor);
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none font-serif prose-p:text-[12px] prose-headings:text-[16px] prose-a:text-primary hover:prose-a:text-primary/90 prose-table:w-full prose-table:table-fixed prose-tr:border-b prose-th:text-left prose-th:p-2 prose-td:p-2',
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
    const html = marked.parse(newText) as string;
    editor.chain().focus().setContent(html).run();
    setLocalContent(newText);
  }, [editor]);

  // Unified channel for updating the parent component
  useEffect(() => {
    if (debouncedLocalContent !== content) {
        onChange(debouncedLocalContent);
    }
  }, [debouncedLocalContent, onChange, content]);

  // Smarter handling of incoming prop changes
  useEffect(() => {
    if (editor && !editor.isFocused) {
      const currentMarkdown = turndownService.turndown(editor.getHTML());
      if (content !== currentMarkdown) {
        const newHtml = marked.parse(content) as string;
        editor.commands.setContent(newHtml, false); // false to prevent firing update event
      }
    }
  }, [content, editor]);

  return (
    <div className="relative text-base">
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100, placement: 'top' }}
          pluginKey={uniqueId}
        >
          {editor.isActive('table') ? (
            <div className="bg-background p-1 rounded-lg shadow-lg border flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().addColumnBefore().run()}>Add Col Before</Button>
              <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().addRowBefore().run()}>Add Row Before</Button>
              <Button size="sm" variant="destructive" onClick={() => editor.chain().focus().deleteTable().run()}>Delete Table</Button>
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
      <div className="rounded-b-lg p-4 min-h-[200px] relative transition-colors duration-300 focus-within:bg-muted/30">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default RichTextEditor;
