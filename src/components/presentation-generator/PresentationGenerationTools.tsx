
'use client';

import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAgents } from '@/hooks/use-agents';
import { cn } from '@/lib/utils';
import { useLocalization } from '@/context/LocalizationContext';
import { sectionConfig, diagramConfig } from '@/lib/report-config';
import { SectionNameSchema, DiagramTypeSchema, type SectionName, type DiagramType } from '@/ai/schemas';
import { Loader2, Sparkles, Plus, Trash2, UploadCloud, FileText, X, Eye, BookCheck, GitGraph, Presentation, FileDown, History } from 'lucide-react';
import type { Agent, AgentGuideline, AgentPrompt } from '@/lib/agents';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-components';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { useAuth } from '@/context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { REPORT_GENERATION_TEMPLATES } from '@/lib/report-generation-templates';
import { useReportStore } from '@/hooks/useReportStore';
import { useDiagramStore } from '@/hooks/useDiagramStore';
import type { GuidelineState } from '@/hooks/useReportStore';
import { PptxTemplateKey, templates as pptxStyles } from '@/lib/pptx-styles';
import { exportPresentationAsPptx } from '@/lib/pptx-exporter';
import { usePresentationStore } from '@/hooks/usePresentationStore';
import { usePresentationTemplates, useUpdatePresentationTemplate } from '@/hooks/use-templates';
import { formatDistanceToNow } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { FileUploader } from '../FileUploader';
import { PasteTextUploader } from '../PasteTextUploader';
import { ImageUploader } from '../ImageUploader';


const orderedSections = Object.keys(sectionConfig) as SectionName[];
const orderedDiagrams = Object.keys(diagramConfig) as DiagramType[];

interface PresentationGenerationToolsProps {
    isDisabled: boolean;
    isGenerating: boolean;
    onGenerate: (variables: any) => void;
}

const PPTX_TEMPLATE_KEY = 'arkan-pptx-template';

