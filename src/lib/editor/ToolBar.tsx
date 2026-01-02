

'use client';

import { useAiActions } from '@/hooks/report-mode/use-ai-actions';
import { useBrowserSpeech } from '@/hooks';
import { useLocalization } from '@/context/LocalizationContext';
import { Editor } from '@tiptap/react';
import {
  AlignCenter, AlignLeft, AlignRight, Bold, BookText, Brush, Italic, Languages, List, ListOrdered, Loader2, Quote, Sigma, Square, Strikethrough, Table as TableIcon, Volume2, Heading1, Heading2, Heading3, Pilcrow, Palette, Baseline
} from 'lucide-react';
import React, { memo, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { EditorController } from './EditorController';

// ============================================================================
// 1. Contextual Toolbar (for BubbleMenu)
// ============================================================================

interface ContextualToolbarProps {
  editor: Editor;
}

const ContextualToolbar = memo(function ContextualToolbar({ editor }: ContextualToolbarProps) {
  const { t } = useLocalization();
  const { speak, stop, isSpeaking } = useBrowserSpeech();
  const { isProcessing, handleAiAction, rewriteStyles } = useAiActions({ editor });
  const controller = useMemo(() => new EditorController(editor), [editor]);

  function handleReadAloudClick() {
    if (isSpeaking) {
      stop();
    } else {
      const { from, to } = editor.state.selection;
      const textToRead = editor.state.doc.textBetween(from, to) || editor.getText();
      speak(textToRead);
    }
  }
  
  const FONT_SIZES = [
    { name: 'Small', value: '12pt' },
    { name: 'Default', value: '' }, // Clears the font size
    { name: 'Large', value: '18pt' },
    { name: 'Extra Large', value: '24pt' },
  ];
  
  const FONT_COLORS = [
    { name: 'Default', value: '' }, // Clears the color
    { name: 'Red', value: '#e03131' },
    { name: 'Blue', value: '#1971c2' },
    { name: 'Green', value: '#2f9e44' },
    { name: 'Orange', value: '#f76707' },
  ];

  const formatButtons = [
    { action: () => controller.toggleBold(), isActive: controller.isBold(), icon: Bold, label: t('builder.Section.tooltips.bold') },
    { action: () => controller.toggleItalic(), isActive: controller.isItalic(), icon: Italic, label: t('builder.Section.tooltips.italic') },
    { action: () => controller.toggleStrike(), isActive: controller.isStrike(), icon: Strikethrough, label: t('builder.Section.tooltips.strike') },
  ];
  
  const headingOptions = [
    { name: 'Paragraph', command: () => controller.setParagraph(), icon: Pilcrow, isActive: controller.isParagraph() },
    { name: 'Heading 1', command: () => controller.toggleHeading(1), icon: Heading1, isActive: controller.isHeading(1) },
    { name: 'Heading 2', command: () => controller.toggleHeading(2), icon: Heading2, isActive: controller.isHeading(2) },
    { name: 'Heading 3', command: () => controller.toggleHeading(3), icon: Heading3, isActive: controller.isHeading(3) },
  ];
  const CurrentHeadingIcon = headingOptions.find(h => h.isActive)?.icon || Pilcrow;

  return (
    <div
      className="flex items-center gap-1 rounded-lg border bg-gradient-to-r from-background/95 to-background/80 backdrop-blur-md p-1 shadow-lg transition-all duration-200"
      onMouseDown={(e) => e.preventDefault()}
    >
      <TooltipProvider>
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8"><CurrentHeadingIcon className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent><p>Text Style</p></TooltipContent>
          </Tooltip>
          <DropdownMenuContent>
            {headingOptions.map(opt => (
              <DropdownMenuItem key={opt.name} onSelect={opt.command} className={opt.isActive ? 'bg-accent' : ''}>
                <opt.icon className="mr-2 h-4 w-4" />
                <span>{opt.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {formatButtons.map(({ action, isActive, icon: Icon, label }) => (
          <Tooltip key={label}>
            <TooltipTrigger asChild><Button variant={isActive ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={action}><Icon className="h-4 w-4" /></Button></TooltipTrigger>
            <TooltipContent><p>{label}</p></TooltipContent>
          </Tooltip>
        ))}
        
        <Separator orientation="vertical" className="h-6 mx-1" />

        <DropdownMenu>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><Baseline className="h-5 w-5"/></Button></DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent><p>Font Size</p></TooltipContent>
            </Tooltip>
            <DropdownMenuContent>
                {FONT_SIZES.map(size => (
                    <DropdownMenuItem key={size.name} onSelect={() => controller.setFontSize(size.value)} className={controller.isFontSize(size.value) ? "bg-accent" : ""}>{size.name}</DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><Palette className="h-4 w-4"/></Button></DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent><p>Text Color</p></TooltipContent>
            </Tooltip>
            <DropdownMenuContent>
                {FONT_COLORS.map(color => (
                    <DropdownMenuItem key={color.name} onSelect={() => controller.setColor(color.value)} className={controller.isColor(color.value) ? "bg-accent" : ""}>
                        <div className="w-4 h-4 rounded-full border mr-2" style={{ backgroundColor: color.value || 'transparent' }}></div>
                        {color.name}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
        
        <Separator orientation="vertical" className="h-6 mx-1" />

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" disabled={isProcessing}>
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brush className="h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent><p>{t('builder.Section.aiActions.title')}</p></TooltipContent>
          </Tooltip>
          <DropdownMenuContent className="backdrop-blur-md bg-gradient-to-r from-background/90 to-primary/5 border shadow-soft">
              <DropdownMenuItem onSelect={() => handleAiAction('summarize')} disabled={isProcessing}><BookText className="mr-2 h-4 w-4" /><span>{t('builder.Section.aiActions.summarize')}</span></DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleAiAction('translate')} disabled={isProcessing}><Languages className="mr-2 h-4 w-4" /><span>{t('builder.Section.aiActions.translate')}</span></DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Brush className="mr-2 h-4 w-4" />
                <span>{t('builder.Section.aiActions.rewrite')}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {rewriteStyles.map(({ label, style }) => (
                  <DropdownMenuItem key={style} onSelect={() => handleAiAction('rewrite', { style })} disabled={isProcessing}>
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
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

export { ContextualToolbar };
