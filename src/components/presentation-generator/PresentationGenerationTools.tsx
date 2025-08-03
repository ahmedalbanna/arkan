
'use client';

import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAgents } from '@/hooks/use-agents';
import { cn } from '@/lib/utils';
import { useLocalization } from '@/context/LocalizationContext';
import { Loader2, Sparkles, Presentation, History } from 'lucide-react';
import type { Agent, AgentPrompt } from '@/lib/agents';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { useAuth } from '@/context/AuthContext';
import { useReportStore } from '@/hooks/useReportStore';
import { usePresentationStore } from '@/hooks/usePresentationStore';
import { usePresentationTemplates } from '@/hooks/use-templates';
import { formatDistanceToNow } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { GuidelineEditor } from '../generate/GuidelineEditor';
import { AcademicUploaders } from '../academic-solver/AcademicUploaders';
import { Skeleton } from '../ui/skeleton';
import { ScrollArea } from '../ui/scroll-area';
import { getSelectedGuidelines } from '@/lib/guideline-utils';

interface PresentationGenerationToolsProps {
    isDisabled: boolean;
    isGenerating: boolean;
    onGenerate: (variables: any) => void;
}

function ToolsSkeleton() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        </div>
    )
}

export const PresentationGenerationTools = (props: PresentationGenerationToolsProps) => {
    const { t } = useLocalization();
    const { isDisabled, isGenerating, onGenerate } = props;

    const { proposal } = useBuilderStore();
    const {
        presentation,
        activePresentationId,
        setActivePresentationId,
    } = usePresentationStore();
    const { userProfile } = useAuth();
    const hasCreditsForGeneration = userProfile ? userProfile.credits >= 1 : false;

    const {
        externalContext,
        addExternalContext,
        removeExternalContext,
        guidelineState,
        selectedPresentationTemplateId,
        setSelectedPresentationTemplateId,
     } = useReportStore(state => ({
        externalContext: state.externalContext,
        addExternalContext: state.addExternalContext,
        removeExternalContext: state.removeExternalContext,
        guidelineState: state.guidelineState,
        selectedPresentationTemplateId: state.selectedPresentationTemplateId,
        setSelectedPresentationTemplateId: state.setSelectedPresentationTemplateId,
     }));

    const { agents, isLoaded: agentsLoaded } = useAgents();
    const { data: presentationTemplates, isLoading: presentationTemplatesLoading } = usePresentationTemplates();

    const agent = agents.find(a => a.id === 'generate-presentation');
    const selectedTemplate = presentationTemplates?.find(t => t.id === selectedPresentationTemplateId);

    const presentations = presentation?.history || [];
    const hasContent = externalContext.length > 0;

    const handleGenerateClick = () => {
        const body = {
            proposal: proposal, // Still pass proposal for high-level context
            sourceDocuments: externalContext,
            guidelines: getSelectedGuidelines(agent, guidelineState['presentation']),
            templateId: selectedPresentationTemplateId,
        };
        onGenerate(body);
    }

    if (!agentsLoaded || presentationTemplatesLoading || !agent) {
        return <ToolsSkeleton />;
    }

    return (
        <Card className={cn(isDisabled && 'opacity-50 pointer-events-none')}>
            <CardHeader>
                <CardTitle className="font-headline">{t('builder.presentationGenerator.toolsTitle')}</CardTitle>
                <CardDescription>Upload or paste text to generate a presentation.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="generate" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="generate">Generate</TabsTrigger>
                        <TabsTrigger value="history">History</TabsTrigger>
                    </TabsList>
                    <TabsContent value="generate" className="pt-6 space-y-4">
                        <AcademicUploaders
                            title="Source Documents"
                            onContentAdded={(fileName, content) => addExternalContext(fileName, content, 'context')}
                            onContentRemoved={removeExternalContext}
                            isProcessing={isDisabled}
                            uploadedContent={externalContext}
                            isContext
                        />

                        <Accordion type="single" collapsible defaultValue="settings" className="w-full space-y-1">
                            <AccordionItem value="settings">
                                <AccordionTrigger className="rounded-md px-4 py-2 text-sm font-medium hover:bg-muted hover:no-underline">
                                    <div className="flex items-center gap-2">
                                        <Presentation className="h-4 w-4" /> {t('builder.presentationGenerator.editDetails')}
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="space-y-4 p-4">
                                     <GuidelineEditor itemKey="presentation" agentId="generate-presentation" isAdmin={userProfile?.role === 'admin'} />
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                        <div className="pt-2">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="w-full">
                                            <Button
                                                type="button"
                                                onClick={handleGenerateClick}
                                                disabled={isDisabled || isGenerating || !hasCreditsForGeneration || !hasContent}
                                                className="font-headline w-full"
                                            >
                                                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                                {t('builder.presentationGenerator.generateButton')}
                                            </Button>
                                        </div>
                                    </TooltipTrigger>
                                    {!hasCreditsForGeneration ? (
                                        <TooltipContent>
                                            <p>{t('builder.toasts.insufficientCredits')}</p>
                                        </TooltipContent>
                                    ) : !hasContent ? (
                                        <TooltipContent>
                                            <p>Please upload or paste content to generate a presentation.</p>
                                        </TooltipContent>
                                    ): null}
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </TabsContent>
                    <TabsContent value="history" className="pt-6">
                        <ScrollArea className="h-96">
                            {presentations.length > 0 ? (
                                <div className="space-y-2">
                                    {presentations.map(p => {
                                        const isValidDate = p.id && !isNaN(new Date(p.id).getTime());
                                        return (
                                            <Button
                                                key={p.id}
                                                variant="ghost"
                                                onClick={() => setActivePresentationId(p.id)}
                                                className={cn(
                                                    "w-full h-auto justify-start text-left p-2",
                                                    activePresentationId === p.id && "bg-muted"
                                                )}
                                            >
                                                <div className="flex flex-col">
                                                    <span>{p.name} ({t('builder.presentationGenerator.historyItem').replace('{slideCount}', (p.slides || []).length.toString())})</span>
                                                    {isValidDate && (
                                                        <span className="text-xs text-muted-foreground">
                                                            {formatDistanceToNow(new Date(p.id), { addSuffix: true })}
                                                        </span>
                                                    )}
                                                </div>
                                            </Button>
                                        )
                                    })}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center">{t('builder.presentationGenerator.historyEmpty')}</p>
                            )}
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};
