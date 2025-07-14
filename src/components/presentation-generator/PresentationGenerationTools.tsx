
'use client';

import React, { useState } from 'react';
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
import type { PresentationSlide } from '@/ai/schemas';

interface PresentationGenerationToolsProps {
    isDisabled: boolean;
    isGenerating: boolean;
    onGenerate: () => void;
    reportState: { sections: Record<string, any>, diagrams: Record<string, any> };
    onContextFileChange: (file: File | null) => void;
    contextSelections: { sections: Record<string, boolean>, diagrams: Record<string, boolean> };
    onContextToggle: (type: 'sections' | 'diagrams', key: string) => void;
    slides?: PresentationSlide[];
}

const PPTX_TEMPLATE_KEY = 'arkan-pptx-template';

export const PresentationGenerationTools = ({ 
    isDisabled, 
    isGenerating,
    onGenerate,
    reportState,
    onContextFileChange,
    contextSelections,
    onContextToggle,
    slides,
}: PresentationGenerationToolsProps) => {
    const { agents, isLoaded: agentsLoaded } = useAgents();
    const { templates: pptxTemplates, isLoaded: pptxLoaded } = usePptxStyles();
    const [selectedPptxTemplate, setSelectedPptxTemplate] = useState<PptxTemplateKey>('modern');

    const agent = agents.find(a => a.id === presentationConfig.presentation.agentId);

    const hasReportContent = Object.keys(reportState.sections).length > 0 || Object.keys(reportState.diagrams).length > 0;

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
    
    const handleExportPresentation = () => {
        if (!slides) return;
        exportPresentationAsPptx(slides, selectedPptxTemplate);
    }

    if (!agentsLoaded || !agent) {
        return <Card><CardHeader><CardTitle>Loading Tools...</CardTitle></CardHeader><CardContent><Loader2 className="animate-spin" /></CardContent></Card>
    }

    const promptConfig = agent.prompt as AgentPrompt;

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
                    <Button onClick={handleExportPresentation} disabled={isGenerating || !slides || slides.length === 0} className="w-full font-headline">
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
                                <div className="space-y-2">
                                    <Label className="font-semibold">Base Prompt</Label>
                                    <div className="p-3 rounded-md border bg-muted text-xs">
                                        <ReactMarkdown components={markdownComponents}>{promptConfig.base}</ReactMarkdown>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-semibold">Context from Report File</Label>
                                    <Input
                                        type="file"
                                        accept=".json"
                                        onChange={(e) => onContextFileChange(e.target.files?.[0] ?? null)}
                                        className="text-xs w-full"
                                        disabled={isGenerating}
                                    />
                                    {hasReportContent && (
                                        <div className="space-y-2 pt-2">
                                            <Label className="text-xs text-muted-foreground">Select content to include:</Label>
                                            <ScrollArea className="h-48 border rounded-md p-2">
                                                <div className="space-y-2">
                                                    <h4 className="text-sm font-semibold flex items-center gap-2"><BookCheck className="h-4 w-4" /> Sections</h4>
                                                    {Object.keys(reportState.sections).map((key) => (
                                                        <div key={key} className="flex items-center space-x-2 pl-2">
                                                            <Checkbox
                                                                id={`context-section-${key}`}
                                                                checked={contextSelections.sections[key] ?? false}
                                                                onCheckedChange={() => onContextToggle('sections', key)}
                                                            />
                                                            <Label htmlFor={`context-section-${key}`} className="text-sm font-normal">
                                                                {sectionConfig[key as keyof typeof sectionConfig].title}
                                                            </Label>
                                                        </div>
                                                    ))}

                                                    <h4 className="text-sm font-semibold flex items-center gap-2 pt-2"><GitGraph className="h-4 w-4" /> Diagrams</h4>
                                                     {Object.keys(reportState.diagrams).map((key) => (
                                                        <div key={key} className="flex items-center space-x-2 pl-2">
                                                            <Checkbox
                                                                id={`context-diagram-${key}`}
                                                                checked={contextSelections.diagrams[key] ?? false}
                                                                onCheckedChange={() => onContextToggle('diagrams', key)}
                                                            />
                                                            <Label htmlFor={`context-diagram-${key}`} className="text-sm font-normal">
                                                                {diagramConfig[key as keyof typeof diagramConfig].title}
                                                            </Label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </ScrollArea>
                                        </div>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
                <CardFooter>
                    <Button
                        type="button"
                        onClick={onGenerate}
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
