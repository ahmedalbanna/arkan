
'use client';

import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAgents } from '@/hooks/use-agents';
import { cn } from '@/lib/utils';
import { sectionConfig } from '@/lib/report-config';
import { SectionNameSchema, type SectionName as SectionNameType, type DiagramType } from '@/ai/schemas';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { useAuth } from '@/context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { REPORT_GENERATION_TEMPLATES } from '@/lib/report-generation-templates';
import { useReportStore } from '@/hooks/useReportStore';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Slider } from '../ui/slider';
import { ReportActions } from './ReportActions';
import { EvaluationTools } from '../EvaluationTools';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useProjectPlanStore } from '@/hooks/useProjectPlanStore';
import { AcademicUploaders } from '../academic-solver/AcademicUploaders';
import { Textarea } from '../ui/textarea';
import { useLocalization } from '@/context/LocalizationContext';
import { GuidelineEditor } from '../generate/GuidelineEditor';
import { ContextSelector } from '../generate/ContextSelector';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Skeleton } from '../ui/skeleton';
import { getSelectedGuidelines } from '@/lib/guideline-utils';

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

async function generateReportApi(variables: any): Promise<any> {
    const response = await fetch('/api/generate/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${variables.token}` },
        body: JSON.stringify(variables.body),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate report section');
    }
    return await response.json();
}

interface GenerationToolsProps {
    onTranslateAll: (targetLang: 'en' | 'ar') => void;
    isTranslating: boolean;
}

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

