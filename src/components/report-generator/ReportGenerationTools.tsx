
'use client';

import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAgents } from '@/hooks/use-agents';
import { cn } from '@/lib/utils';
import { useLocalization } from '@/context/LocalizationContext';
import { sectionConfig, diagramConfig } from '@/lib/report-config';
import { SectionNameSchema, DiagramTypeSchema, type SectionName, type DiagramType } from '@/ai/schemas';
import { Loader2, Sparkles, Plus, Trash2, UploadCloud, FileText, X, Eye, BookCheck, GitGraph } from 'lucide-react';
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
import type { GenerateIntroductionOutput } from '@/ai/flows/generate-introduction';
import { REPORT_GENERATION_TEMPLATES } from '@/lib/report-generation-templates';
import { useReportStore } from '@/hooks/useReportStore';
import { useDiagramStore } from '@/hooks/useDiagramStore';
import type { GuidelineState } from '@/hooks/useReportStore';


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
// Helper function to generate a section or a full report
async function generateReport(variables: any): Promise<any> {
    const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${variables.token}` },
        body: JSON.stringify(variables),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate report');
    }
    return await response.json();
}
// Helper function to upload a PDF
async function uploadPdf(variables: {formData: FormData, token: string}): Promise<{ markdown: string }> {
     const response = await fetch('/api/pdf-to-markdown', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${variables.token}` },
        body: variables.formData,
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to process PDF');
    }
    return await response.json();
}

