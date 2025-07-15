
'use client';

import React, { useState } from 'react';
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
import { ScrollArea } from '../ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const orderedDiagrams = DiagramTypeSchema.options;
const orderedSections = SectionNameSchema.options;

// State for guidelines of a single agent
type GuidelineState = {
    checked: Record<number, boolean>;
    custom: string[];
};

const getInitialGuidelineState = (agents: Agent[]): Record<string, GuidelineState> => {
    const initialState: Record<string, GuidelineState> = {};
    orderedDiagrams.forEach(key => {
        const agent = agents.find(a => a.id === diagramConfig[key].agentId);
        const defaultGuidelines = (agent?.prompt as AgentPrompt)?.guidelines;
        const checked: Record<number, boolean> = {};
        if (defaultGuidelines) {
            defaultGuidelines.forEach((g, index) => {
                checked[index] = g.isDefault;
            });
        }
        initialState[key] = { checked, custom: [] };
    });
    return initialState;
};

const getSelectedGuidelines = (agent: Agent | undefined, guidelineState: GuidelineState | undefined): string[] => {
    if (!agent || !guidelineState) return [];
    
    const promptConfig = agent.prompt as AgentPrompt;
    if (typeof promptConfig === 'string' || !promptConfig.guidelines) return [];

    const guidelines: string[] = [];
    promptConfig.guidelines.forEach((g, index) => {
        if (guidelineState.checked[index]) {
            guidelines.push(g.text);
        }
    });
    guidelines.push(...guidelineState.custom);
    return guidelines;
};

interface GenerateItemButtonProps {
    itemKey: string;
    title: string;
    isGenerating: boolean;
    generatingDiagram: string | null;
}

