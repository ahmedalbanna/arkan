

'use client';

import React, { useEffect, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAgents } from '@/hooks/use-agents';
import { cn } from '@/lib/utils';
import { sectionConfig } from '@/lib/report-config';
import { SectionNameSchema, type SectionName as SectionNameType, type DiagramType, EvaluateContextOutput } from '@/ai/schemas';
import { Loader2, Sparkles, Settings, Eye, PanelLeftClose } from 'lucide-react';
import type { Agent, AgentGuideline, AgentPrompt } from '@/lib/agents';
import { useToast } from '@/hooks/use-toast';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useReportStore } from '@/hooks/useReportStore';
import { ReportActions } from './ReportActions';
import { EvaluationTools } from '../EvaluationTools';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useProjectPlanStore } from '@/hooks/useProjectPlanStore';
import { GuidelineEditor } from '../generate/GuidelineEditor';
import { ContextSelector } from '../generate/ContextSelector';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Slider } from '../ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Skeleton } from '../ui/skeleton';
import { getSelectedGuidelines } from '@/lib/guideline-utils';
import { useReportTemplates } from '@/hooks/use-templates';
import { useGenerateReportSection, useGenerateFullReport } from '@/hooks/use-report-generation';
import { Textarea } from '../ui/textarea';
import { evaluateContextApi } from '@/services/report-service';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-components';


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
    if (!plan) return null;

    return (
        <Dialog open={!!plan} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Full Report Generation Plan</DialogTitle>
                    <DialogDescription>
                        The AI has created the following plan to generate the report sections. It has selected the most relevant context and guidelines for each step.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-full">
                    <div className="space-y-4 pr-6">
                        {plan.configs.map(config => (
                            <Card key={config.section} className="bg-muted/50">
                                <CardHeader>
                                    <CardTitle className="text-lg font-headline">{sectionConfig[config.section].title}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <div>
                                        <h4 className="font-semibold">Context Items:</h4>
                                        <ul className="list-disc pl-5 text-muted-foreground text-xs">
                                            {config.context.sections?.map(s => <li key={s}>{sectionConfig[s]?.title || s}</li>)}
                                            {config.context.diagrams?.map(d => <li key={d}>{sectionConfig[d as SectionNameType]?.title || d}</li>)}
                                            {!config.context.sections?.length && !config.context.diagrams?.length && <li>Project Proposal &amp; Plan</li>}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">Instructions:</h4>
                                        <div className="text-xs text-muted-foreground prose dark:prose-invert max-w-none">
                                            <ReactMarkdown components={markdownComponents}>{`- Tone: ${config.instructions.tone}\n- Formality: ${config.instructions.formality}`}</ReactMarkdown>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">Guidelines:</h4>
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

    const { proposal } = useBuilderStore();
    const { projectPlan } = useProjectPlanStore();

    const {
        sections,
        externalContext,
        controlState,
        guidelineState,
        contextSelection,
        selectedReportTemplateId,
        setSelectedReportTemplateId,
        initializeContextSelection,
        handleControlChange,
    } = useReportStore();

    const { agents, isLoaded: agentsLoaded } = useAgents();
    const { data: reportTemplates, isLoading: templatesLoading } = useReportTemplates();

    const reportGenerationMutation = useGenerateReportSection();
    const fullReportMutation = useGenerateFullReport();

    const isAnythingGenerating = reportGenerationMutation.isPending  || fullReportMutation.isPending;
    const isDisabled = isAnythingGenerating || isTranslating || isPlanning;

    // Initialize context selections based on agent defaults when agents are loaded
    useEffect(() => {
        if (agentsLoaded && agents.length > 0) {
            agents.forEach(agent => {
                const sectionKey = Object.keys(sectionConfig).find(key => sectionConfig[key as SectionNameType].agentId === agent.id);
                if (sectionKey) {
                    const prompt = agent.prompt as AgentPrompt;
                    const defaultContext = prompt.defaultContext || [];
                    if (defaultContext.length > 0) {
                        initializeContextSelection(sectionKey, defaultContext);
                    }
                }
            });
        }
    }, [agentsLoaded, agents, initializeContextSelection]);

    const onGenerateSection = async (section: SectionNameType) => {
        const fullState = useBuilderStore.getState().getFullState();
        const currentSelection = contextSelection[section] || { sections: {}, diagrams: {}, externalContext: [], proposal: true, projectPlan: true };
        const exampleFiles = externalContext?.filter((c, i) => currentSelection.externalContext[i] && c.type === 'example');
        const contextFiles = externalContext?.filter((c, i) => currentSelection.externalContext[i] && c.type === 'context');
        const agent = agents?.find(a => a.id === sectionConfig[section]?.agentId);

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
        const template = reportTemplates?.find(t => t.id === selectedReportTemplateId);
        if (!template) {
            toast({ title: "No Template Selected", variant: "destructive" });
            return null;
        }

        const sectionsToGenerate = template.agentIds
            .map(agentId => (Object.keys(sectionConfig) as SectionNameType[]).find(key => sectionConfig[key].agentId === agentId))
            .filter((sectionKey): sectionKey is SectionNameType => !!sectionKey && !sections[sectionKey]);

        if (sectionsToGenerate.length === 0) {
            toast({ title: "Report Complete", description: "All sections for this template have already been generated." });
            return null;
        }

        try {
            const token = await getAuthenticatedToken(firebaseUser);
            const evaluationBody = {
                proposal,
                projectPlan,
                existingSections: sections,
                existingDiagrams: useBuilderStore.getState().diagrams,
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
                existingDiagrams: useBuilderStore.getState().diagrams,
                externalContext,
                generationPlan: plan.configs,
            };
            fullReportMutation.mutate(fullReportBody);
        }
    };

    const selectedTemplate = reportTemplates?.find(t => t.id === selectedReportTemplateId);
    const availableSections = orderedSections.filter(key => selectedTemplate?.agentIds.includes(sectionConfig[key].agentId));
    const sectionsToGenerateCount = selectedTemplate?.agentIds.filter(agentId => {
        const sectionKey = (Object.keys(sectionConfig) as SectionNameType[]).find(key => sectionConfig[key].agentId === agentId);
        return sectionKey && !sections[sectionKey];
    }).length || 0;

    const fullReportCreditCost = sectionsToGenerateCount > 0 ? sectionsToGenerateCount + 1 : 0; // +1 for the context evaluation step
    const canGenerateFullReport = (!!proposal || !!projectPlan || (externalContext && externalContext.length > 0)) && (userProfile ? userProfile.credits >= fullReportCreditCost : false) && fullReportCreditCost > 1 && !isAnythingGenerating;
    const hasCreditsForSingleSection = userProfile ? userProfile.credits >= 1 : false;

    if (!agentsLoaded || templatesLoading) {
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
                        <div className="space-y-2 mb-4">
                            <Label htmlFor="report-template-select">{t('builder.reportGenerator.report_template')}</Label>
                            <Select value={selectedReportTemplateId} onValueChange={(value) => setSelectedReportTemplateId(value)}>
                                <SelectTrigger id="report-template-select">
                                    <SelectValue placeholder="Select a report template" />
                                </SelectTrigger>
                                <SelectContent>
                                    {reportTemplates?.map((template) => (
                                        <TooltipProvider key={template.id}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <SelectItem value={template.id}>{template.name}</SelectItem>
                                                </TooltipTrigger>
                                                <TooltipContent side="right" align="start">
                                                    <p className="font-bold">{template.name}</p>
                                                    <p className="text-xs text-muted-foreground">{template.description}</p>
                                                    <Separator className="my-2" />
                                                    <p className="text-xs font-semibold mb-1">Included Agents:</p>
                                                    <ul className="list-disc pl-4 text-xs text-muted-foreground">
                                                        {template.agentIds.map(agentId => {
                                                            const agent = agents.find(a => a.id === agentId);
                                                            return <li key={agentId}>{agent?.name || agentId}</li>;
                                                        })}
                                                    </ul>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="pt-4 mt-4 border-t">
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
                                const { title, icon: Icon, agentId } = sectionConfig[key];
                                const isGeneratingThis = isAnythingGenerating && activeMutationKey === key;
                                const currentSelection = contextSelection[key];
                                const hasSelectedContext = !!proposal || !!projectPlan || Object.values(currentSelection?.sections || {}).some(v => v) || Object.values(currentSelection?.diagrams || {}).some(v => v) || (externalContext.length > 0 && currentSelection?.externalContext.some(v => v));

                                return (
                                    <AccordionItem value={key} key={key}>
                                        <AccordionTrigger className="rounded-md px-4 py-2 text-sm font-medium hover:bg-muted hover:no-underline">
                                            <div className="flex items-center gap-2">
                                                {isGeneratingThis ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
                                                {t(`${title}`)}
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="space-y-4 p-4">
                                            <Tabs defaultValue="prompt" className="w-full">
                                                <TabsList className="grid w-full grid-cols-3">
                                                    <TabsTrigger value="prompt">{t('builder.reportGenerator.tool_tab_prompt')}</TabsTrigger>
                                                    <TabsTrigger value="controls">{t('builder.reportGenerator.tool_tab_controls')}</TabsTrigger>
                                                    <TabsTrigger value="context">{t('builder.reportGenerator.tool_tab_context')}</TabsTrigger>
                                                </TabsList>
                                                <TabsContent value="prompt" className="pt-4 space-y-4">
                                                    <GuidelineEditor itemKey={key} agentId={agentId} isAdmin={userProfile?.role === 'admin'} />
                                                </TabsContent>

                                                <TabsContent value="controls" className="pt-4">
                                                    <div className="space-y-6">
                                                        <div className="space-y-3">
                                                            <Label htmlFor={`formality-${key}`}>{t('builder.reportGenerator.tool_formality_label')}</Label>
                                                            <Slider id={`formality-${key}`} name={`formality_${key}`} value={[controlState[key as SectionNameType].formality]} onValueChange={(val) => handleControlChange(key as SectionNameType, 'formality', val[0])} max={100} step={1} />
                                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                                <span>{t('builder.reportGenerator.tool_formality_informal')}</span>
                                                                <span>{t('builder.reportGenerator.tool_formality_balanced')}</span>
                                                                <span>{t('builder.reportGenerator.tool_formality_formal')}</span>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`tone-${key}`}>{t('builder.reportGenerator.tool_tone_label')}</Label>
                                                            <Select name={`tone_${key}`} value={controlState[key as SectionNameType].tone} onValueChange={(val) => handleControlChange(key as SectionNameType, 'tone', val)}>
                                                                <SelectTrigger id={`tone-${key}`}><SelectValue placeholder={t('reportGenerator.tool_tone_placeholder')} /></SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="professional">{t('builder.reportGenerator.tool_tone_professional')}</SelectItem>
                                                                    <SelectItem value="academic">{t('builder.reportGenerator.tool_tone_academic')}</SelectItem>
                                                                    <SelectItem value="casual">{t('builder.reportGenerator.tool_tone_casual')}</SelectItem>
                                                                    <SelectItem value="persuasive">{t('builder.reportGenerator.tool_tone_persuasive')}</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`wordCount-${key}`}>{t('builder.reportGenerator.tool_word_count_label')}</Label>
                                                            <Input id={`wordCount-${key}`} name={`wordCount_${key}`} type="number" placeholder={t('reportGenerator.tool_word_count_placeholder')} value={controlState[key as SectionNameType].wordCount} onChange={(e) => handleControlChange(key as SectionNameType, 'wordCount', e.target.value)} />
                                                        </div>
                                                    </div>
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
                                                                    onClick={() => onGenerateSection(key as SectionNameType)}
                                                                    disabled={isAnythingGenerating || !hasSelectedContext || !hasCreditsForSingleSection}
                                                                    className="font-headline w-full"
                                                                >
                                                                    {isGeneratingThis ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
                                                                    {`${t('builder.reportGenerator.generateButton')} ${t(`${title}`)}`}
                                                                </Button>
                                                            </div>
                                                        </TooltipTrigger>
                                                        {!hasCreditsForSingleSection ? (
                                                            <TooltipContent>
                                                                <p>{t('builder.toasts.insufficientCredits')}</p>
                                                            </TooltipContent>
                                                        ) : !hasSelectedContext ? (
                                                            <TooltipContent>
                                                                <p>Please select a context (like the proposal) to generate this section.</p>
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

                    </TabsContent>
                    <TabsContent value="actions" className="pt-6">
                        <ReportActions onTranslateAll={onTranslateAll} isTranslating={isTranslating} />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};
