
'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { useLocalization } from '@/context/LocalizationContext';
import {
    BookText,
    Brush,
    Loader2,
    Maximize,
    Sparkles,
    SpellCheck,
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
        <AnimatedContainer animation="fade-in-up" delay={200}>
            <div className="flex items-center gap-1 rounded-full border bg-gradient-to-r from-background/80 to-primary/5 backdrop-blur-md p-1 shadow-soft hover:shadow-glow transition-all duration-200">
                <TooltipProvider>
                    <AnimatedContainer animation="fade-in-up" delay={300}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10 hover:shadow-soft transition-all duration-200"
                                    onClick={() => onAiAction('summarize')}
                                    disabled={isBusy}
                                >
                                    <BookText className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>{t('builder.Section.aiActions.summarize')}</p></TooltipContent>
                        </Tooltip>
                    </AnimatedContainer>

                    <AnimatedContainer animation="fade-in-up" delay={400}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10 hover:shadow-soft transition-all duration-200"
                                    onClick={() => onAiAction('expand')}
                                    disabled={isBusy}
                                >
                                    <Maximize className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>{t('builder.Section.aiActions.expand')}</p></TooltipContent>
                        </Tooltip>
                    </AnimatedContainer>

                    <AnimatedContainer animation="fade-in-up" delay={500}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10 hover:shadow-soft transition-all duration-200"
                                    onClick={() => onAiAction('grammar')}
                                    disabled={isBusy}
                                >
                                    <SpellCheck className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>{t('builder.Section.aiActions.checkGrammar')}</p></TooltipContent>
                        </Tooltip>
                    </AnimatedContainer>

                    <AnimatedContainer animation="fade-in-up" delay={600}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10 hover:shadow-soft transition-all duration-200"
                                    onClick={() => onAiAction('humanize')}
                                    disabled={isBusy}
                                >
                                    <UserCheck className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>{t('builder.Section.aiActions.humanize')}</p></TooltipContent>
                        </Tooltip>
                    </AnimatedContainer>

                    <AnimatedContainer animation="fade-in-up" delay={700}>
                        <DropdownMenu>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="rounded-full hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10 hover:shadow-soft transition-all duration-200"
                                            disabled={isBusy}
                                        >
                                            <Brush className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                </TooltipTrigger>
                                <TooltipContent><p>{t('builder.Section.aiActions.rewrite')}</p></TooltipContent>
                            </Tooltip>
                            <DropdownMenuContent className="backdrop-blur-md bg-gradient-to-r from-background/90 to-primary/5 border shadow-soft">
                                {rewriteStyles.map(({ label, style }, index) => (
                                    <AnimatedContainer key={style} animation="fade-in-up" delay={100 + (index * 50)}>
                                        <DropdownMenuItem
                                            className="hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10 hover:shadow-soft transition-all duration-200"
                                            onClick={() => onAiAction('rewrite', { style })}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="p-1 rounded-md bg-gradient-to-br from-muted to-muted/80">
                                                    <Sparkles className="h-3 w-3 text-muted-foreground" />
                                                </div>
                                                {label}
                                            </div>
                                        </DropdownMenuItem>
                                    </AnimatedContainer>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </AnimatedContainer>

                    <Separator orientation="vertical" className="h-6 mx-1 bg-gradient-to-b from-muted to-primary/20" />

                    <AnimatedContainer animation="fade-in-up" delay={800}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10 hover:shadow-soft transition-all duration-200"
                                    onClick={onReadAloud}
                                    disabled={isBusy}
                                >
                                    {isReadingAloud ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>{t('builder.Section.tooltips.readAloud')}</p></TooltipContent>
                        </Tooltip>
                    </AnimatedContainer>
                </TooltipProvider>
            </div>
        </AnimatedContainer>
    )
}
