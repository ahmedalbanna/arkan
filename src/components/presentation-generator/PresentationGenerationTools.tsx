
'use client';

import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAgents } from '@/hooks/use-agents';
import { cn } from '@/lib/utils';
import { useLocalization } from '@/context/LocalizationContext';
import { sectionConfig, diagramConfig } from '@/lib/report-config';
import { SectionNameSchema, type SectionName as SectionNameType, type DiagramType } from '@/ai/schemas';
import { Loader2, Sparkles, Plus, Trash2, BookCheck, GitGraph, Presentation, History, FileText } from 'lucide-react';
import type { Agent, AgentGuideline, AgentPrompt } from '@/lib/agents';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-components';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { useAuth } from '@/context/AuthContext';
import { useReportStore } from '@/hooks/useReportStore';
import { useDiagramStore } from '@/hooks/useDiagramStore';
import type { GuidelineState } from '@/hooks/useReportStore';
import { usePresentationStore } from '@/hooks/usePresentationStore';
import { usePresentationTemplates } from '@/hooks/use-templates';
import { formatDistanceToNow } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { GuidelineEditor } from '../generate/GuidelineEditor';
import { ContextSelector } from '../generate/ContextSelector';
import { getSelectedGuidelines } from '@/lib/guideline-utils';
import { AcademicUploaders } from '../academic-solver/AcademicUploaders';


const orderedSections = Object.keys(sectionConfig) as SectionNameType[];
const orderedDiagrams = Object.keys(diagramConfig) as DiagramType[];

interface PresentationGenerationToolsProps {
    isDisabled: boolean;
    isGenerating: boolean;
    onGenerate: (variables: any) => void;
}

const PPTX_TEMPLATE_KEY = 'arkan-pptx-template';

// Helper to get selected guidelines for a specific item
const getSelectedGuidelinesForItem = (itemKey: string, guidelineState: Record<string, GuidelineState>, agents: Agent[]): string[] => {
    const agent = agents.find(a => a.id === 'generate-presentation');
    const currentGuidelineState = guidelineState[itemKey];

    if (!agent || !currentGuidelineState) return guidelineState[itemKey]?.custom || [];

    const promptConfig = agent.prompt as AgentPrompt;
    if (typeof promptConfig === 'string' || !promptConfig.guidelines) {
        return currentGuidelineState.custom || [];
    }

    const guidelines: string[] = [];
    promptConfig.guidelines.forEach((g, index) => {
        if (currentGuidelineState.checked[index]) {
            guidelines.push(g.text);
        }
    });
    guidelines.push(...currentGuidelineState.custom);
    return guidelines;
};

function ToolsSkeleton() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-10 w-full" />
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-full" />
                </CardFooter>
            </Card>
        </div>
    )
}

