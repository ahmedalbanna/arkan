

'use client';

import React, { useEffect, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAgents } from '@/hooks';
import { cn } from '@/lib/utils';
import { type SectionName as SectionNameType, type DiagramType, EvaluateContextOutput } from '@/ai/schemas';
import { Loader2, Sparkles, Settings, Eye, PanelLeftClose } from 'lucide-react';
import { toast, useToast } from '@/hooks';
import { useBuilderStore } from '@/hooks';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useReportStore } from '@/hooks';
import { usePresentationStore } from '@/hooks';
import { usePresentationTemplates } from '@/hooks';
import { formatDistanceToNow } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { GuidelineEditor } from '../section/SectionGuidelineEditor';
import { AcademicUploaders } from '../academicSolver-mode/AcademicUploaders';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getSelectedGuidelines } from '@/lib/guideline-utils';
import { ContextSelector } from '../section/SectionContextSelector';
import { useSections } from '@/hooks';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useMutation } from '@tanstack/react-query';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { evaluateContextApi } from '@/services';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-styles';

interface PresentationGenerationToolsProps {
    isDisabled: boolean;
    isGenerating: boolean;
    onGenerate: (variables: any) => void;
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
    const { data: sectionConfigs } = useSections();
    const reportSections = React.useMemo(() => sectionConfigs?.filter(s => s.type === 'report').reduce((acc, sec) => ({ ...acc, [sec.id]: sec }), {}) || {}, [sectionConfigs]);
    const diagramSections = React.useMemo(() => sectionConfigs?.filter(s => s.type === 'diagram').reduce((acc, sec) => ({ ...acc, [sec.id]: sec }), {}) || {}, [sectionConfigs]);

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
                                            {config.context.diagrams?.map(d => <li key={d}>{diagramSections[d as DiagramType]?.title || d}</li>)}
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

export const PresentationGenerationTools = (props: PresentationGenerationToolsProps) => {
    const { t } = useLocalization();
    const { isDisabled, isGenerating, onGenerate, onCollapseToggle } = props;

    const { project, setProject } = useBuilderStore();
    const {
        activePresentationId,
        setActivePresentationId,
    } = usePresentationStore();
    const { userProfile, firebaseUser } = useAuth();
    const hasCreditsForGeneration = userProfile ? userProfile.credits >= 1 : false;

    const {
        externalContext,
        addExternalContext,
        removeExternalContext,
        guidelineState,
        contextSelection,
        selectedPresentationTemplateId,
        setSelectedPresentationTemplateId,
     } = useReportStore();

    const sections = project?.sections || {};
    const diagrams = project?.diagrams || {};

    const { agents, isLoaded: agentsLoaded } = useAgents();
    const { data: presentationTemplates, isLoading: presentationTemplatesLoading } = usePresentationTemplates();

    const [tone, setTone] = useState('');
    const [complexity, setComplexity] = useState('');
    const [isPlanning, setIsPlanning] = React.useState(false);
    const [generationPlan, setGenerationPlan] = React.useState<EvaluateContextOutput | null>(null);

    const agent = agents.find(a => a.id === 'generate-presentation');

    const presentations = project?.presentation?.history || [];

    const currentSelection = contextSelection['presentation'] || { sections: {}, diagrams: {}, externalContext: [], proposal: true, projectPlan: true };
    const hasContent = externalContext.length > 0 || currentSelection.proposal || Object.values(currentSelection.sections).some(v => v) || Object.values(currentSelection.diagrams).some(v => v);

    const handleGenerateClick = () => {
        if (!selectedPresentationTemplateId) {
            toast({ title: t('builder.presentationGenerator.toasts.selectTemplate'), variant: 'destructive' });
            return;
        }

        const selectedContext = contextSelection['presentation'] || { sections: {}, diagrams: {}, externalContext: [], proposal: true, projectPlan: true };

        const sourceDocuments = [];

        if (selectedContext.proposal && project?.proposal) {
            sourceDocuments.push({
                fileName: "Project Proposal",
                content: JSON.stringify(project.proposal, null, 2)
            });
        }

        for (const key in selectedContext.sections) {
            if (selectedContext.sections[key] && sections[key as SectionNameType]) {
                const sectionKey = key as SectionNameType;
                sourceDocuments.push({
                    fileName: "Report Section: " + sectionKey,
                    content: sections[sectionKey]!
                });
            }
        }

         for (const key in selectedContext.diagrams) {
            if (selectedContext.diagrams[key] && diagrams[key as DiagramType]) {
                const diagramKey = key as DiagramType;
                sourceDocuments.push({
                    fileName: `Diagram: ${diagramKey}`,
                    content: diagrams[diagramKey]!.plantUmlCode
                });
            }
        }

        externalContext.forEach((file, index) => {
            if (selectedContext.externalContext[index]) {
                sourceDocuments.push(file);
            }
        });

        const body = {
            proposal: project?.proposal,
            projectPlan: project?.projectPlan,
            sourceDocuments: sourceDocuments,
            guidelines: getSelectedGuidelines(agent, guidelineState['presentation']),
            templateId: selectedPresentationTemplateId,
            tone: tone,
            complexity: complexity,
        };
        onGenerate(body);
    }

    if (!agentsLoaded || presentationTemplatesLoading || !agent) {
        return <ToolsSkeleton />;
    }

    return (
        <Card className={cn("flex flex-col h-full", isDisabled && 'opacity-50 pointer-events-none')}>
            <PlanViewerDialog plan={generationPlan} onOpenChange={() => setGenerationPlan(null)} />
            <CardHeader>
                 <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="font-headline">{t('builder.presentationGenerator.toolsTitle')}</CardTitle>
                        <CardDescription>{t('builder.presentationGenerator.toolsDesc')}</CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onCollapseToggle}>
                        <PanelLeftClose className="h-5 w-5" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto pr-2">
                <Tabs defaultValue="generate" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="generate">{t('builder.presentationGenerator.generateTab')}</TabsTrigger>
                        <TabsTrigger value="history">{t('builder.presentationGenerator.historyTab')}</TabsTrigger>
                    </TabsList>
                    <TabsContent value="generate" className="pt-6 space-y-4">
                         <div className="space-y-2">
                            <Label htmlFor="presentation-template-select">{t('builder.presentationGenerator.templateLabel')}</Label>
                            <Select value={selectedPresentationTemplateId} onValueChange={setSelectedPresentationTemplateId}>
                                <SelectTrigger id="presentation-template-select">
                                    <SelectValue placeholder="Select a presentation template"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {presentationTemplates?.map(template => (
                                        <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Separator />
                        <div>
                            <h4 className="text-sm font-semibold mb-2">{t('builder.presentationGenerator.sourceDocuments')}</h4>
                             <Accordion type="multiple" className="w-full space-y-1">
                                <AccordionItem value="context-selector">
                                    <AccordionTrigger className="rounded-md px-4 py-2 text-sm font-medium hover:bg-muted hover:no-underline">
                                        {t('builder.presentationGenerator.selectExistingContext')}
                                    </AccordionTrigger>
                                    <AccordionContent className="p-4 border">
                                         <ContextSelector itemKey="presentation" />
                                    </AccordionContent>
                                </AccordionItem>
                                 <AccordionItem value="file-uploader">
                                    <AccordionTrigger className="rounded-md px-4 py-2 text-sm font-medium hover:bg-muted hover:no-underline">
                                        {t('builder.presentationGenerator.uploadNewContext')}
                                    </AccordionTrigger>
                                     <AccordionContent className="p-4 border">
                                         <AcademicUploaders
                                            title=""
                                            onContentAdded={(fileName, content) => addExternalContext(fileName, content, 'context')}
                                            onContentRemoved={removeExternalContext}
                                            isProcessing={isDisabled}
                                            uploadedContent={externalContext}
                                            isContext
                                        />
                                    </AccordionContent>
                                </AccordionItem>
                             </Accordion>
                        </div>

                        <Separator />

                        <div>
                            <h4 className="text-sm font-semibold mb-2">{t('builder.presentationGenerator.generationSettings')}</h4>
                            <Accordion type="multiple" className="w-full space-y-1">
                                 <AccordionItem value="settings">
                                    <AccordionTrigger className="rounded-md px-4 py-2 text-sm font-medium hover:bg-muted hover:no-underline">
                                        <div className="flex items-center gap-2">
                                            <Settings className="h-4 w-4" /> {t('builder.presentationGenerator.advancedSettings')}
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-4 p-4 border">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="tone-select">{t('builder.reportGenerator.tool_tone_label')}</Label>
                                                <Select value={tone} onValueChange={setTone}>
                                                    <SelectTrigger id="tone-select"><SelectValue placeholder={t('builder.reportGenerator.tool_tone_professional')} /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="professional">{t('builder.reportGenerator.tool_tone_professional')}</SelectItem>
                                                        <SelectItem value="casual">{t('builder.reportGenerator.tool_tone_casual')}</SelectItem>
                                                        <SelectItem value="enthusiastic">{t('builder.presentationGenerator.toneEnthusiastic')}</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="complexity-select">{t('builder.presentationGenerator.complexity')}</Label>
                                                <Select value={complexity} onValueChange={setComplexity}>
                                                    <SelectTrigger id="complexity-select"><SelectValue placeholder={t('builder.presentationGenerator.complexityDefault')} /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="summary">{t('builder.presentationGenerator.complexitySummary')}</SelectItem>
                                                        <SelectItem value="detailed">{t('builder.presentationGenerator.complexityDetailed')}</SelectItem>
                                                        <SelectItem value="technical">{t('builder.presentationGenerator.complexityTechnical')}</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="guidelines">
                                    <AccordionTrigger className="rounded-md px-4 py-2 text-sm font-medium hover:bg-muted hover:no-underline">
                                        {t('builder.presentationGenerator.promptAndGuidelines')}
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-4 p-4 border">
                                        <GuidelineEditor itemKey="presentation" agentId="generate-presentation" isAdmin={userProfile?.role === 'admin'} />
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>

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
                                                {isGenerating ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
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
                                            <p>{t('builder.presentationGenerator.tooltips.noContent')}</p>
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
                                                    <span>{p.name} ({t('builder.presentationGenerator.historyItem', {slideCount: (p.slides || []).length})})</span>
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
