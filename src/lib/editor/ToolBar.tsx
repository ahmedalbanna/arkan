
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
  const { setDirection } = useEditorStore();
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


  const formatButtons = [
    { action: () => editor.chain().focus().toggleBold().run(), isActive: editor.isActive('bold'), icon: Bold, label: t('builder.Section.tooltips.bold') },
    { action: () => editor.chain().focus().toggleItalic().run(), isActive: editor.isActive('italic'), icon: Italic, label: t('builder.Section.tooltips.italic') },
    { action: () => editor.chain().focus().toggleStrike().run(), isActive: editor.isActive('strike'), icon: Strikethrough, label: t('builder.Section.tooltips.strike') },
  ];

  const blockButtons = [
    { action: () => editor.chain().focus().toggleBulletList().run(), isActive: editor.isActive('bulletList'), icon: List, label: "Bulleted List" },
    { action: () => editor.chain().focus().toggleOrderedList().run(), isActive: editor.isActive('orderedList'), icon: ListOrdered, label: "Numbered List" },
    { action: () => editor.chain().focus().toggleBlockquote().run(), isActive: editor.isActive('blockquote'), icon: Quote, label: "Blockquote" },
    { action: addTable, isActive: editor.isActive('table'), icon: TableIcon, label: "Table" },
  ]

  const alignmentButtons = [
    { action: () => { editor.chain().focus().setTextAlign('left').run(); setDirection('ltr'); }, isActive: editor.isActive({ textAlign: 'left' }), icon: AlignLeft, label: "Align Left" },
    { action: () => { editor.chain().focus().setTextAlign('center').run(); }, isActive: editor.isActive({ textAlign: 'center' }), icon: AlignCenter, label: "Align Center" },
    { action: () => { editor.chain().focus().setTextAlign('right').run(); setDirection('rtl'); }, isActive: editor.isActive({ textAlign: 'right' }), icon: AlignRight, label: "Align Right" },
  ]


  const aiActionButtons = [
    { name: 'summarize', icon: BookText, label: t('builder.Section.aiActions.summarize') },
    { name: 'translate', icon: Languages, label: t('builder.Section.aiActions.translate') },
  ];

  return (
    <div
      className="flex items-center gap-1 rounded-full border bg-gradient-to-r from-background/80 to-primary/5 backdrop-blur-md p-1 shadow-soft hover:shadow-glow transition-all duration-200"
      onMouseDown={(e) => e.preventDefault()}
    >
      <TooltipProvider>
        <Select value={getCurrentHeadingLevel()} onValueChange={handleHeadingChange}>
          <SelectTrigger aria-label="Select heading level" className="h-8 w-32 border-none bg-transparent focus:ring-0 focus:ring-offset-0">
            <SelectValue placeholder="Paragraph" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="p">Paragraph</SelectItem>
            <SelectItem value="h1">Heading 1</SelectItem>
            <SelectItem value="h2">Heading 2</SelectItem>
            <SelectItem value="h3">Heading 3</SelectItem>
          </SelectContent>
        </Select>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {formatButtons.map(({ action, isActive, icon: Icon, label }) => (
          <Tooltip key={label}>
            <TooltipTrigger asChild><Button variant={isActive ? 'secondary' : 'ghost'} size="icon" className="rounded-full h-8 w-8" onClick={action}><Icon className="h-4 w-4" /></Button></TooltipTrigger>
            <TooltipContent><p>{label}</p></TooltipContent>
          </Tooltip>
        ))}

        <Separator orientation="vertical" className="h-6 mx-1" />
        
        {blockButtons.map(({ action, isActive, icon: Icon, label }) => (
          <Tooltip key={label}>
            <TooltipTrigger asChild><Button variant={isActive ? 'secondary' : 'ghost'} size="icon" className="rounded-full h-8 w-8" onClick={action}><Icon className="h-4 w-4" /></Button></TooltipTrigger>
            <TooltipContent><p>{label}</p></TooltipContent>
          </Tooltip>
        ))}

        <Separator orientation="vertical" className="h-6 mx-1" />

        {alignmentButtons.map(({ action, isActive, icon: Icon, label }) => (
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
        
        <Tooltip>
            <TooltipTrigger asChild><Button onClick={addMath} variant="ghost" size="icon" className="h-8 w-8 rounded-full"><Sigma className="h-4 w-4" /></Button></TooltipTrigger>
            <TooltipContent><p>Add Math Formula</p></TooltipContent>
        </Tooltip>

      </TooltipProvider>
    </div>
  );
});

export { ContextualToolbar };
