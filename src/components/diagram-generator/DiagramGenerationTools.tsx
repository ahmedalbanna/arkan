
'use client';

import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAgents } from '@/hooks/use-agents';
import { cn } from '@/lib/utils';
import { diagramConfig } from '@/lib/report-config';
import { DiagramTypeSchema, SectionName, type DiagramType } from '@/ai/schemas';
import { Loader2, Sparkles, GitGraph } from 'lucide-react';
import type { Agent, AgentGuideline, AgentPrompt } from '@/lib/agents';
import { useToast } from '@/hooks/use-toast';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useReportStore } from '@/hooks/useReportStore';
import { useDiagramStore } from '@/hooks/useDiagramStore';
import { AcademicUploaders } from '../academic-solver/AcademicUploaders';
import { useExplainDiagram, useGenerateDiagram } from '@/hooks/use-diagrams';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { GuidelineEditor } from '../generate/GuidelineEditor';
import { ContextSelector } from '../generate/ContextSelector';
import { getSelectedGuidelines } from '@/lib/guideline-utils';
import { useProjectPlanStore } from '@/hooks/useProjectPlanStore';

const orderedDiagrams = DiagramTypeSchema.options;

export const DiagramGenerationTools = () => {
    const { t } = useLocalization();
    const { agents, isLoaded: agentsLoaded } = useAgents();
    const { toast } = useToast();
    const { userProfile } = useAuth();
    const [activeMutationKey, setActiveMutationKey] = React.useState<string | null>(null);
    const explainMutation = useExplainDiagram();

    const { setDiagram, setDiagramExplanation } = useDiagramStore();

    const {
        addExternalContext,
        removeExternalContext,
    } = useReportStore();
        
    const diagramMutation = useGenerateDiagram((data, variables) => {
        const diagramKey = variables.body.diagramToGenerate as DiagramType;
        const translatedTitle = t(diagramConfig[diagramKey].title);
        
        setDiagram(diagramKey, { plantUmlCode: data.plantUmlCode, imageUrl: data.imageUrl, explanation: '' });
        toast({ title: t('builder.diagramGenerator.toasts.success', { title: translatedTitle }) });
        setActiveMutationKey(null);

        // Now, automatically trigger the explanation
        try {
            const response = fetch(data.imageUrl).then(res => res.blob()).then(blob => {
                 const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = async () => {
                    const base64data = reader.result as string;
                    explainMutation.mutate(base64data, {
                        onSuccess: (explanationData) => {
                            setDiagramExplanation(diagramKey, explanationData.explanation);
                            toast({ title: "Explanation Ready", description: "The AI has finished explaining the diagram." });
                        },
                        onError: (error) => {
                            console.error("Failed to auto-explain diagram:", error);
                            toast({ title: "Explanation Failed", description: "Could not automatically explain the new diagram.", variant: "destructive" });
                        }
                    });
                };
            });
           
        } catch (error) {
             console.error("Failed to prepare image for explanation:", error);
        }
    });
    
    
    const isAnythingGenerating = diagramMutation.isPending;
    const isDisabled = isAnythingGenerating || explainMutation.isPending;
    const hasCreditsForGeneration = userProfile ? userProfile.credits >= 1 : false;

    const onGenerateDiagram = async (diagramType: DiagramType) => {
        const { getFullState } = useBuilderStore.getState();
        const { guidelineState, contextSelection } = useReportStore.getState();

        const fullState = getFullState();
        const selectedContext = contextSelection[diagramType] || { sections: {}, diagrams: {}, externalContext: [], proposal: true, projectPlan: true };
        
        const exampleFiles = fullState.externalContext?.filter((c, i) => selectedContext.externalContext[i] && c.type === 'example');
        const contextFiles = fullState.externalContext?.filter((c, i) => selectedContext.externalContext[i] && c.type === 'context');
        
        const agent = agents.find(a => a.id === diagramConfig[diagramType as DiagramType]?.agentId);

        const body = {
            proposal: selectedContext.proposal ? fullState.proposal : undefined,
            projectPlan: selectedContext.projectPlan ? fullState.projectPlan : undefined,
            diagramToGenerate: diagramType,
            otherSections: Object.keys(selectedContext.sections).filter(k => selectedContext.sections[k]).reduce((acc, k) => ({...acc, [k]: fullState.sections?.[k as SectionName]}), {}),
            otherDiagrams: Object.keys(selectedContext.diagrams).filter(k => selectedContext.diagrams[k]).reduce((acc, k) => ({...acc, [k]: fullState.diagrams?.[k as DiagramType]?.plantUmlCode}), {}),
            guidelines: getSelectedGuidelines(agent, guidelineState[diagramType]),
            exampleFiles,
            contextFiles,
        };
        setActiveMutationKey(diagramType);
        diagramMutation.mutate(body);
    };

    if (!agentsLoaded) {
        return <Card><CardHeader><CardTitle>{t('builder.diagramGenerator.toolsLoading')}</CardTitle><CardContent><Loader2 className="animate-spin" /></CardContent></CardHeader></Card>;
    }
    
    return (
        <Card className={cn(isDisabled && 'opacity-50 pointer-events-none')}>
            <CardHeader>
                <CardTitle className="font-headline">{t('builder.diagramGenerator.toolsTitle')}</CardTitle>
                <CardDescription>{t('builder.diagramGenerator.toolsDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="multiple" className="w-full space-y-1">
                    {orderedDiagrams.map((key) => {
                        const agent = agents.find(a => a.id === diagramConfig[key].agentId);
                        if (!agent) return null;
                        
                        const { title, icon: Icon, agentId } = diagramConfig[key];
                        const isGeneratingThis = isAnythingGenerating && activeMutationKey === key;
                        const currentSelection = useReportStore.getState().contextSelection[key] || { sections: {}, diagrams: {}, externalContext: [], proposal: true, projectPlan: true };
                        const hasSelectedContext = !!useBuilderStore.getState().proposal || !!useProjectPlanStore.getState().projectPlan || Object.values(currentSelection.sections).some(v => v) || Object.values(currentSelection.diagrams).some(v => v) || (useReportStore.getState().externalContext.length > 0 && currentSelection.externalContext.some(v => v));

                        return (
                            <AccordionItem value={key} key={key}>
                                <AccordionTrigger className="rounded-md px-4 py-2 text-sm font-medium hover:bg-muted hover:no-underline">
                                    <div className="flex items-center gap-2">
                                        <Icon className="h-4 w-4" /> {t(title)}
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
                                                            {isGeneratingThis ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
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
                                                        <p>Please select a context (like the proposal) to generate this diagram.</p>
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
                <div className="pt-4 mt-4 border-t">
                     <AcademicUploaders
                        title="Add Context / Examples"
                        onContentAdded={addExternalContext}
                        onContentRemoved={removeExternalContext}
                        isProcessing={isDisabled}
                        uploadedContent={useReportStore.getState().externalContext}
                    />
                </div>
            </CardContent>
        </Card>
    );
};
