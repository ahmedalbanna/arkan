

'use client';

import { type DiagramType } from '@/ai/schemas';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AnimatedContainer } from '@/components/ui/animation';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSectionAccordionItemLogic } from '@/hooks';
import { FileText, Loader2, Sparkles } from 'lucide-react';

export const DiagramAccordionItem = ({
    diagramType,
    onGenerate,
    isGenerating,
    hasCredits,
}: {
    diagramType: DiagramType,
    onGenerate: (section: DiagramType) => void,
    isGenerating: boolean,
    hasCredits: boolean,
}) => {
    const {
        t,
        title,
        disabledReason,
    } = useSectionAccordionItemLogic({ id: diagramType, name: diagramType } as any);

    const Icon = FileText; // Default icon for diagrams

    // Context is now handled automatically by the AI, so we always enable generation if credits are available.
    const canGenerate = hasCredits;

    return (
        <AnimatedContainer animation="fade-in-up" delay={200}>
            <AccordionItem value={diagramType} key={diagramType} className="bg-gradient-to-r from-background/50 to-primary/5 rounded-lg border shadow-soft hover:shadow-glow transition-all duration-200">
                <div className="flex items-center rounded-md hover:bg-gradient-to-r hover:from-primary/5 hover:to-blue-500/5 transition-all duration-200" >
                    <AccordionTrigger className="flex-1 rounded-md px-4 py-2 text-sm font-medium hover:no-underline font-headline">
                        <div className="flex items-center gap-3">
                            <div className="p-1 rounded-md bg-gradient-to-br from-purple-500 to-purple-600 shadow-soft">
                                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <FileText className="h-4 w-4 text-white" />}
                            </div>
                            {title}
                        </div>
                    </AccordionTrigger>
                    <div className="p-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="w-full">
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={() => onGenerate(diagramType)}
                                            disabled={isGenerating || !canGenerate}
                                            variant="gradient"
                                            className="font-headline hover:shadow-glow transition-all duration-200"
                                        >
                                            {isGenerating ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
                                            {t('builder.reportGenerator.generateButton')}
                                        </Button>
                                    </div>
                                </TooltipTrigger>
                                {disabledReason && (
                                    <TooltipContent>
                                        <p>{disabledReason}</p>
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
                <AccordionContent className="space-y-4 p-4 text-xs text-muted-foreground bg-gradient-to-r from-muted/30 to-primary/5">
                    {t('builder.diagramGenerator.autoContextNote')}
                </AccordionContent>
            </AccordionItem>
        </AnimatedContainer>
    );
};