export const GenerationTools = () => {
    const { t, locale } = useLocalization();
    const { agents, isLoaded: agentsLoaded } = useAgents();
    const { toast } = useToast();
    const { firebaseUser } = useAuth();
    const queryClient = useQueryClient();
    const [activeMutationKey, setActiveMutationKey] = React.useState<string | null>(null);

    const { proposal } = useBuilderStore();
    const { diagrams } = useDiagramStore();

    // Use the correct store for report-related state
    const {
        sections,
        evaluation,
        externalContext,
        controlState,
        guidelineState,
        customGuidelineInput,
        contextSelection,
        selectedReportTemplateId,
        setSelectedReportTemplateId,
        setSection,
        setAllSections,
        setEvaluation,
        setExternalContext,
        removeExternalContext,
        handleControlChange,
        handleGuidelineToggle,
        setCustomGuidelineInputForItem,
        handleAddCustomGuidelineForItem,
        handleRemoveCustomGuidelineForItem,
        toggleContextSelection,
    } = useReportStore();

    // State for PDF upload
    const [pdfFile, setPdfFile] = React.useState<File | null>(null);

    // Handle section/report generation
    const reportMutation = useMutation({
        mutationFn: generateReport,
        onSuccess: (data, variables) => {
            if (variables.templateId) { // Full report was generated
                setAllSections(data.sections);
                toast({ title: `Full report generated successfully!` });
            } else { // Single section
                const sectionKey = variables.sectionToGenerate;
                const content = Object.values(data)[0] as string;
                setSection(sectionKey, content);
                toast({ title: `Section "${sectionConfig[sectionKey].title}" generated successfully!` });
            }
            queryClient.invalidateQueries({ queryKey: ['user'] });
            setActiveMutationKey(null);
        },
        onError: (error: Error, variables) => {
            const item = variables.templateId || variables.sectionToGenerate;
            toast({ title: `Failed to generate "${item}"`, description: error.message, variant: "destructive" });
            setActiveMutationKey(null);
        },
    });

    // Handle PDF upload
    const pdfMutation = useMutation({
        mutationFn: uploadPdf,
        onSuccess: (data, variables) => {
            const file = variables.formData.get('file') as File;
            setExternalContext(file.name, data.markdown);
            queryClient.invalidateQueries({ queryKey: ['user'] });
            toast({ title: "Context Added", description: `Successfully processed ${file.name}.` });
        },
        onError: (error: Error) => {
            toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
        },
    });
    // Check if anything is generating
    const isAnythingGenerating = reportMutation.isPending;
    const isDisabled = isAnythingGenerating;

    // Handle file upload
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            if (file.type === 'application/pdf') {
                setPdfFile(file);
            } else {
                toast({ title: "Invalid File Type", description: "Please upload a PDF file.", variant: "destructive" });
            }
        }
    };

    // Handle single section generation
    const onGenerateSection = async (section: SectionName) => {
        if (!firebaseUser) {
            toast({ title: "Authentication Error", description: "You must be logged in.", variant: "destructive"});
            return;
        };

        const token = await firebaseUser.getIdToken();
        const selection = contextSelection[section] || { sections: {}, diagrams: {}, externalContext: false };
        const otherSections = Object.entries(selection.sections)
            .filter(([, isSelected]) => isSelected)
            .reduce((acc, [key]) => ({ ...acc, [key]: sections[key as SectionName] }), {});

        const otherDiagrams = Object.entries(selection.diagrams)
            .filter(([, isSelected]) => isSelected)
            .reduce((acc, [key]) => ({ ...acc, [key]: diagrams[key as DiagramType]?.plantUmlCode }), {});


        const body = {
            proposal: proposal,
            sectionToGenerate: section,
            otherSections,
            otherDiagrams,
            guidelines: getSelectedGuidelines(section, guidelineState, agents),
            instructionText: generateInstructionText(controlState[section]),
            externalContextContent: selection.externalContext ? externalContext?.content : undefined,
            locale,
            token,
        };
        setActiveMutationKey(section);
        reportMutation.mutate(body);
    };

    // Handle full report generation
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
            locale,
            token,
        };
        setActiveMutationKey(selectedReportTemplateId);
        reportMutation.mutate(body);
    };

    const onPdfUpload = async () => {
        if (!pdfFile || !firebaseUser) return;
        const token = await firebaseUser.getIdToken();
        const formData = new FormData();
        formData.append('file', pdfFile);
        pdfMutation.mutate({ formData, token });
    };

    if (!agentsLoaded) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">{t('builder.reportGenerator.step3Title')}</CardTitle>
                    <CardDescription>{t('builder.reportGenerator.step3Desc')}</CardDescription>
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
                <CardTitle className="font-headline">{t('builder.reportGenerator.step3Title')}</CardTitle>
                <CardDescription>{t('builder.reportGenerator.step3Desc')}</CardDescription>
            </CardHeader>
            <CardContent>
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
                        const currentSelection = contextSelection[key] || { sections: {}, diagrams: {}, externalContext: false };

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
                                                    {/* Context selection UI for other sections */}
                                                    <div className="space-y-2">
                                                        <Label className="font-semibold">{t('builder.reportGenerator.ContextualSections')}</Label>
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
                                                                        {sectionConfig[contextKey].title}
                                                                    </div>
                                                                </Label>
                                                            </div>
                                                        ))}
                                                        {orderedSections.filter(sKey => sKey !==key && !sections[sKey]).length === orderedSections.length -1 && (
                                                            <p className="text-xs text-muted-foreground">{t('builder.reportGenerator.noOtherSections')}</p>
                                                        )}
                                                    </div>
                                                    {/* Context selection UI for diagrams */}
                                                    {Object.keys(diagrams || {}).length > 0 && (
                                                      <div className="space-y-2 pt-2 border-t">
                                                            <Label className="font-semibold">{t('builder.reportGenerator.contextualSections')}</Label>
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
                                                                          {diagramConfig[contextKey].title}
                                                                      </div>
                                                                  </Label>
                                                              </div>
                                                          ))}
                                                      </div>
                                                    )}
                                                    {/* Context selection UI for external file */}
                                                    {externalContext && (
                                                        <div className="space-y-2 pt-2 border-t">
                                                            <Label className="font-semibold">{t('builder.reportGenerator.externalContext')}</Label>
                                                            <div className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id={`context-external-${key}`}
                                                                    checked={!!currentSelection.externalContext}
                                                                    onCheckedChange={(checked) => toggleContextSelection(key, 'externalContext', null, !!checked)}
                                                                />
                                                                <Label htmlFor={`context-external-${key}`} className="text-sm font-normal">
                                                                    <div className="flex items-center gap-2">
                                                                        <FileText className="h-4 w-4" />
                                                                        {externalContext.fileName}
                                                                    </div>
                                                                </Label>
                                                            </div>
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
                                            title={!agent?.isEnabled ? 'This agent is disabled' : `Generate ${title}`}
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
                <div className="pt-4 mt-4 border-t">
                    <h3 className="text-sm font-semibold mb-2">{t('builder.reportGenerator.externalContext')}</h3>
                    {externalContext ? (
                        <div className="space-y-2">
                             <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground p-2 border rounded-md">
                               <div className="flex items-center gap-2 truncate">
                                 <FileText className="h-4 w-4 shrink-0" />
                                 <span className="truncate">{externalContext.fileName}</span>
                               </div>
                               <div className="flex items-center">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-6 w-6" title="View Content">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-3xl">
                                            <DialogHeader>
                                                <DialogTitle>{externalContext.fileName}</DialogTitle>
                                            </DialogHeader>
                                            <ScrollArea className="h-[60vh] rounded-md border p-4">
                                                <ReactMarkdown components={markdownComponents}>{externalContext.content}</ReactMarkdown>
                                            </ScrollArea>
                                        </DialogContent>
                                    </Dialog>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={removeExternalContext} title="Remove File">
                                        <X className="h-4 w-4" />
                                    </Button>
                               </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Input type="file" accept="application/pdf" onChange={handleFileChange} className="text-xs" />
                            <Button type="button" size="sm" onClick={onPdfUpload} disabled={!pdfFile || pdfMutation.isPending} className="w-full">
                                {pdfMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                                Upload & Process PDF
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