export const GenerationTools = ({ onTranslateAll, isTranslating }: GenerationToolsProps) => {
    const { t } = useLocalization();
    const { toast } = useToast();
    const { firebaseUser, userProfile } = useAuth();
    const [activeMutationKey, setActiveMutationKey] = React.useState<string | null>(null);

    const { proposal } = useBuilderStore();
    const { projectPlan } = useProjectPlanStore();

    const {
        sections,
        externalContext,
        addExternalContext,
        removeExternalContext,
        controlState,
        guidelineState,
        contextSelection,
        selectedReportTemplateId,
        setSelectedReportTemplateId,
        setSection,
        setAllSections,
        handleControlChange,
        manualTableOfContents,
        setManualTableOfContents,
    } = useReportStore();

    const handleGenerationResult = (data: any, variables: any) => {
        if (variables.body.templateId) { // Full report was generated
            setAllSections(data.sections);
            toast({ title: `Full report generated successfully!` });
        } else { // Single section
            const sectionKey = variables.body.sectionToGenerate as SectionNameType;
            const content = Object.values(data)[0] as string;
            setSection(sectionKey, content);
            toast({ title: `Section "${t(sectionConfig[sectionKey].title)}" generated successfully!` });
        }
        setActiveMutationKey(null);
    };

    const handleGenerationError = (error: Error, variables: any) => {
        const item = variables.body.templateId || variables.body.sectionToGenerate;
        toast({ title: `Failed to generate "${item}"`, description: error.message, variant: "destructive" });
        setActiveMutationKey(null);
    };

    const reportGenerationMutation = useMutation({
        mutationFn: generateReportApi,
        onSuccess: handleGenerationResult,
        onError: handleGenerationError
    });


    const isAnythingGenerating = reportGenerationMutation.isPending;
    const isDisabled = isAnythingGenerating || isTranslating;

    const onGenerateSection = async (section: SectionNameType) => {
        if (!firebaseUser) {
            toast({ title: t('builder.toasts.authError'), description: "You must be logged in.", variant: "destructive"});
            return;
        };

        const token = await firebaseUser.getIdToken();
        const { getFullState } = useBuilderStore.getState();

        const fullState = getFullState();

        const currentSelection = contextSelection[section] || { sections: {}, diagrams: {}, externalContext: [], proposal: true, projectPlan: true };

        const exampleFiles = externalContext?.filter((c, i) => currentSelection.externalContext[i] && c.type === 'example');
        const contextFiles = externalContext?.filter((c, i) => currentSelection.externalContext[i] && c.type === 'context');

        const agent = fullState.agents?.find((a: { id: string; }) => a.id === sectionConfig[section as SectionNameType]?.agentId);

        const body = {
            proposal: currentSelection.proposal ? fullState.proposal : undefined,
            projectPlan: currentSelection.projectPlan ? fullState.projectPlan : undefined,
            sectionToGenerate: section,
            otherSections: Object.keys(currentSelection.sections).filter(k => currentSelection.sections[k]).reduce((acc, k) => ({...acc, [k]: fullState.sections?.[k as SectionNameType]}), {}),
            otherDiagrams: Object.keys(currentSelection.diagrams).filter(k => currentSelection.diagrams[k]).reduce((acc, k) => ({...acc, [k]: fullState.diagrams?.[k as DiagramType]?.plantUmlCode}), {}),
            guidelines: getSelectedGuidelines(agent, guidelineState[section]),
            instructionText: generateInstructionText(controlState[section]),
            exampleFiles,
            contextFiles,
            tableOfContents: manualTableOfContents.split('\n').filter(line => line.trim() !== '')
        };

        setActiveMutationKey(section);
        reportGenerationMutation.mutate({ body, token });
    };

    const onGenerateFullReport = async () => {
        if (!firebaseUser) {
             toast({ title: "Authentication Error", description: "You must be logged in.", variant: "destructive"});
            return;
        }
        const token = await firebaseUser.getIdToken();
        const fullState = useBuilderStore.getState().getFullState();

        const exampleFiles = fullState.externalContext?.filter(f => f.type === 'example');
        const contextFiles = fullState.externalContext?.filter(f => f.type === 'context');

        const body = {
            proposal: fullState.proposal,
            projectPlan: fullState.projectPlan,
            templateId: selectedReportTemplateId,
            existingSections: fullState.sections,
            existingDiagrams: Object.fromEntries(Object.entries(fullState.diagrams || {}).map(([key, value]) => [key, value.plantUmlCode])),
            exampleFiles,
            contextFiles,
        };
        setActiveMutationKey(selectedReportTemplateId);
        reportGenerationMutation.mutate({ body, token });
    };

    const selectedTemplate = REPORT_GENERATION_TEMPLATES.find(t => t.id === selectedReportTemplateId);
    const availableSections = orderedSections.filter(key => selectedTemplate?.agentIds.includes(sectionConfig[key].agentId));

    const sectionsToGenerate = selectedTemplate?.agentIds
        .map(agentId => (Object.keys(sectionConfig) as SectionNameType[]).find(key => sectionConfig[key].agentId === agentId))
        .filter((sectionKey): sectionKey is SectionNameType => !!sectionKey && !sections[sectionKey]) || [];
    const fullReportCreditCost = sectionsToGenerate.length;
    const canGenerateFullReport = (!!proposal || !!projectPlan || (externalContext && externalContext.length > 0)) && (userProfile ? userProfile.credits >= fullReportCreditCost : false) && fullReportCreditCost > 0 && !isAnythingGenerating;
    const hasCreditsForSingleSection = userProfile ? userProfile.credits >= 1 : false;

    const { agents, isLoaded: agentsLoaded } = useAgents();

    if (!agentsLoaded) {
        return <ToolsSkeleton />;
    }

    return (
        <Card className={cn(isDisabled && 'opacity-50 pointer-events-none')}>
            <CardHeader>
                <CardTitle className="font-headline">{t('builder.reportGenerator.toolsTitle')}</CardTitle>
                <CardDescription>{t('builder.reportGenerator.toolsDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
                 <Tabs defaultValue="generate" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="generate">Generate</TabsTrigger>
                        <TabsTrigger value="actions" disabled={!Object.values(sections).some(s => !!s)}>Actions</TabsTrigger>
                        <TabsTrigger value="evaluate" disabled={!Object.values(sections).some(s => !!s)}>Evaluate</TabsTrigger>
                    </TabsList>
                    <TabsContent value="generate" className="pt-6">
                        <div className="space-y-2 mb-4">
                            <Label htmlFor="report-template-select">{t('builder.reportGenerator.report_template')}</Label>
                            <Select value={selectedReportTemplateId} onValueChange={(val) => setSelectedReportTemplateId(val)}>
                                <SelectTrigger id="report-template-select"><SelectValue placeholder={t('reportGenerator.Select_template')} /></SelectTrigger>
                                <SelectContent>
                                    {REPORT_GENERATION_TEMPLATES.map(template => (
                                        <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">{selectedTemplate?.description}</p>
                        </div>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="w-full">
                                        <Button
                                            onClick={onGenerateFullReport}
                                            className="w-full mb-4 font-headline"
                                            disabled={!canGenerateFullReport}
                                        >
                                            {isAnythingGenerating && activeMutationKey === selectedReportTemplateId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                            {fullReportCreditCost > 0 ? `${t('builder.reportGenerator.GenerateFullReport')} (${fullReportCreditCost} Credits)` : 'Report Complete'}
                                        </Button>
                                    </div>
                                </TooltipTrigger>
                                {userProfile && userProfile.credits < fullReportCreditCost && (
                                    <TooltipContent>
                                        <p>{t('builder.toasts.insufficientCredits')}</p>
                                    </TooltipContent>
                                )}
                                {!(!!proposal || !!projectPlan || (externalContext && externalContext.length > 0)) && (
                                     <TooltipContent>
                                        <p>Please create a proposal or add external context first.</p>
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>

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
                                                <Icon className="h-4 w-4" /> {t(`${title}`)}
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="space-y-4 p-4">
                                            <Tabs defaultValue="prompt" className="w-full">
                                                <TabsList className="grid w-full grid-cols-4">
                                                    <TabsTrigger value="prompt">{t('builder.reportGenerator.tool_tab_prompt')}</TabsTrigger>
                                                    <TabsTrigger value="controls">{t('builder.reportGenerator.tool_tab_controls')}</TabsTrigger>
                                                    <TabsTrigger value="structure">Structure</TabsTrigger>
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
                                                 <TabsContent value="structure" className="pt-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="toc-input">Table of Contents</Label>
                                                        <Textarea
                                                            id="toc-input"
                                                            placeholder="Enter each chapter title on a new line..."
                                                            rows={8}
                                                            value={manualTableOfContents}
                                                            onChange={(e) => setManualTableOfContents(e.target.value)}
                                                        />
                                                        <p className="text-xs text-muted-foreground">Provide the full report structure to give the AI better context.</p>
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
                                                                    {isGeneratingThis ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
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
                    <TabsContent value="evaluate" className="pt-6">
                        <EvaluationTools />
                    </TabsContent>
                 </Tabs>
                 <div className="pt-4 mt-4 border-t">
                    <AcademicUploaders
                        title="Uploaded Context & Examples"
                        onContentAdded={addExternalContext}
                        onContentRemoved={removeExternalContext}
                        isProcessing={isDisabled}
                        uploadedContent={externalContext}
                    />
                 </div>
            </CardContent>
        </Card>
    );
};
