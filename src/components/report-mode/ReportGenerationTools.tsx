
'use client';

import { type DiagramType, EvaluateContextOutput, type SectionName as SectionNameType } from '@/ai/schemas';
import { SectionAccordionItem } from '@/components/section/SectionAccordionItem';
import { Accordion } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLocalization } from '@/context/LocalizationContext';
import { useReportGenerationLogic, useSections } from '@/hooks';
import { markdownComponents } from '@/lib/markdown-styles';
import { cn } from '@/lib/utils';
import { Eye, Loader2, Sparkles } from 'lucide-react';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ReportActions } from './ReportActions';

interface GenerationToolsProps {
    onTranslateAll: (targetLang: 'en' | 'ar') => void;
    isTranslating: boolean;
}

function PlanViewerDialog({ plan, onOpenChange }: { plan: EvaluateContextOutput | null, onOpenChange: (open: boolean) => void }) {
    const { data: sectionConfigs } = useSections();
    const { t } = useLocalization();
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
                                    <CardTitle className="text-lg font-headline">{(reportSections as any)[config.section]?.title || config.section}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <div>
                                        <h4 className="font-semibold">{t('builder.presentationGenerator.planViewer.contextItems')}</h4>
                                        <ul className="list-disc pl-5 text-muted-foreground text-xs">
                                            {config.context.sections?.map(s => <li key={s}>{(reportSections as any)[s]?.title || s}</li>)}
                                            {config.context.diagrams?.map(d => <li key={d}>{(diagramSections as any)[d as DiagramType]?.title || d}</li>)}
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

export const GenerationTools = ({ onTranslateAll, isTranslating }: GenerationToolsProps) => {
    const {
        isAnythingGenerating,
        isPlanning,
        activeMutationKey,
        generationPlan,
        setGenerationPlan,
        onGenerateSection,
        onGenerateFullReport,
        handleViewPlan,
        canGenerateFullReport,
        hasCreditsForSingleSection,
        reportTemplates,
        selectedReportTemplateId,
        setSelectedReportTemplateId,
        fullReportCreditCost,
        orderedSections,
    } = useReportGenerationLogic();

    const isDisabled = isAnythingGenerating || isTranslating || isPlanning;
    const { t } = useLocalization();


    return (
        <Card className={cn("flex flex-col h-full", (isDisabled || isTranslating) && 'opacity-50 pointer-events-none')}>
            <PlanViewerDialog plan={generationPlan} onOpenChange={() => setGenerationPlan(null)} />
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="font-headline">{t('builder.reportGenerator.toolsTitle')}</CardTitle>
                        <CardDescription>{t('builder.reportGenerator.toolsDesc')}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto pr-2">
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
                    {orderedSections.map((key) => {
                        const isGeneratingThis = isAnythingGenerating && activeMutationKey === key;
                        return (
                            <SectionAccordionItem
                                key={key}
                                sectionKey={key as SectionNameType}
                                onGenerate={onGenerateSection}
                                isGenerating={isGeneratingThis}
                                isAnythingGenerating={isAnythingGenerating}
                                hasCredits={!!hasCreditsForSingleSection}
                            />
                        );
                    })}
                </Accordion>
            </CardContent>
            <CardFooter>
                <ReportActions onTranslateAll={onTranslateAll} isTranslating={isTranslating} />
            </CardFooter>
        </Card>
    );
};
