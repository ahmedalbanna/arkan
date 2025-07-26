
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
import { Loader2, Sparkles, Plus, Trash2, UploadCloud, FileText, X, Eye, BookCheck, GitGraph, CheckCircle, FileSpreadsheet, Image as ImageIcon } from 'lucide-react';
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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Slider } from '../ui/slider';
import { ReportActions } from './ReportActions';
import { EvaluationTools } from '../EvaluationTools';
import { FileUploader } from '../FileUploader';
import { PasteTextUploader } from '../PasteTextUploader';
import { ImageUploader } from '../ImageUploader';

const orderedSections = SectionNameSchema.options;
const orderedDiagrams = DiagramTypeSchema.options;

// Helper to get selected guidelines for a specific item
const getSelectedGuidelines = (itemKey: string, guidelineState: Record<string, GuidelineState>, agents: Agent[]): string[] => {
    const agentIdSuffix = `generate-${itemKey}-section`;
    const agent = agents.find(a => a.id.endsWith(agentIdSuffix));
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
    const response = await fetch('/api/generate-report', {
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

export const GenerationTools = ({ onTranslateAll, isTranslating }: GenerationToolsProps) => {
    const { t, locale } = useLocalization();
    const { agents, isLoaded: agentsLoaded } = useAgents();
    const { toast } = useToast();
    const { firebaseUser } = useAuth();
    const queryClient = useQueryClient();
    const [activeMutationKey, setActiveMutationKey] = React.useState<string | null>(null);

    const { proposal } = useBuilderStore();
    const { diagrams } = useDiagramStore();

    const {
        sections,
        externalContext,
        controlState,
        guidelineState,
        customGuidelineInput,
        contextSelection,
        selectedReportTemplateId,
        setSelectedReportTemplateId,
        setSection,
        setAllSections,
        handleControlChange,
        handleGuidelineToggle,
        setCustomGuidelineInputForItem,
        handleAddCustomGuidelineForItem,
        handleRemoveCustomGuidelineForItem,
        toggleContextSelection,
    } = useReportStore();
    
    const handleGenerationResult = (data: any, variables: any) => {
        if (variables.body.templateId) { // Full report was generated
            setAllSections(data.sections);
            toast({ title: `Full report generated successfully!` });
        } else { // Single section
            const sectionKey = variables.body.sectionToGenerate;
            const content = Object.values(data)[0] as string;
            setSection(sectionKey, content);
            toast({ title: `Section "${t(sectionConfig[sectionKey].title)}" generated successfully!` });
        }
        queryClient.invalidateQueries({ queryKey: ['user'] });
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
    const isDisabled = isAnythingGenerating;
        
    const onGenerateSection = async (section: SectionName) => {
        if (!firebaseUser) {
            toast({ title: t('builder.toasts.authError'), description: "You must be logged in.", variant: "destructive"});
            return;
        };

        const token = await firebaseUser.getIdToken();
        const selection = contextSelection[section] || { sections: {}, diagrams: {}, externalContext: [], proposal: true };
        const otherSections = Object.entries(selection.sections)
            .filter(([, isSelected]) => isSelected)
            .reduce((acc, [key]) => ({ ...acc, [key]: sections[key as SectionName] }), {});

        const otherDiagrams = Object.entries(selection.diagrams)
            .filter(([, isSelected]) => isSelected)
            .reduce((acc, [key]) => ({ ...acc, [key]: diagrams[key as DiagramType]?.plantUmlCode }), {});
        
        const selectedExternalContexts = externalContext.filter((_, index) => selection.externalContext[index]);


        const body = {
            proposal: selection.proposal ? proposal : undefined,
            sectionToGenerate: section,
            otherSections,
            otherDiagrams,
            guidelines: getSelectedGuidelines(section, guidelineState, agents),
            instructionText: generateInstructionText(controlState[section]),
            externalContextContent: selectedExternalContexts.map(c => c.content).join('\n\n---\n\n'),
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
        const body = {
            proposal,
            templateId: selectedReportTemplateId,
            existingSections: sections,
            existingDiagrams: Object.fromEntries(Object.entries(diagrams || {}).map(([key, value]) => [key, value.plantUmlCode])),
        };
        setActiveMutationKey(selectedReportTemplateId);
        reportGenerationMutation.mutate({ body, token });
    };

    if (!agentsLoaded) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">{t('builder.reportGenerator.toolsTitle')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        );
    }

    const selectedTemplate = REPORT_GENERATION_TEMPLATES.find(t => t.id === selectedReportTemplateId);
    const availableSections = orderedSections.filter(key => selectedTemplate?.agentIds.includes(sectionConfig[key].agentId));

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
                                <SelectTrigger id="report-template-select">
                                    <SelectValue placeholder={t('builder.reportGenerator.Select_template')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {REPORT_GENERATION_TEMPLATES.map(template => (
                                        <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">{selectedTemplate?.description}</p>
                        </div>

                        <Button onClick={onGenerateFullReport} className="w-full mb-4 font-headline">
                            {isAnythingGenerating && activeMutationKey === selectedReportTemplateId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            {t('builder.reportGenerator.GenerateFullReport')}
                        </Button>
                        
                        <Accordion type="multiple" className="w-full space-y-1">
                            {availableSections.map((key) => {
                                const agent = agents.find(a => a.id === sectionConfig[key as SectionName]?.agentId);
                                if (!agent) return null;

                                const promptConfig = agent.prompt as AgentPrompt;
                                const hasGuidelines = promptConfig.guidelines && promptConfig.guidelines.length > 0;
                                const { title, icon: Icon } = sectionConfig[key];
                                const isGeneratingThis = isAnythingGenerating && activeMutationKey === key;
                                const currentSelection = contextSelection[key] || { sections: {}, diagrams: {}, externalContext: [], proposal: true };

                                return (
                                    <AccordionItem value={key} key={key}>
                                        <AccordionTrigger className="rounded-md px-4 py-2 text-sm font-medium hover:bg-muted hover:no-underline">
                                            <div className="flex items-center gap-2">
                                                <Icon className="h-4 w-4" /> {t(`${title}`)}
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
                                                                            id={`guideline-${key}-${index}`}
                                                                            checked={guidelineState[key]?.checked[index] ?? false}
                                                                            onCheckedChange={(checked) => handleGuidelineToggle(key, index, !!checked)}
                                                                        />
                                                                        <Label htmlFor={`guideline-${key}-${index}`} className="font-normal text-sm flex-1">
                                                                            <ReactMarkdown components={markdownComponents}>{guideline.text}</ReactMarkdown>
                                                                        </Label>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-semibold text-muted-foreground">{t('builder.reportGenerator.customGuidelines')}</Label>
                                                        {guidelineState[key]?.custom.map((custom, index) => (
                                                            <div key={index} className="flex items-center gap-2 text-sm">
                                                                <span>- {custom}</span>
                                                                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => handleRemoveCustomGuidelineForItem(key, index)}>
                                                                    <Trash2 className="h-3 w-3 text-destructive" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                        <div className="flex gap-2">
                                                            <Input
                                                                placeholder={t('builder.reportGenerator.addGuidelinePlaceholder')}
                                                                value={customGuidelineInput[key] || ''}
                                                                onChange={(e) => setCustomGuidelineInputForItem(key, e.target.value)}
                                                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomGuidelineForItem(key))}
                                                            />
                                                            <Button type="button" variant="secondary" onClick={() => handleAddCustomGuidelineForItem(key)}>
                                                                <Plus className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </TabsContent>

                                                <TabsContent value="controls" className="pt-4">
                                                    <div className="space-y-6">
                                                        <div className="space-y-3">
                                                            <Label htmlFor={`formality-${key}`}>{t('builder.reportGenerator.tool_formality_label')}</Label>
                                                            <Slider id={`formality-${key}`} name={`formality_${key}`} value={[controlState[key as SectionName].formality]} onValueChange={(val) => handleControlChange(key as SectionName, 'formality', val[0])} max={100} step={1} />
                                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                                <span>{t('builder.reportGenerator.tool_formality_informal')}</span>
                                                                <span>{t('builder.reportGenerator.tool_formality_balanced')}</span>
                                                                <span>{t('builder.reportGenerator.tool_formality_formal')}</span>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`tone-${key}`}>{t('builder.reportGenerator.tool_tone_label')}</Label>
                                                            <Select name={`tone_${key}`} value={controlState[key as SectionName].tone} onValueChange={(val) => handleControlChange(key as SectionName, 'tone', val)}>
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
                                                            <Input id={`wordCount-${key}`} name={`wordCount_${key}`} type="number" placeholder={t('reportGenerator.tool_word_count_placeholder')} value={controlState[key as SectionName].wordCount} onChange={(e) => handleControlChange(key as SectionName, 'wordCount', e.target.value)} />
                                                        </div>
                                                    </div>
                                                </TabsContent>
                                                <TabsContent value="context" className="pt-4">
                                                    <ScrollArea className="h-60 w-full">
                                                        <div className="space-y-4 pr-4">
                                                            <div className="space-y-2">
                                                                <Label className="font-semibold">{t('builder.reportGenerator.ContextualSections')}</Label>
                                                                <div className="flex items-center space-x-2">
                                                                     <Checkbox id={`context-proposal-${key}`} checked={currentSelection.proposal} onCheckedChange={(checked) => toggleContextSelection(key as SectionName, 'proposal', null, !!checked)} />
                                                                     <Label htmlFor={`context-proposal-${key}`} className="text-sm font-normal"><div className="flex items-center gap-2"><FileSpreadsheet className="h-4 w-4" /> Project Proposal</div></Label>
                                                                </div>
                                                                {orderedSections.filter(sKey => sKey !== key && sections[sKey]).map(contextKey => (
                                                                    <div key={`ctx-s-${key}-${contextKey}`} className="flex items-center space-x-2">
                                                                        <Checkbox
                                                                            id={`context-section-${key}-${contextKey}`}
                                                                            checked={!!currentSelection.sections[contextKey]}
                                                                            onCheckedChange={(checked) => toggleContextSelection(key as SectionName, 'sections', contextKey, !!checked)}
                                                                        />
                                                                        <Label htmlFor={`context-section-${key}-${contextKey}`} className="text-sm font-normal">
                                                                            <div className="flex items-center gap-2">
                                                                                <BookCheck className="h-4 w-4" />
                                                                                {t(sectionConfig[contextKey].title)}
                                                                            </div>
                                                                        </Label>
                                                                    </div>
                                                                ))}
                                                                {Object.values(sections).filter(Boolean).length <= 1 && orderedSections.filter(sKey => sKey !== key).length > 0 && (
                                                                    <p className="text-xs text-muted-foreground">{t('builder.reportGenerator.noOtherSections')}</p>
                                                                )}
                                                            </div>
                                                            {Object.keys(diagrams || {}).length > 0 && (
                                                              <div className="space-y-2 pt-2 border-t">
                                                                    <Label className="font-semibold">{t('builder.reportGenerator.context_diagrams')}</Label>
                                                                  {orderedDiagrams.filter(dKey => diagrams?.[dKey]).map(contextKey => (
                                                                      <div key={`ctx-d-${key}-${contextKey}`} className="flex items-center space-x-2">
                                                                          <Checkbox
                                                                              id={`context-diagram-${key}-${contextKey}`}
                                                                              checked={!!currentSelection.diagrams[contextKey]}
                                                                              onCheckedChange={(checked) => toggleContextSelection(key, 'diagrams', contextKey, !!checked)}
                                                                          />
                                                                          <Label htmlFor={`context-diagram-${key}-${contextKey}`} className="text-sm font-normal">
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
                                                                     {externalContext.map((contextItem, index) => (
                                                                        <div key={index} className="flex items-center space-x-2">
                                                                            <Checkbox
                                                                                id={`context-external-${key}-${index}`}
                                                                                checked={!!currentSelection.externalContext?.[index]}
                                                                                onCheckedChange={(checked) => toggleContextSelection(key, 'externalContext', index, !!checked)}
                                                                            />
                                                                            <Label htmlFor={`context-external-${key}-${index}`} className="text-sm font-normal">
                                                                                <div className="flex items-center gap-2">
                                                                                    <FileText className="h-4 w-4" />
                                                                                    {contextItem.fileName}
                                                                                </div>
                                                                            </Label>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                              )}
                                                        </div>
                                                    </ScrollArea>
                                                </TabsContent>
                                            </Tabs>
                                            <div className="pt-2">
                                               <Button
                                                    type="button"
                                                    onClick={() => onGenerateSection(key)}
                                                    disabled={isAnythingGenerating || !agent?.isEnabled}
                                                    className="font-headline"
                                                    title={!agent?.isEnabled ? 'This agent is disabled' : `Generate ${t(title)}`}
                                                >
                                                    {isGeneratingThis ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                                    {`${t('builder.reportGenerator.generateButton')} ${t(`${title}`)}`}
                                                </Button>
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
                    <h3 className="text-sm font-semibold mb-2">{t('builder.diagramGenerator.externalContext')}</h3>
                    <Tabs defaultValue="file" className="w-full">
                         <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="file"><UploadCloud className="mr-2 h-4 w-4" /> Upload PDF</TabsTrigger>
                            <TabsTrigger value="text"><FileText className="mr-2 h-4 w-4" /> Paste Text</TabsTrigger>
                            <TabsTrigger value="image"><ImageIcon className="mr-2 h-4 w-4" /> Upload Image</TabsTrigger>
                        </TabsList>
                        <TabsContent value="file" className="mt-4">
                            <FileUploader />
                        </TabsContent>
                         <TabsContent value="text" className="mt-4">
                            <PasteTextUploader />
                        </TabsContent>
                        <TabsContent value="image" className="mt-4">
                            <ImageUploader />
                        </TabsContent>
                    </Tabs>
                </div>
            </CardContent>
        </Card>
    );
};
