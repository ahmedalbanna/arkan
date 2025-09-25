
'use client';

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
} from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useLocalization } from '@/context/LocalizationContext';
import { Separator } from '../ui/separator';

interface SectionToolbarProps {
  isProcessingAi: boolean;
  isReadingAloud: boolean;
  onAiAction: (action: string, payload?: any) => void;
  onReadAloud: () => void;
}

export function SectionToolbar({
  isProcessingAi,
  isReadingAloud,
  onAiAction,
  onReadAloud,
}: SectionToolbarProps) {
    const { t } = useLocalization();
    const isBusy = isProcessingAi || isReadingAloud;

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
                         <Button variant="ghost" size="icon" className="rounded-full" onClick={() => onAiAction('summarize')} disabled={isBusy} >
                            <BookText className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>{t('builder.Section.aiActions.summarize')}</p></TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                         <Button variant="ghost" size="icon" className="rounded-full" onClick={() => onAiAction('expand')} disabled={isBusy} >
                            <Maximize className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>{t('builder.Section.aiActions.expand')}</p></TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => onAiAction('grammar')} disabled={isBusy}>
                            <SpellCheck className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>{t('builder.Section.aiActions.checkGrammar')}</p></TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                         <Button variant="ghost" size="icon" className="rounded-full" onClick={() => onAiAction('humanize')} disabled={isBusy}>
                            <UserCheck className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>{t('builder.Section.aiActions.humanize')}</p></TooltipContent>
                </Tooltip>

                 <DropdownMenu>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full" disabled={isBusy}>
                                    <Brush className="h-4 w-4" />
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
                        <Button variant="ghost" size="icon" className="rounded-full" onClick={onReadAloud} disabled={isBusy}>
                            {isReadingAloud ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>{t('builder.Section.tooltips.readAloud')}</p></TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    )
}