// Helper to get selected guidelines for a specific item
const getSelectedGuidelines = (itemKey: string, guidelineState: Record<string, GuidelineState>, agents: Agent[]): string[] => {
    const agent = agents.find(a => a.id === 'generate-presentation');
    const currentGuidelineState = guidelineState[itemKey];

    if (!agent || !currentGuidelineState) return guidelineState[itemKey]?.custom || [];

    const promptConfig = agent.prompt as AgentPrompt;
    if (typeof promptConfig === 'string' || !promptConfig.guidelines) {
        return currentGuidelineState.custom || [];
    }

    const guidelines: string[] = [];
    promptConfig.guidelines.forEach((g, index) => {
        if (currentGuidelineState.checked[index]) guidelines.push(g.text);
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

    const {
        externalContext,
        guidelineState,
        customGuidelineInput,
        contextSelection,
        selectedPresentationTemplateId,
        setSelectedPresentationTemplateId,
        toggleContextSelection,
        handleGuidelineToggle,
        setCustomGuidelineInputForItem,
        handleAddCustomGuidelineForItem,
        handleRemoveCustomGuidelineForItem,
     } = useReportStore(state => ({
        externalContext: state.externalContext,
        guidelineState: state.guidelineState,
        customGuidelineInput: state.customGuidelineInput,
        contextSelection: state.contextSelection,
        selectedPresentationTemplateId: state.selectedPresentationTemplateId,
        setSelectedPresentationTemplateId: state.setSelectedPresentationTemplateId,
        toggleContextSelection: state.toggleContextSelection,
        handleGuidelineToggle: (index: number, checked: boolean) => state.handleGuidelineToggle('presentation', index, checked),
        setCustomGuidelineInputForItem: (value: string) => state.setCustomGuidelineInputForItem('presentation', value),
        handleAddCustomGuidelineForItem: () => state.handleAddCustomGuidelineForItem('presentation'),
        handleRemoveCustomGuidelineForItem: (index: number) => state.handleRemoveCustomGuidelineForItem('presentation', index),
     }));

    const { agents, isLoaded: agentsLoaded } = useAgents();
    const { data: presentationTemplates, isLoading: presentationTemplatesLoading } = usePresentationTemplates();

    const agent = agents.find(a => a.id === 'generate-presentation');
    const selectedTemplate = presentationTemplates?.find(t => t.id === selectedPresentationTemplateId);

    const presentations = presentation?.history || [];
    const hasContent = Object.keys(sections).length > 0 || Object.keys(diagrams || {}).length > 0;

    const handleGenerateClick = () => {
        const selection = contextSelection['presentation'] || { sections: {}, diagrams: {}, externalContext: false };

        const selectedSections = Object.entries(selection.sections)
            .filter(([, isSelected]) => isSelected)
            .reduce((acc, [key]) => ({ ...acc, [key]: sections[key as SectionName] }), {});

        const selectedDiagrams = Object.entries(selection.diagrams)
            .filter(([, isSelected]) => isSelected)
            .reduce((acc, [key]) => ({ ...acc, [key]: diagrams[key as DiagramType]?.plantUmlCode }), {});

        const body = {
            proposal: proposal,
            sections: selectedSections,
            diagrams: selectedDiagrams,
            guidelines: getSelectedGuidelines('presentation', guidelineState, agents),
            externalContextContent: selection.externalContext && externalContext ? externalContext.map(c => c.content).join('\n\n---\n\n') : undefined,
            templateId: selectedPresentationTemplateId, // Pass the templateId
        };
        onGenerate(body);
    }

    if (!agentsLoaded || presentationTemplatesLoading || !agent) {
        return <ToolsSkeleton />;
    }

    const promptConfig = agent.prompt as AgentPrompt;
    const hasGuidelines = promptConfig.guidelines && promptConfig.guidelines.length > 0;
    const currentGuidelineState = guidelineState.presentation;
    const currentSelection = contextSelection['presentation'] || { sections: {}, diagrams: {}, externalContext: false };

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
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold text-muted-foreground">{t('builder.reportGenerator.tool_prompt_label')}</Label>
                                                <div className="p-3 rounded-md border bg-muted text-xs">
                                                    <ReactMarkdown components={markdownComponents}>{promptConfig.base}</ReactMarkdown>
                                                </div>
                                            </div>

                                            {hasGuidelines && (
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-semibold text-muted-foreground">{t('builder.reportGenerator.guidelines')}</Label>
                                                    <div className="space-y-2 p-3 rounded-md border">
                                                        {promptConfig.guidelines!.map((guideline, index) => (
                                                            <div key={index} className="flex items-start gap-2">
                                                                <Checkbox
                                                                    id={`guideline-presentation-${index}`}
                                                                    checked={currentGuidelineState?.checked[index] ?? false}
                                                                    onCheckedChange={(checked) => handleGuidelineToggle(index, !!checked)}
                                                                />
                                                                <Label htmlFor={`guideline-presentation-${index}`} className="font-normal text-sm flex-1">
                                                                    <ReactMarkdown components={markdownComponents}>{guideline.text}</ReactMarkdown>
                                                                </Label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold text-muted-foreground">{t('builder.reportGenerator.customGuidelines')}</Label>
                                                {currentGuidelineState?.custom.map((custom, index) => (
                                                    <div key={index} className="flex items-center gap-2 text-sm">
                                                        <span>- {custom}</span>
                                                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => handleRemoveCustomGuidelineForItem(index)}>
                                                            <Trash2 className="h-3 w-3 text-destructive" />
                                                        </Button>
                                                    </div>
                                                ))}
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder={t('builder.reportGenerator.addGuidelinePlaceholder')}
                                                        value={customGuidelineInput['presentation'] || ''}
                                                        onChange={(e) => setCustomGuidelineInputForItem(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomGuidelineForItem())}
                                                    />
                                                    <Button type="button" variant="secondary" onClick={() => handleAddCustomGuidelineForItem()}>
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="context" className="pt-4">
                                            <div className="space-y-2">
                                                <Label className="font-semibold">{t('builder.reportGenerator.tool_tab_context')}</Label>
                                                {!hasContent && !externalContext ? (
                                                    <p className="text-xs text-muted-foreground p-3 rounded-md border text-center">
                                                        {t('builder.reportGenerator.no_other_sections')}
                                                    </p>
                                                ) : (
                                                    <ScrollArea className="h-48 border rounded-md p-2">
                                                      <div className="space-y-4 pr-4">
                                                          <div className="space-y-2">
                                                              <Label className="font-semibold">{t('builder.reportGenerator.context_sections')}</Label>
                                                              {orderedSections.filter(sKey => sections[sKey]).map(contextKey => (
                                                                  <div key={`ctx-s-pres-${contextKey}`} className="flex items-center space-x-2">
                                                                      <Checkbox
                                                                          id={`context-section-pres-${contextKey}`}
                                                                          checked={!!currentSelection.sections[contextKey]}
                                                                          onCheckedChange={(checked) => toggleContextSelection('presentation', 'sections', contextKey, !!checked)}
                                                                      />
                                                                      <Label htmlFor={`context-section-pres-${contextKey}`} className="text-sm font-normal">
                                                                          <div className="flex items-center gap-2">
                                                                              <BookCheck className="h-4 w-4" />
                                                                              {t(sectionConfig[contextKey].title)}
                                                                          </div>
                                                                      </Label>
                                                                  </div>
                                                              ))}
                                                              {Object.keys(sections).length === 0 && (
                                                                <p className="text-xs text-muted-foreground">{t('builder.reportGenerator.no_other_sections')}</p>
                                                              )}
                                                          </div>
                                                          {Object.keys(diagrams || {}).length > 0 && (
                                                            <div className="space-y-2 pt-2 border-t">
                                                                <Label className="font-semibold">{t('builder.reportGenerator.context_diagrams')}</Label>
                                                                {orderedDiagrams.filter(dKey => diagrams?.[dKey]).map(contextKey => (
                                                                    <div key={`ctx-d-pres-${contextKey}`} className="flex items-center space-x-2">
                                                                        <Checkbox
                                                                            id={`context-diagram-pres-${contextKey}`}
                                                                            checked={!!currentSelection.diagrams[contextKey]}
                                                                            onCheckedChange={(checked) => toggleContextSelection('presentation', 'diagrams', contextKey, !!checked)}
                                                                        />
                                                                        <Label htmlFor={`context-diagram-pres-${contextKey}`} className="text-sm font-normal">
                                                                            <div className="flex items-center gap-2">
                                                                                <GitGraph className="h-4 w-4" />
                                                                                {t(diagramConfig[contextKey].title)}
                                                                            </div>
                                                                        </Label>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                          )}
                                                          {externalContext.length > 0 && (
                                                            <div className="space-y-2 pt-2 border-t">
                                                                <Label className="font-semibold">{t('builder.reportGenerator.externalContext')}</Label>
                                                                {externalContext.map((item, index) => (
                                                                    <div key={index} className="flex items-center space-x-2">
                                                                        <Checkbox
                                                                            id={`context-external-${'presentation'}-${index}`}
                                                                            checked={!!currentSelection.externalContext[index]}
                                                                            onCheckedChange={(checked) => toggleContextSelection('presentation', 'externalContext', index, !!checked)}
                                                                        />
                                                                        <Label htmlFor={`context-external-${'presentation'}-${index}`} className="text-sm font-normal">
                                                                            <div className="flex items-center gap-2">
                                                                                <FileText className="h-4 w-4" />
                                                                                {item.fileName}
                                                                            </div>
                                                                        </Label>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                          )}
                                                      </div>
                                                    </ScrollArea>
                                                )}
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                        <div className="pt-4">
                           <Button
                                type="button"
                                onClick={handleGenerateClick}
                                disabled={isDisabled || isGenerating}
                                className="font-headline w-full"
                                title={t('builder.presentationGenerator.generateButton')}
                            >
                                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                {t('builder.presentationGenerator.generateButton')}
                            </Button>
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
