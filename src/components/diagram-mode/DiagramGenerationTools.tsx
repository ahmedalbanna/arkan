
'use client';

import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { DiagramTypeSchema, SectionName, type DiagramType } from '@/ai/schemas';
import { Loader2, Sparkles, GitGraph, PanelLeftClose } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { GuidelineEditor } from '../section/SectionGuidelineEditor';
import { ContextSelector } from '../section/SectionContextSelector';
import { useDiagramGenerationTools } from '@/hooks/use-diagram-generation-tools';

const orderedDiagrams = DiagramTypeSchema.options;

interface DiagramGenerationToolsProps {
    onCollapseToggle: () => void;
}

export const DiagramGenerationTools = ({ onCollapseToggle }: DiagramGenerationToolsProps) => {
    const {
        t,
        agents,
        agentsLoaded,
        userProfile,
        activeMutationKey,
        isAnythingGenerating,
        isDisabled,
        hasCreditsForGeneration,
        onGenerateDiagram,
        diagramSections,
        getIconComponent,
        checkHasSelectedContext,
    } = useDiagramGenerationTools();

    if (!agentsLoaded) {
        return <Card><CardHeader><CardTitle>{t('builder.diagramGenerator.toolsLoading')}</CardTitle><CardContent><Loader2 className="animate-spin" /></CardContent></CardHeader></Card>;
    }

    return (
        <Card className={cn(isDisabled && 'opacity-50 pointer-events-none')}>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="font-headline">{t('builder.diagramGenerator.toolsTitle')}</CardTitle>
                        <CardDescription>{t('builder.diagramGenerator.toolsDesc')}</CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" className="hidden lg:inline-flex" onClick={onCollapseToggle}>
                        <PanelLeftClose className="h-5 w-5" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Accordion type="multiple" className="w-full space-y-1">
                    {orderedDiagrams.map((key) => {
                        const diagramConfig = diagramSections[key];
                        if (!diagramConfig) return null;
                        const agent = agents.find(a => a.id === diagramConfig.agentId);
                        if (!agent) return null;

                        const { title, agentId } = diagramConfig;
                        const Icon = getIconComponent(diagramConfig.icon) || GitGraph;
                        const isGeneratingThis = isAnythingGenerating && activeMutationKey === key;
                        const hasSelectedContext = checkHasSelectedContext(key as DiagramType);

                        return (
                            <AccordionItem value={key} key={key}>
                                <AccordionTrigger className="rounded-md px-4 py-2 text-sm font-medium hover:bg-muted hover:no-underline">
                                    <div className="flex items-center gap-2">
                                        <Icon/> {t(title)}
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="space-y-4 p-4">
                                    <Tabs defaultValue="prompt" className="w-full">
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="prompt">{t('builder.reportGenerator.tool_tab_prompt')}</TabsTrigger>
                                            <TabsTrigger value="context">{t('builder.reportGenerator.tool_tab_context')}</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="prompt" className="pt-4 space-y-4">
                                            <GuidelineEditor itemKey={key} agentId={agentId} isAdmin={userProfile?.role === 'admin'} />
                                        </TabsContent>

                                        <TabsContent value="context" className="pt-4">
                                            <ContextSelector itemKey={key} />
                                        </TabsContent>
                                    </Tabs>
                                    <div className="pt-2">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="w-full">
                                                        <Button
                                                            type="button"
                                                            onClick={() => onGenerateDiagram(key as DiagramType)}
                                                            disabled={isAnythingGenerating || !agent?.isEnabled || !hasSelectedContext || !hasCreditsForGeneration}
                                                            className="font-headline w-full"
                                                        >
                                                            {isGeneratingThis ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
                                                            {t('builder.diagramGenerator.generateButton')}
                                                        </Button>
                                                    </div>
                                                </TooltipTrigger>
                                                {!hasCreditsForGeneration ? (
                                                    <TooltipContent>
                                                        <p>{t('builder.toasts.insufficientCredits')}</p>
                                                    </TooltipContent>
                                                ) : !hasSelectedContext ? (
                                                    <TooltipContent>
                                                        <p>{t('builder.diagramGenerator.tooltips.noContext')}</p>
                                                    </TooltipContent>
                                                ) : null}
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        );
                    })}
                </Accordion>
            </CardContent>
        </Card>
    );
};
