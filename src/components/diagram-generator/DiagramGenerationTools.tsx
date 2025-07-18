
'use client';

import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAgents } from '@/hooks/use-agents';
import { cn } from '@/lib/utils';
import { diagramConfig, sectionConfig } from '@/lib/report-config';
import { DiagramTypeSchema, SectionNameSchema, type DiagramType, type SectionName } from '@/ai/schemas';
import { Loader2, Sparkles, Plus, Trash2, BookCheck, GitGraph, Eye, X, UploadCloud, FileText } from 'lucide-react';
import type { Agent, AgentGuideline, AgentPrompt } from '@/lib/agents';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-components';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { useAuth } from '@/context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { GenerateClassDiagramOutput } from '@/ai/flows/generate-class-diagram';
import type { GuidelineState } from '@/hooks/useBuilderStore';
import { useLocalization } from '@/context/LocalizationContext';

const orderedDiagrams = DiagramTypeSchema.options;
const orderedSections = SectionNameSchema.options;

// Helper to get selected guidelines for a specific item
const getSelectedGuidelines = (itemKey: string, guidelineState: Record<string, GuidelineState>, agents: Agent[]): string[] => {
    const agentIdSuffix = `generate-${itemKey}-diagram`;
    const agent = agents.find(a => a.id.startsWith('generate-') && a.id.endsWith('-diagram') && a.id.includes(itemKey));

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

async function generateDiagram(variables: { body: any, token: string }): Promise<GenerateClassDiagramOutput & { imageUrl: string }> {
    const response = await fetch('/api/generate-diagrams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${variables.token}` },
        body: JSON.stringify(variables.body),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate diagram');
    }
    return response.json();
}

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
    return response.json();
}

