

'use client';

import React, { useEffect } from 'react';
import { Accordion } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAgents } from '@/hooks/use-agents';
import { cn } from '@/lib/utils';
import { useSectionStore } from '@/hooks/useSectionStore';
import { SectionNameSchema, type SectionName as SectionNameType, type DiagramType, EvaluateContextOutput } from '@/ai/schemas';
import { Loader2, Sparkles, Eye, PanelLeftClose } from 'lucide-react';
import type {AgentPrompt } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useReportStore } from '@/hooks/useReportStore';
import { ReportActions } from './ReportActions';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useDiagramStore } from '@/hooks/useDiagramStore';
import { useProjectPlanStore } from '@/hooks/useProjectPlanStore';

import { getSelectedGuidelines } from '@/lib/guideline-utils';

import { useGenerateReportSection, useGenerateFullReport } from '@/hooks/use-report-generation';

import { evaluateContextApi } from '@/services/report-service';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';

import ReactMarkdown from 'react-markdown';

import { Skeleton } from '../ui/skeleton';
import { markdownComponents } from '@/lib/markdown-styles';
import { SectionAccordionItem } from './SectionAccordionItem';

const orderedSections = SectionNameSchema.options;
// Helper function to generate instruction text from control state
const generateInstructionText = (controls: any): string => {
    let instructions = [];
    let formalityDesc = "balanced";
    if (controls.formality < 33) formalityDesc = "informal";
    else if (controls.formality > 66) formalityDesc = "very formal";
    instructions.push(`- The writing style should be ${formalityDesc}.`);
    if (controls.tone && controls.tone !== "none") instructions.push(`- Adopt a ${controls.tone} tone.`);
    if (controls.wordCount) instructions.push(`- The response should be approximately ${controls.wordCount} words long.`);
    return instructions.join('\n');
};
interface GenerationToolsProps {
    onTranslateAll: (targetLang: 'en' | 'ar') => void;
    isTranslating: boolean;
    onCollapseToggle: () => void;
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

function PlanViewerDialog({ plan, onOpenChange }: { plan: EvaluateContextOutput | null, onOpenChange: (open: boolean) => void }) {
    const { t } = useLocalization();
    const { reportSections, diagramSections } = useSectionStore(); // This might be an issue if diagramSections is not in useSectionStore
    if (!plan) return null;

    return (
        <Dialog open={!!plan} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[90vh]">
                <DialogHeader>
                    <DialogTitle>{t('builder.presentationGenerator.planViewer.title')}</DialogTitle>
                    <DialogDescription>
                        {t('builder.presentationGenerator.planViewer.description')}
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-full">
                    <div className="space-y-4 pr-6">
                        {plan.configs.map(config => (
                            <Card key={config.section} className="bg-muted/50">
                                <CardHeader>
                                    <CardTitle className="text-lg font-headline">{reportSections[config.section]?.title || config.section}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <div>
                                        <h4 className="font-semibold">{t('builder.presentationGenerator.planViewer.contextItems')}</h4>
                                        <ul className="list-disc pl-5 text-muted-foreground text-xs">
                                            {config.context.sections?.map(s => <li key={s}>{reportSections[s]?.title || s}</li>)}
                                            {config.context.diagrams?.map(d => <li key={d}>{diagramSections[d]?.title || d}</li>)}
                                            {!config.context.sections?.length && !config.context.diagrams?.length && <li>{t('builder.proposalGenerator.title')}</li>}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">{t('builder.presentationGenerator.planViewer.instructions')}</h4>
                                        <div className="text-xs text-muted-foreground prose dark:prose-invert max-w-none">
                                            <ReactMarkdown components={markdownComponents}>{`- Tone: ${config.instructions.tone}\n- Formality: ${config.instructions.formality}`}</ReactMarkdown>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">{t('builder.presentationGenerator.planViewer.guidelines')}</h4>
                                        <ul className="list-disc pl-5 text-muted-foreground text-xs">
                                            {config.guidelines.map((g, i) => <li key={i}>{g}</li>)}
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}



export const GenerationTools = ({ onTranslateAll, isTranslating, onCollapseToggle }: GenerationToolsProps) => {
    const { t } = useLocalization();
    const { toast } = useToast();
    const { userProfile, firebaseUser } = useAuth();
    const [activeMutationKey, setActiveMutationKey] = React.useState<string | null>(null);
    const [generationPlan, setGenerationPlan] = React.useState<EvaluateContextOutput | null>(null);
    const [isPlanning, setIsPlanning] = React.useState(false);
    const { reportSections, loading: sectionsLoading } = useSectionStore();

    const { proposal } = useBuilderStore();
    const { projectPlan } = useProjectPlanStore();

    const {
        sections,
        externalContext,
        controlState,
        guidelineState,
        contextSelection,
        initializeDependentStates,
        initializeContextSelection,

    } = useReportStore();

    const { agents, isLoaded: agentsLoaded } = useAgents();


    const reportGenerationMutation = useGenerateReportSection();
    const fullReportMutation = useGenerateFullReport();

    const isAnythingGenerating = reportGenerationMutation.isPending  || fullReportMutation.isPending;
    const isDisabled = isAnythingGenerating || isTranslating || isPlanning;

    // Initialize dependent states (guidelines, controls) once agents and sections are loaded.
    useEffect(() => {
        if (agentsLoaded && !sectionsLoading) {
            initializeDependentStates();
        }
    }, [agentsLoaded, sectionsLoading, initializeDependentStates]);

    useEffect(() => {
        if (agentsLoaded && agents.length > 0) {
            if (Object.keys(reportSections).length === 0) return;
            agents.forEach(agent => {
                const sectionKey = Object.keys(reportSections).find(key => reportSections[key as SectionNameType].agentId === agent.id);
                if (sectionKey) {
                    const prompt = agent.prompt as AgentPrompt;
                    const defaultContext = prompt.defaultContext || [];
                    if (defaultContext.length > 0) {
                        initializeContextSelection(sectionKey, defaultContext);
                    }
                }
            });
        }
    }, [agentsLoaded, agents, initializeContextSelection, reportSections]);

    const onGenerateSection = async (section: SectionNameType) => {
        const fullState = useBuilderStore.getState().getFullState();
        const currentSelection = contextSelection[section] || { sections: {}, diagrams: {}, externalContext: [], proposal: true, projectPlan: true };
        const exampleFiles = externalContext?.filter((c, i) => currentSelection.externalContext[i] && c.type === 'example');
        const contextFiles = externalContext?.filter((c, i) => currentSelection.externalContext[i] && c.type === 'context');
        const agent = agents?.find(a => a.id === reportSections[section]?.agentId);

        const body = {
            proposal: currentSelection.proposal ? fullState.proposal : undefined,
            projectPlan: currentSelection.projectPlan ? fullState.projectPlan : undefined,
            sectionToGenerate: section,
            otherSections: Object.keys(currentSelection.sections).filter(k => currentSelection.sections[k]).reduce((acc, k) => ({ ...acc, [k]: fullState.sections?.[k as SectionNameType] }), {}),
            otherDiagrams: Object.keys(currentSelection.diagrams).filter(k => currentSelection.diagrams[k]).reduce((acc, k) => ({ ...acc, [k]: fullState.diagrams?.[k as DiagramType]?.plantUmlCode }), {}),
            guidelines: getSelectedGuidelines(agent, guidelineState[section]),
            instructionText: generateInstructionText(controlState[section]),
            exampleFiles,
            contextFiles,
        };

        setActiveMutationKey(section);
        reportGenerationMutation.mutate({ body });
    };

    const getGenerationPlan = async () => {
        const sectionsToGenerate = availableSections
            .filter((key): key is SectionNameType => !sections[key]);

        if (sectionsToGenerate.length === 0) {
            toast({ title: "Report Complete", description: "All sections have already been generated." });
            return null;
        }

        try {
            const token = await getAuthenticatedToken(firebaseUser);
            const evaluationBody = {
                proposal,
                projectPlan,
                existingSections: sections,
                existingDiagrams: useDiagramStore.getState().diagrams,
                sectionsToGenerate,
                externalContext,
            };
            return await evaluateContextApi(evaluationBody, token);
        } catch (error: any) {
            toast({ title: "Error Creating Plan", description: error.message, variant: "destructive" });
            return null;
        }
    }

    const handleViewPlan = async () => {
        setIsPlanning(true);
        const plan = await getGenerationPlan();
        if (plan) {
            setGenerationPlan(plan);
        }
        setIsPlanning(false);
    };

    const onGenerateFullReport = async () => {
        setIsPlanning(true);
        const plan = await getGenerationPlan();
        setIsPlanning(false);

        if (plan) {
            setActiveMutationKey('full-report');
            const fullReportBody = {
                proposal,
                projectPlan,
                existingSections: sections,
                existingDiagrams: useDiagramStore.getState().diagrams,
                externalContext,
                generationPlan: plan.configs,
            };
            fullReportMutation.mutate(fullReportBody);
        }
    };

    const availableSections = orderedSections.filter(key => reportSections[key]);
    const sectionsToGenerateCount = availableSections.filter(key => !sections[key]).length;

    const fullReportCreditCost = sectionsToGenerateCount > 0 ? sectionsToGenerateCount + 1 : 0;
    const canGenerateFullReport = (!!proposal || !!projectPlan || (externalContext && externalContext.length > 0)) && (userProfile ? userProfile.credits >= fullReportCreditCost : false) && fullReportCreditCost > 1 && !isAnythingGenerating;
    const hasCreditsForSingleSection = userProfile ? userProfile.credits >= 1 : false;

    if (!agentsLoaded || sectionsLoading) {
        return <ToolsSkeleton />;
    }

    return (
        <Card className={cn("flex flex-col h-full", isDisabled && 'opacity-50 pointer-events-none')}>
            <PlanViewerDialog plan={generationPlan} onOpenChange={() => setGenerationPlan(null)} />
            <CardHeader>
                 <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="font-headline">{t('builder.reportGenerator.toolsTitle')}</CardTitle>
                        <CardDescription>{t('builder.reportGenerator.toolsDesc')}</CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onCollapseToggle}>
                        <PanelLeftClose className="h-5 w-5" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto pr-2">
                <Tabs defaultValue="generate" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="generate">Generate</TabsTrigger>
                        <TabsTrigger value="actions" disabled={!Object.values(sections).some(s => !!s)}>Actions</TabsTrigger>
                    </TabsList>
                    <TabsContent value="generate" className="pt-6">
                        <div className="pt-2">
                            <div className="flex gap-2">
                                <Button
                                    onClick={onGenerateFullReport}
                                    className="w-full mb-4 font-headline flex-grow"
                                    disabled={!canGenerateFullReport || isAnythingGenerating || isPlanning}
                                >
                                    {activeMutationKey === 'full-report' ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
                                    {fullReportCreditCost > 1 ? `${t('builder.reportGenerator.GenerateFullReport')} (${fullReportCreditCost} Credits)` : 'Report Complete'}
                                </Button>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                             <Button variant="outline" size="icon" onClick={handleViewPlan} disabled={isPlanning || fullReportCreditCost <= 1}>
                                                {isPlanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent><p>View Generation Plan</p></TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>

                        <Accordion type="multiple" className="w-full space-y-1">
                            {availableSections.map((key) => {
                                const isGeneratingThis = isAnythingGenerating && activeMutationKey === key;
                                return (
                                    <SectionAccordionItem
                                        key={key}
                                        sectionKey={key as SectionNameType}
                                        onGenerate={onGenerateSection}
                                        isGenerating={isGeneratingThis}
                                        isAnythingGenerating={isAnythingGenerating}
                                        hasCredits={hasCreditsForSingleSection}
                                    />
                                );
                            })}
                        </Accordion>

                    </TabsContent>
                    <TabsContent value="actions" className="pt-6">
                        <ReportActions onTranslateAll={onTranslateAll} isTranslating={isTranslating} />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};
