'use client';

import { useEditorStore } from '@/hooks/core/use-editor-store';
import { useAiActions } from '@/hooks/report-mode/use-ai-actions';
import { useBrowserSpeech } from '@/hooks';
import { useLocalization } from '@/context/LocalizationContext';
import { Editor } from '@tiptap/react';
import {
  AlignCenter, AlignLeft, AlignRight, Bold, BookText, Brush, Italic, Languages, List, ListOrdered, Loader2, Quote, Sigma, Square, Strikethrough, Table as TableIcon, Volume2
} from 'lucide-react';
import React, { memo } from 'react';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// ============================================================================
// 1. Contextual Toolbar (for BubbleMenu)
// ============================================================================

interface ContextualToolbarProps {
  editor: Editor;
}

const ContextualToolbar = memo(function ContextualToolbar({ editor }: ContextualToolbarProps) {
  const { t } = useLocalization();
  const { speak, stop, isSpeaking } = useBrowserSpeech();
  const { activeAiAction, isProcessing, handleAiAction, rewriteStyles } = useAiActions({ editor });

  function handleReadAloudClick() {
    if (isSpeaking) {
      stop();
    } else {
      const { from, to } = editor.state.selection;
      const textToRead = editor.state.doc.textBetween(from, to) || editor.getText();
      speak(textToRead);
    }
  }

  const formatButtons = [
    { action: () => editor.chain().focus().toggleBold().run(), isActive: editor.isActive('bold'), icon: Bold, label: t('builder.Section.tooltips.bold') },
    { action: () => editor.chain().focus().toggleItalic().run(), isActive: editor.isActive('italic'), icon: Italic, label: t('builder.Section.tooltips.italic') },
    { action: () => editor.chain().focus().toggleStrike().run(), isActive: editor.isActive('strike'), icon: Strikethrough, label: t('builder.Section.tooltips.strike') },
  ];

  const aiActionButtons = [
    { name: 'summarize', icon: BookText, label: t('builder.Section.aiActions.summarize') },
    { name: 'translate', icon: Languages, label: t('builder.Section.aiActions.translate') },
  ];

  return (
    <div className="flex items-center gap-1 rounded-full border bg-gradient-to-r from-background/80 to-primary/5 backdrop-blur-md p-1 shadow-soft hover:shadow-glow transition-all duration-200"
      onMouseDown={(e) => e.preventDefault()}
    >
      <TooltipProvider>
        {formatButtons.map(({ action, isActive, icon: Icon, label }) => (
          <Tooltip key={label}>
            <TooltipTrigger asChild><Button variant={isActive ? 'secondary' : 'ghost'} size="icon" className="rounded-full h-8 w-8" onClick={action}><Icon className="h-4 w-4" /></Button></TooltipTrigger>
            <TooltipContent><p>{label}</p></TooltipContent>
          </Tooltip>
        ))}

        <Separator orientation="vertical" className="h-6 mx-1" />

        {aiActionButtons.map(({ name, icon: Icon, label }) => (
          <Tooltip key={name}>
            <TooltipTrigger asChild><Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => handleAiAction(name as any)} disabled={isProcessing}>{activeAiAction === name && isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}</Button></TooltipTrigger>
            <TooltipContent><p>{label}</p></TooltipContent>
          </Tooltip>
        ))}

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="rounded-full h-8 w-8" disabled={isProcessing}>{activeAiAction === 'rewrite' && isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brush className="h-4 w-4" />}</Button></DropdownMenuTrigger></TooltipTrigger>
            <TooltipContent><p>{t('builder.Section.aiActions.rewrite')}</p></TooltipContent>
          </Tooltip>
          <DropdownMenuContent className="backdrop-blur-md bg-gradient-to-r from-background/90 to-primary/5 border shadow-soft">
            {rewriteStyles.map(({ label, style }) => (
              <DropdownMenuItem key={style} onSelect={() => handleAiAction('rewrite', { style })} disabled={isProcessing}>{label}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger asChild><Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={handleReadAloudClick}>{isSpeaking ? <Square className="h-4 w-4 text-red-500 fill-current" /> : <Volume2 className="h-4 w-4" />}</Button></TooltipTrigger>
          <TooltipContent><p>{isSpeaking ? 'Stop Speaking' : t('builder.Section.tooltips.readAloud')}</p></TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
});

// ============================================================================
// 2. Main Fixed Toolbar
// ============================================================================

export function ToolBar() {
  const { activeEditor: editor, setDirection } = useEditorStore();

  if (!editor) return null;

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

  function addTable() {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }

  function addMath() {
    const formula = window.prompt('Enter LaTeX formula');
    if (formula) {
      editor.chain().focus().insertContent(`<katex-component content="${formula}"></katex-component>`).run();
    }
  }

  return (
    <div
      onMouseDown={(e) => e.preventDefault()}
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
        <Separator orientation="vertical" className="h-6" />
        <Button onClick={() => editor.chain().focus().toggleBold().run()} variant={editor.isActive('bold') ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9 rounded-full"><Bold className="h-4 w-4" /></Button>
        <Button onClick={() => editor.chain().focus().toggleItalic().run()} variant={editor.isActive('italic') ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9 rounded-full"><Italic className="h-4 w-4" /></Button>
        <Button onClick={() => editor.chain().focus().toggleStrike().run()} variant={editor.isActive('strike') ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9 rounded-full"><Strikethrough className="h-4 w-4" /></Button>
        <Separator orientation="vertical" className="h-6" />
        <Button onClick={() => editor.chain().focus().toggleBulletList().run()} variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9 rounded-full"><List className="h-4 w-4" /></Button>
        <Button onClick={() => editor.chain().focus().toggleOrderedList().run()} variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9 rounded-full"><ListOrdered className="h-4 w-4" /></Button>
        <Button onClick={() => editor.chain().focus().toggleBlockquote().run()} variant={editor.isActive('blockquote') ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9 rounded-full"><Quote className="h-4 w-4" /></Button>
        <Button onClick={addTable} variant="ghost" size="icon" className="h-9 w-9 rounded-full"><TableIcon className="h-4 w-4" /></Button>
      </div>
      <Separator orientation="vertical" className="h-6" />
      <div className="flex items-center gap-1">
        <Button onClick={() => { editor.chain().focus().setTextAlign('left').run(); setDirection('ltr'); }} variant={editor.isActive({ textAlign: 'left' }) ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9 rounded-full"><AlignLeft className="h-4 w-4" /></Button>
        <Button onClick={() => { editor.chain().focus().setTextAlign('center').run(); }} variant={editor.isActive({ textAlign: 'center' }) ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9 rounded-full"><AlignCenter className="h-4 w-4" /></Button>
        <Button onClick={() => { editor.chain().focus().setTextAlign('right').run(); setDirection('rtl'); }} variant={editor.isActive({ textAlign: 'right' }) ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9 rounded-full"><AlignRight className="h-4 w-4" /></Button>
        <Button onClick={addMath} variant="ghost" size="icon" className="h-9 w-9 rounded-full"><Sigma className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}

// Export the contextual toolbar for use in BubbleMenu
export { ContextualToolbar };
