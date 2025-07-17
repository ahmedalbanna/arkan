
'use client';

import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAgents } from '@/hooks/use-agents';
import { cn } from '@/lib/utils';
import { presentationConfig, sectionConfig, diagramConfig } from '@/lib/report-config';
import { Loader2, Sparkles, Plus, Trash2, BookCheck, GitGraph, Presentation, FileDown } from 'lucide-react';
import type { Agent, AgentPrompt } from '@/lib/agents';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-components';
import { ScrollArea } from '../ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePptxStyles } from '@/hooks/use-pptx-styles';
import { PptxTemplateKey } from '@/lib/pptx-styles';
import { exportPresentationAsPptx } from '@/lib/pptx-exporter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import type { DiagramType, SectionName } from '@/ai/schemas';

const orderedSections = Object.keys(sectionConfig) as SectionName[];
const orderedDiagrams = Object.keys(diagramConfig) as DiagramType[];

interface PresentationGenerationToolsProps {
    isDisabled: boolean;
    isGenerating: boolean;
    onGenerate: (variables: any) => void;
}

const PPTX_TEMPLATE_KEY = 'arkan-pptx-template';

// Helper to get selected guidelines for a specific item
const getSelectedGuidelines = (itemKey: string, guidelineState: Record<string, any>, agents: any[]): string[] => {
    const agentIdSuffix = itemKey;
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

export const PresentationGenerationTools = (props: PresentationGenerationToolsProps) => {
    const { 
        isDisabled, 
        isGenerating,
        onGenerate,
    } = props;

    const { 
        proposal,
        sections,
        diagrams,
        guidelineState,
        customGuidelineInput,
        presentation,
        contextSelection,
        toggleContextSelection,
        handleGuidelineToggle,
        setCustomGuidelineInputForItem,
        handleAddCustomGuidelineForItem,
        handleRemoveCustomGuidelineForItem,
     } = useBuilderStore(state => ({
        proposal: state.proposal,
        sections: state.sections,
        diagrams: state.diagrams,
        guidelineState: state.guidelineState,
        customGuidelineInput: state.customGuidelineInput,
        presentation: state.presentation,
        contextSelection: state.contextSelection,
        toggleContextSelection: state.toggleContextSelection,
        handleGuidelineToggle: (index: number, checked: boolean) => state.handleGuidelineToggle('presentation', index, checked),
        setCustomGuidelineInputForItem: (value: string) => state.setCustomGuidelineInputForItem('presentation', value),
        handleAddCustomGuidelineForItem: () => state.handleAddCustomGuidelineForItem('presentation'),
        handleRemoveCustomGuidelineForItem: (index: number) => state.handleRemoveCustomGuidelineForItem('presentation', index),
     }));

    const { agents, isLoaded: agentsLoaded } = useAgents();
    const { templates: pptxTemplates, isLoaded: pptxLoaded } = usePptxStyles();
    const [selectedPptxTemplate, setSelectedPptxTemplate] = React.useState<PptxTemplateKey>('modern');

    const agent = agents.find(a => a.id === presentationConfig.presentation.agentId);

    const presentations = presentation?.history || [];
    const hasContent = Object.keys(sections).length > 0 || Object.keys(diagrams || {}).length > 0;

    React.useEffect(() => {
        const savedPptxTemplate = localStorage.getItem(PPTX_TEMPLATE_KEY) as PptxTemplateKey | null;
        if (savedPptxTemplate && pptxTemplates[savedPptxTemplate]) {
          setSelectedPptxTemplate(savedPptxTemplate);
        }
    }, [pptxTemplates]);

    const handlePptxTemplateChange = (key: PptxTemplateKey) => {
        setSelectedPptxTemplate(key);
        localStorage.setItem(PPTX_TEMPLATE_KEY, key);
    }
    
    const handleExportPresentation = async () => {
        if (!presentations || presentations.length === 0) return;
        const activePresentation = presentations.find(p => p.id === useBuilderStore.getState().activePresentationId) || presentations[0];
        await exportPresentationAsPptx(activePresentation.slides, selectedPptxTemplate);
    }

    const handleGenerateClick = () => {
        const selection = contextSelection['presentation'] || { sections: {}, diagrams: {} };

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
        };
        onGenerate(body);
    }
    

    if (!agentsLoaded || !agent) {
        return <Card><CardHeader><CardTitle>Loading Tools...</CardTitle></CardHeader><CardContent><Loader2 className="animate-spin" /></CardContent></Card>
    }

    const promptConfig = agent.prompt as AgentPrompt;
    const hasGuidelines = promptConfig.guidelines && promptConfig.guidelines.length > 0;
    const currentGuidelineState = guidelineState.presentation;
    const currentSelection = contextSelection['presentation'] || { sections: {}, diagrams: {} };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="pptx-template-select">PPTX Template</Label>
                        {pptxLoaded ? (
                        <Select value={selectedPptxTemplate} onValueChange={handlePptxTemplateChange}>
                            <SelectTrigger id="pptx-template-select">
                                <SelectValue placeholder="Select a template" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(pptxTemplates).map(([key, template]) => (
                                    <SelectItem key={key} value={key}>{(template as any).name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        ) : <Loader2 className="h-5 w-5 animate-spin" /> }
                    </div>
                    <Button onClick={handleExportPresentation} disabled={isGenerating || !presentations || presentations.length === 0} className="w-full font-headline">
                        <FileDown className="mr-2 h-4 w-4" />
                        Export Presentation
                    </Button>
                </CardContent>
            </Card>

            <Card className={cn(isDisabled && 'opacity-50 pointer-events-none')}>
                <CardHeader>
                    <CardTitle className="font-headline">Generation Tools</CardTitle>
                    <CardDescription>Configure and generate the presentation.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible defaultValue="presentation" className="w-full space-y-1">
                        <AccordionItem value="presentation">
                            <AccordionTrigger className="rounded-md px-4 py-2 text-sm font-medium hover:bg-muted hover:no-underline">
                                <div className="flex items-center gap-2">
                                    <Presentation className="h-4 w-4" /> {presentationConfig.presentation.title}
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-4 p-4">
                                <Tabs defaultValue="prompt" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="prompt">Prompt</TabsTrigger>
                                        <TabsTrigger value="context">Context</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="prompt" className="pt-4 space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-muted-foreground">Base Prompt</Label>
                                            <div className="p-3 rounded-md border bg-muted text-xs">
                                                <ReactMarkdown components={markdownComponents}>{promptConfig.base}</ReactMarkdown>
                                            </div>
                                        </div>

                                        {hasGuidelines && (
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold text-muted-foreground">Guidelines</Label>
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
                                            <Label className="text-xs font-semibold text-muted-foreground">Custom Guidelines</Label>
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
                                                    placeholder="Add a custom guideline..."
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
                                            <Label className="font-semibold">Context from Current Session</Label>
                                            {!hasContent ? (
                                                <p className="text-xs text-muted-foreground p-3 rounded-md border text-center">
                                                    No sections or diagrams have been generated yet.
                                                </p>
                                            ) : (
                                                <ScrollArea className="h-48 border rounded-md p-2">
                                                  <div className="space-y-4 pr-4">
                                                      <div className="space-y-2">
                                                          <Label className="font-semibold">Sections</Label>
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
                                                                          {sectionConfig[contextKey].title}
                                                                      </div>
                                                                  </Label>
                                                              </div>
                                                          ))}
                                                      </div>
                                                      {Object.keys(diagrams || {}).length > 0 && (
                                                        <div className="space-y-2 pt-2 border-t">
                                                            <Label className="font-semibold">Diagrams</Label>
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
                                                                            {diagramConfig[contextKey].title}
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
                </CardContent>
                <CardFooter>
                    <Button
                        type="button"
                        onClick={handleGenerateClick}
                        disabled={isDisabled || isGenerating}
                        className="font-headline w-full"
                        title={!agent?.isEnabled ? 'This agent is disabled' : 'Generate Presentation'}
                    >
                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Generate Presentation
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};
