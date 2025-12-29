
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { useBrowserSpeech } from '@/hooks';

import { useAiActions } from '@/hooks/report-mode/use-ai-actions';

import { Editor } from '@tiptap/react';
import {
  Bold,
  BookText,
  Brush,
  Italic,
  Languages,
  Loader2,
  Square,
  Strikethrough,
  Volume2
} from 'lucide-react';

import React, { memo} from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';



// Toolbar Component
interface SectionToolbarProps {
    editor: Editor;
  }
  
  export const SectionToolbar = memo(function SectionToolbar({ editor }: SectionToolbarProps) {
    const { t } = useLocalization();
    const { speak, stop, isSpeaking } = useBrowserSpeech();
    const { activeAiAction, isProcessing, handleAiAction, rewriteStyles } = useAiActions({
      editor,

    });
  
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
      {
        name: 'summarize',
        icon: BookText,
        label: t('builder.Section.aiActions.summarize'),
      },
      {
        name: 'translate',
        icon: Languages,
        label: t('builder.Section.aiActions.translate'),
      },
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
          {aiActionButtons.map(({ name, icon: Icon, label }) => (
            <Tooltip key={name}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-8 w-8"
                  onClick={() => handleAiAction(name as any)}
                  disabled={isProcessing}
                >
                  {activeAiAction === name && isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>{label}</p></TooltipContent>
            </Tooltip>
          ))}
  
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
  
          {/* Utility Buttons */}
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