export const PresentationGenerationTools = (props: PresentationGenerationToolsProps) => {
    const { t } = useLocalization();
    const {
        isDisabled,
        isGenerating,
        onGenerate,
    } = props;

    const { proposal } = useBuilderStore();
    const { sections } = useReportStore();
    const { diagrams } = useDiagramStore();
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
        contextSelection,
        selectedPresentationTemplateId,
        setSelectedPresentationTemplateId,
     } = useReportStore(state => ({
        externalContext: state.externalContext,
        addExternalContext: state.addExternalContext,
        removeExternalContext: state.removeExternalContext,
        guidelineState: state.guidelineState,
        contextSelection: state.contextSelection,
        selectedPresentationTemplateId: state.selectedPresentationTemplateId,
        setSelectedPresentationTemplateId: state.setSelectedPresentationTemplateId,
     }));

    const { agents, isLoaded: agentsLoaded } = useAgents();
    const { data: presentationTemplates, isLoading: presentationTemplatesLoading } = usePresentationTemplates();

    const agent = agents.find(a => a.id === 'generate-presentation');
    const selectedTemplate = presentationTemplates?.find(t => t.id === selectedPresentationTemplateId);

    const presentations = presentation?.history || [];
    const hasContent = Object.keys(sections).length > 0 || Object.keys(diagrams || {}).length > 0;

    const handleGenerateClick = () => {
        const selection = contextSelection['presentation'] || { sections: {}, diagrams: {}, externalContext: [], proposal: true, projectPlan: true };

        const selectedSections = Object.entries(selection.sections)
            .filter(([, isSelected]) => isSelected)
            .reduce((acc, [key]) => ({ ...acc, [key]: sections[key as SectionNameType] }), {});

        const selectedDiagrams = Object.entries(selection.diagrams)
            .filter(([, isSelected]) => isSelected)
            .reduce((acc, [key]) => ({ ...acc, [key]: diagrams[key as DiagramType]?.plantUmlCode }), {});
            
        const selectedExternalContext = externalContext?.filter((item, index) => selection.externalContext[index]);

        const body = {
            proposal: proposal,
            sections: selectedSections,
            diagrams: selectedDiagrams,
            guidelines: getSelectedGuidelinesForItem('presentation', guidelineState, agents),
            externalContext: selectedExternalContext,
            templateId: selectedPresentationTemplateId, // Pass the templateId
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
                <CardDescription>{t('builder.presentationGenerator.toolsDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="generate" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="generate">Generate</TabsTrigger>
                        <TabsTrigger value="history">History</TabsTrigger>
                    </TabsList>
                    <TabsContent value="generate" className="pt-6">
                        <div className="space-y-2 mb-4">
                            <Label htmlFor="presentation-template-select">{t('builder.presentationGenerator.templateLabel')}</Label>
                            {presentationTemplatesLoading ? <Skeleton className="h-10 w-full" /> : (
                                <Select value={selectedPresentationTemplateId} onValueChange={(val) => setSelectedPresentationTemplateId(val)}>
                                    <SelectTrigger id="presentation-template-select">
                                        <SelectValue placeholder={t('builder.presentationGenerator.exportStylePlaceholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {presentationTemplates?.map(template => (
                                            <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                            {selectedTemplate && (
                                <p className="text-xs text-muted-foreground">{selectedTemplate.description}</p>
                            )}
                        </div>

                        <Accordion type="single" collapsible defaultValue="presentation" className="w-full space-y-1">
                            <AccordionItem value="presentation">
                                <AccordionTrigger className="rounded-md px-4 py-2 text-sm font-medium hover:bg-muted hover:no-underline">
                                    <div className="flex items-center gap-2">
                                        <Presentation className="h-4 w-4" /> {t('builder.presentationGenerator.editDetails')}
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="space-y-4 p-4">
                                    <Tabs defaultValue="prompt" className="w-full">
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="prompt">{t('builder.reportGenerator.tool_tab_prompt')}</TabsTrigger>
                                            <TabsTrigger value="context">{t('builder.reportGenerator.tool_tab_context')}</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="prompt" className="pt-4 space-y-4">
                                            <GuidelineEditor itemKey="presentation" agentId="generate-presentation" isAdmin={userProfile?.role === 'admin'} />
                                        </TabsContent>

                                        <TabsContent value="context" className="pt-4">
                                            <ContextSelector itemKey="presentation" />
                                        </TabsContent>
                                    </Tabs>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                        <div className="pt-4">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="w-full">
                                            <Button
                                                type="button"
                                                onClick={handleGenerateClick}
                                                disabled={isDisabled || isGenerating || !hasCreditsForGeneration}
                                                className="font-headline w-full"
                                            >
                                                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                                {t('builder.presentationGenerator.generateButton')}
                                            </Button>
                                        </div>
                                    </TooltipTrigger>
                                    {!hasCreditsForGeneration && (
                                        <TooltipContent>
                                            <p>{t('builder.toasts.insufficientCredits')}</p>
                                        </TooltipContent>
                                    )}
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