function GenerateItemButton({ itemKey, title, isGenerating, generatingDiagram }: GenerateItemButtonProps) {
    const { agents } = useAgents();
    const agentId = diagramConfig[itemKey as keyof typeof diagramConfig]?.agentId;
    const agent = agents.find(a => a.id === agentId);
    const isGeneratingThis = isGenerating && generatingDiagram === itemKey;

    return (
        <Button
            type="submit"
            name="itemToGenerate"
            value={itemKey}
            disabled={isGeneratingThis || !agent?.isEnabled}
            className="font-headline"
            title={!agent?.isEnabled ? 'This agent is disabled' : `Generate ${title}`}
        >
            {isGeneratingThis ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Generate
        </Button>
    );
}

interface DiagramGenerationToolsProps {
    isDisabled: boolean;
    diagramsState: Partial<Record<DiagramType, { plantUmlCode: string; imageUrl: string }>>;
    sectionsState: Partial<Record<SectionName, string>>;
    externalContext?: { fileName: string; content: string };
    isGenerating: boolean;
    generatingDiagram: string | null;
    contextSelections: Record<string, Record<string, boolean>>;
    onContextToggle: (parentKey: string, contextKey: string) => void;
    onExternalContextUploaded: (fileName: string, content: string) => void;
    onExternalContextRemoved: () => void;
}


export const DiagramGenerationTools = (props: DiagramGenerationToolsProps) => {
    const { 
        isDisabled, 
        diagramsState, 
        sectionsState,
        externalContext,
        isGenerating, 
        generatingDiagram, 
        contextSelections, 
        onContextToggle,
        onExternalContextUploaded,
        onExternalContextRemoved,
    } = props;
    const { agents, isLoaded: agentsLoaded } = useAgents();
    const [guidelineState, setGuidelineState] = React.useState<Record<string, GuidelineState>>({});
    const [customGuidelineInput, setCustomGuidelineInput] = React.useState<Record<string, string>>({});
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();

    React.useEffect(() => {
        if (agentsLoaded && agents && agents.length > 0) {
            setGuidelineState(getInitialGuidelineState(agents));
        }
    }, [agentsLoaded, agents]);

    const handleGuidelineToggle = (itemKey: string, guidelineIndex: number, isChecked: boolean) => {
        setGuidelineState(prev => ({
            ...prev,
            [itemKey]: {
                ...prev[itemKey],
                checked: {
                    ...prev[itemKey].checked,
                    [guidelineIndex]: isChecked
                }
            }
        }));
    };

    const handleAddCustomGuideline = (itemKey: string) => {
        const newGuideline = customGuidelineInput[itemKey]?.trim();
        if (newGuideline) {
            setGuidelineState(prev => ({
                ...prev,
                [itemKey]: {
                    ...prev[itemKey],
                    custom: [...prev[itemKey].custom, newGuideline]
                }
            }));
            setCustomGuidelineInput(prev => ({ ...prev, [itemKey]: '' }));
        }
    };

    const handleRemoveCustomGuideline = (itemKey: string, indexToRemove: number) => {
        setGuidelineState(prev => ({
            ...prev,
            [itemKey]: {
                ...prev[itemKey],
                custom: prev[itemKey].custom.filter((_, index) => index !== indexToRemove)
            }
        }));
    };

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

    const handleFileUpload = async () => {
        if (!pdfFile) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', pdfFile);
        try {
            const response = await fetch('/api/pdf-to-markdown', { method: 'POST', body: formData });
            if (!response.ok) {
                const errorResult = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
                throw new Error(errorResult.message);
            }
            const result = await response.json();
            onExternalContextUploaded(pdfFile.name, result.markdown);
            toast({ title: "Context Added", description: `Successfully processed ${pdfFile.name}.` });
        } catch (error: any) {
            toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveExternalContext = () => {
      onExternalContextRemoved();
      setPdfFile(null);
    }

    if (!agentsLoaded) {
        return <Card><CardHeader><CardTitle>Loading Tools...</CardTitle></CardHeader><CardContent><Loader2 className="animate-spin" /></CardContent></Card>;
    }

    return (
        <Card className={cn(isDisabled && 'opacity-50 pointer-events-none')}>
            <CardHeader>
                <CardTitle className="font-headline">Generation Tools</CardTitle>
                <CardDescription>Configure and generate diagrams.</CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="multiple" className="w-full space-y-1">
                    {orderedDiagrams.map((key) => {
                        const agent = agents.find(a => a.id === diagramConfig[key].agentId);
                        if (!agent) return null;

                        const promptConfig = agent.prompt as AgentPrompt;
                        const hasGuidelines = promptConfig.guidelines && promptConfig.guidelines.length > 0;
                        const { title, icon: Icon } = diagramConfig[key];
                        
                        const selectedGuidelines = getSelectedGuidelines(agent, guidelineState[key]);

                        return (
                            <AccordionItem value={key} key={key}>
                                <AccordionTrigger className="rounded-md px-4 py-2 text-sm font-medium hover:bg-muted hover:no-underline">
                                    <div className="flex items-center gap-2">
                                        <Icon className="h-4 w-4" /> {title}
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
                                                <Label className="text-xs font-semibold text-muted-foreground">Custom Guidelines</Label>
                                                {guidelineState[key]?.custom.map((custom, index) => (
                                                    <div key={index} className="flex items-center gap-2 text-sm">
                                                        <span>- {custom}</span>
                                                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => handleRemoveCustomGuideline(key, index)}>
                                                            <Trash2 className="h-3 w-3 text-destructive" />
                                                        </Button>
                                                    </div>
                                                ))}
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder="Add a custom guideline..."
                                                        value={customGuidelineInput[key] || ''}
                                                        onChange={(e) => setCustomGuidelineInput(prev => ({ ...prev, [key]: e.target.value }))}
                                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomGuideline(key))}
                                                    />
                                                    <Button type="button" variant="secondary" onClick={() => handleAddCustomGuideline(key)}>
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        {/* Hidden inputs to pass data to server action */}
                                        {selectedGuidelines.map((g, i) => (
                                            <input key={i} type="hidden" name="guidelines[]" value={g} />
                                        ))}
                                        
                                        <TabsContent value="context" className="pt-4">
                                            <ScrollArea className="max-h-80 w-full">
                                                <div className="space-y-4 pr-4">
                                                    <div className="space-y-3">
                                                        <Label className="font-semibold">Contextual Sections</Label>
                                                        <p className="text-xs text-muted-foreground">Select text sections to provide as context.</p>
                                                        <div className="space-y-2">
                                                            {orderedSections.map(contextKey => (
                                                                <div key={`ctx-s-${key}-${contextKey}`} className="flex items-center space-x-2">
                                                                    <Checkbox
                                                                        id={`context-section-${key}-${contextKey}`}
                                                                        name={`context_section_${key}_${contextKey}`}
                                                                        disabled={!sectionsState[contextKey]}
                                                                        checked={contextSelections[key]?.[`section_${contextKey}`] ?? false}
                                                                        onCheckedChange={() => onContextToggle(key, `section_${contextKey}`)}
                                                                    />
                                                                    <Label htmlFor={`context-section-${key}-${contextKey}`} className={cn("text-sm font-normal", !sectionsState[contextKey] && "text-muted-foreground/50")}>
                                                                        <div className="flex items-center gap-2">
                                                                            <BookCheck className="h-4 w-4" />
                                                                            {sectionConfig[contextKey].title}
                                                                        </div>
                                                                    </Label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                     <div className="space-y-3 pt-4 border-t">
                                                        <Label className="font-semibold">Contextual Diagrams</Label>
                                                        <p className="text-xs text-muted-foreground">Select other generated diagrams to provide as context.</p>
                                                        <div className="space-y-2">
                                                            {orderedDiagrams.filter(dKey => dKey !== key).map(contextKey => (
                                                                <div key={`ctx-d-${key}-${contextKey}`} className="flex items-center space-x-2">
                                                                    <Checkbox
                                                                        id={`context-diagram-${key}-${contextKey}`}
                                                                        name={`context_diagram_${key}_${contextKey}`}
                                                                        disabled={!diagramsState[contextKey]}
                                                                        checked={contextSelections[key]?.[`diagram_${contextKey}`] ?? false}
                                                                        onCheckedChange={() => onContextToggle(key, `diagram_${contextKey}`)}
                                                                    />
                                                                    <Label htmlFor={`context-diagram-${key}-${contextKey}`} className={cn("text-sm font-normal", !diagramsState[contextKey] && "text-muted-foreground/50")}>
                                                                        <div className="flex items-center gap-2">
                                                                            <GitGraph className="h-4 w-4" />
                                                                            {diagramConfig[contextKey].title}
                                                                        </div>
                                                                    </Label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </ScrollArea>
                                        </TabsContent>
                                    </Tabs>
                                    <div className="pt-2">
                                        <GenerateItemButton itemKey={key} title={title} isGenerating={isGenerating} generatingDiagram={generatingDiagram} />
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        );
                    })}
                </Accordion>
                <div className="pt-4 mt-4 border-t">
                    <h3 className="text-sm font-semibold mb-2">External Context (PDF)</h3>
                    {externalContext ? (
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
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleRemoveExternalContext} title="Remove File">
                                    <X className="h-4 w-4" />
                                </Button>
                           </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Input type="file" accept="application/pdf" onChange={handleFileChange} className="text-xs" />
                            <Button type="button" size="sm" onClick={handleFileUpload} disabled={!pdfFile || isUploading} className="w-full">
                                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                                Upload & Process PDF
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
