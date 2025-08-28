

'use client';

import React, { useEffect } from 'react';
import { Accordion } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useSectionStore } from '@/hooks';
import { type SectionName as SectionNameType, EvaluateContextOutput } from '@/ai/schemas';
import { Loader2, Sparkles, Eye, PanelLeftClose } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';
import { useReportStore } from '@/hooks';
import { ReportActions } from './ReportActions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import { Skeleton } from '@/components/ui/skeleton';
import { markdownComponents } from '@/lib/markdown-styles';
import { SectionAccordionItem } from '@/components/section/SectionAccordionItem';
import { useReportGenerationLogic } from '@/hooks';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

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
    const {
        isAnythingGenerating,
        isPlanning,
        activeMutationKey,
        generationPlan,
        setGenerationPlan,
        onGenerateSection,
        onGenerateFullReport,
        handleViewPlan,
        availableSections,
        canGenerateFullReport,
        hasCreditsForSingleSection,
        agentsLoaded,
        sectionsLoading,
        templatesLoading,
        reportTemplates,
        selectedReportTemplateId,
        setSelectedReportTemplateId,
        fullReportCreditCost,
    } = useReportGenerationLogic();
    const { sections } = useReportStore();

    const isDisabled = isAnythingGenerating || isTranslating || isPlanning;

    if (!agentsLoaded || sectionsLoading || templatesLoading) {
        return <ToolsSkeleton />;
    }

    return (
        <Card className={cn("flex flex-col h-full", (isDisabled || isTranslating) && 'opacity-50 pointer-events-none')}>
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
                            <Select value={selectedReportTemplateId || ''} onValueChange={(value) => setSelectedReportTemplateId(value as string)}>
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
                                                        {template.sectionIds.map(sectionId => {
                                                            const section = useSectionStore.getState().reportSections[sectionId as SectionNameType];
                                                            return <li key={sectionId}>{section?.title || sectionId}</li>
                                                        })}
                                                    </ul>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="pt-2">
                            <div className="flex gap-2">
                                <Button
                                    onClick={onGenerateFullReport}
                                    className="w-full mb-4 font-headline flex-grow"
                                    disabled={!canGenerateFullReport || isDisabled}
                                >
                                    {activeMutationKey === 'full-report' ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
                                    {fullReportCreditCost > 1 ? `${t('builder.reportGenerator.GenerateFullReport')} (${fullReportCreditCost} Credits)` : 'Report Complete'}
                                </Button>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                             <Button variant="outline" size="icon" onClick={handleViewPlan} disabled={isDisabled || fullReportCreditCost <= 1}>
                                                {isPlanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent><p>View Generation Plan</p></TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>

                        <Accordion type="multiple" className="w-full space-y-1">
                            {availableSections.map((key: any) => {
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