export const DiagramGenerationTools = () => {
    const { t } = useLocalization();
    const { agents, isLoaded: agentsLoaded } = useAgents();
    const { toast } = useToast();
    const { firebaseUser } = useAuth();
    const queryClient = useQueryClient();
    const [activeMutationKey, setActiveMutationKey] = React.useState<string | null>(null);

    const {
        proposal,
        diagrams,
        sections,
        externalContext,
        guidelineState,
        customGuidelineInput,
        contextSelection,
        setDiagram,
        setExternalContext,
        removeExternalContext,
        handleGuidelineToggle,
        setCustomGuidelineInputForItem,
        handleAddCustomGuidelineForItem,
        handleRemoveCustomGuidelineForItem,
        toggleContextSelection,
    } = useBuilderStore();
    // State for PDF upload
    const [pdfFile, setPdfFile] = React.useState<File | null>(null);
    // Handle diagram generation
    const diagramMutation = useMutation({
        mutationFn: generateDiagram,
        onSuccess: (data, variables) => {
            const diagramKey = variables.body.diagramToGenerate;
            setDiagram(diagramKey, { plantUmlCode: data.plantUmlCode, imageUrl: data.imageUrl });
            queryClient.invalidateQueries({ queryKey: ['user'] });
            toast({ title: t('builder.diagramGenerator.toasts.success', { title: t(diagramConfig[diagramKey].title) }) });
            setActiveMutationKey(null);
        },
        onError: (error: Error, variables) => {
            toast({ title: t('builder.diagramGenerator.toasts.failed', { title: t(diagramConfig[variables.body.diagramToGenerate].title) }), description: error.message, variant: "destructive" });
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
            toast({ title: t('builder.reportGenerator.toasts.contextAdded'), description: t('builder.reportGenerator.toasts.contextAddedDesc', { fileName: file.name }) });
        },
        onError: (error: Error) => {
            toast({ title: t('builder.reportGenerator.toasts.uploadFailed'), description: error.message, variant: "destructive" });
        },
    });
    // Check if anything is generating
    const isAnythingGenerating = diagramMutation.isPending;
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
    // Handle diagram generation
    const onGenerateDiagram = async (diagramType: DiagramType) => {
        if (!firebaseUser) {
            toast({ title: t('builder.toasts.authError'), description: "You must be logged in.", variant: "destructive"});
            return;
        }

        const token = await firebaseUser.getIdToken();
        const selection = contextSelection[diagramType] || { sections: {}, diagrams: {}, externalContext: false };
        const otherSections = Object.entries(selection.sections)
            .filter(([, isSelected]) => isSelected)
            .reduce((acc, [key]) => ({ ...acc, [key]: sections[key as SectionName] }), {});
        
        const otherDiagrams = Object.entries(selection.diagrams)
            .filter(([, isSelected]) => isSelected)
            .reduce((acc, [key]) => ({ ...acc, [key]: diagrams[key as DiagramType]?.plantUmlCode }), {});

        const body = {
            proposal: proposal,
            diagramToGenerate: diagramType,
            otherSections,
            otherDiagrams,
            guidelines: getSelectedGuidelines(diagramType, guidelineState, agents),
            externalContextContent: selection.externalContext ? externalContext?.content : undefined,
        };
        setActiveMutationKey(diagramType);
        diagramMutation.mutate({ body, token });
    };

    const onPdfUpload = async () => {
        if (!pdfFile || !firebaseUser) return;
        const token = await firebaseUser.getIdToken();
        const formData = new FormData();
        formData.append('file', pdfFile);
        pdfMutation.mutate({ formData, token });
    };


    if (!agentsLoaded) {
        return <Card><CardHeader><CardTitle>{t('builder.diagramGenerator.toolsLoading')}</CardTitle></CardHeader><CardContent><Loader2 className="animate-spin" /></CardContent></Card>;
    }
    
    return (
        <Card className={cn(isDisabled && 'opacity-50 pointer-events-none')}>
            <CardHeader>
                <CardTitle className="font-headline">{t('builder.diagramGenerator.toolsTitle')}</CardTitle>
                <CardDescription>{t('builder.diagramGenerator.toolsDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="multiple" className="w-full space-y-1">
                    {orderedDiagrams.map((key) => {
                        const agent = agents.find(a => a.id === diagramConfig[key].agentId);
                        if (!agent) return null;

                        const promptConfig = agent.prompt as AgentPrompt;
                        const hasGuidelines = promptConfig.guidelines && promptConfig.guidelines.length > 0;
                        const { title, icon: Icon } = diagramConfig[key];
                        const isGeneratingThis = isAnythingGenerating && activeMutationKey === key;
                        const currentSelection = contextSelection[key] || { sections: {}, diagrams: {}, externalContext: false };

                        return (
                            <AccordionItem value={key} key={key}>
                                <AccordionTrigger className="rounded-md px-4 py-2 text-sm font-medium hover:bg-muted hover:no-underline">
                                    <div className="flex items-center gap-2">
                                        <Icon className="h-4 w-4" /> {t(title)}
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
                                                <Label className="text-xs font-semibold text-muted-foreground">{t('builder.diagramGenerator.basePrompt')}</Label>
                                                <div className="p-3 rounded-md border bg-muted text-xs">
                                                    <ReactMarkdown components={markdownComponents}>{promptConfig.base}</ReactMarkdown>
                                                </div>
                                            </div>

                                            {hasGuidelines && (
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-semibold text-muted-foreground">{t('builder.diagramGenerator.guidelines')}</Label>
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
                                                <Label className="text-xs font-semibold text-muted-foreground">{t('builder.diagramGenerator.customGuidelines')}</Label>
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
                                                        placeholder={t('builder.diagramGenerator.addGuidelinePlaceholder')}
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
                                        
                                        <TabsContent value="context" className="pt-4">
                                            <ScrollArea className="h-60 w-full">
                                            <div className="space-y-4 pr-4">
                                                    {/* Context selection UI for other sections */}
                                                    <div className="space-y-2">
                                                        <Label className="font-semibold">{t('builder.diagramGenerator.contextSections')}</Label>
                                                        {orderedSections.filter(sKey => sections[sKey]).map(contextKey => (
                                                            <div key={`ctx-s-${key}-${contextKey}`} className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id={`context-section-${key}-${contextKey}`}
                                                                    checked={!!currentSelection.sections[contextKey]}
                                                                    onCheckedChange={(checked) => toggleContextSelection(key, 'sections', contextKey, !!checked)}
                                                                />
                                                                <Label htmlFor={`context-section-${key}-${contextKey}`} className="text-sm font-normal">
                                                                    <div className="flex items-center gap-2">
                                                                        <BookCheck className="h-4 w-4" />
                                                                        {t(sectionConfig[contextKey].title)}
                                                                    </div>
                                                                </Label>
                                                            </div>
                                                        ))}
                                                        {Object.keys(sections).length === 0 && (
                                                          <p className="text-xs text-muted-foreground">{t('builder.diagramGenerator.noSections')}</p>
                                                        )}
                                                    </div>
                                                    {/* Context selection UI for diagrams */}
                                                    {Object.keys(diagrams || {}).length > 0 && (
                                                      <div className="space-y-2 pt-2 border-t">
                                                          <Label className="font-semibold">{t('builder.diagramGenerator.contextDiagrams')}</Label>
                                                          {orderedDiagrams.filter(dKey => dKey !== key && diagrams?.[dKey]).map(contextKey => (
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
                                                     {/* Context selection UI for external file */}
                                                    {externalContext && (
                                                        <div className="space-y-2 pt-2 border-t">
                                                            <Label className="font-semibold">{t('builder.diagramGenerator.externalContext')}</Label>
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
                                            onClick={() => onGenerateDiagram(key as DiagramType)}
                                            disabled={isAnythingGenerating || !agent?.isEnabled}
                                            className="font-headline"
                                            title={!agent?.isEnabled ? t('builder.diagramGenerator.disabledTooltip') : t('builder.diagramGenerator.generateButton', { title: t(title) })}
                                        >
                                            {isGeneratingThis ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                            {t('builder.diagramGenerator.generateButton')}
                                        </Button>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        );
                    })}
                </Accordion>
                <div className="pt-4 mt-4 border-t">
                    <h3 className="text-sm font-semibold mb-2">{t('builder.diagramGenerator.externalContext')}</h3>
                    {externalContext ? (
                        <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground p-2 border rounded-md">
                           <div className="flex items-center gap-2 truncate">
                             <FileText className="h-4 w-4 shrink-0" />
                             <span className="truncate">{externalContext.fileName}</span>
                           </div>
                           <div className="flex items-center">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" title={t('builder.reportGenerator.viewContent')}>
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
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={removeExternalContext} title={t('builder.reportGenerator.removeFile')}>
                                    <X className="h-4 w-4" />
                                </Button>
                           </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Input type="file" accept="application/pdf" onChange={handleFileChange} className="text-xs" />
                            <Button type="button" size="sm" onClick={onPdfUpload} disabled={!pdfFile || pdfMutation.isPending} className="w-full">
                                {pdfMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                                {t('builder.reportGenerator.uploadButton')}
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
