
'use client';

import React, { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { ScrollArea } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';
import { useBuilderStore } from '@/hooks/useBuilderStore';


const orderedSections = SectionNameSchema.options;
const orderedDiagrams = DiagramTypeSchema.options;

interface GenerateItemButtonProps {
    onClick: () => void;
    itemKey: string;
    title: string;
    isPending: boolean;
    generatingItem: string | null;
}

function GenerateItemButton({ onClick, itemKey, title, isPending, generatingItem }: GenerateItemButtonProps) {
    const { agents } = useAgents();
    const agentId = sectionConfig[itemKey as SectionName]?.agentId;
    const agent = agents.find(a => a.id === agentId);
    const isGeneratingThis = isPending && generatingItem === itemKey;

    return (
        <Button
            type="button"
            onClick={onClick}
            disabled={isPending || !agent?.isEnabled}
            className="font-headline"
            title={!agent?.isEnabled ? 'This agent is disabled' : `Generate ${title}`}
        >
            {isGeneratingThis ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            {title}
        </Button>
    );
}

interface GenerationToolsProps {
    isDisabled: boolean;
    isPending: boolean;
    generatingItem: string | null;
    sections: Partial<Record<SectionName, string>>;
    diagrams: Partial<Record<DiagramType, { plantUmlCode: string; imageUrl: string }>>;
    externalContext?: { fileName: string; content: string };
    contextSelections: Record<string, Record<string, boolean>>;
    controlState: Record<SectionName, { formality: number; tone: string; wordCount: string }>;
    guidelineState: Record<string, { checked: Record<number, boolean>; custom: string[] }>;
    customGuidelineInput: Record<string, string>;
    onContextToggle: (parentKey: string, contextKey: string) => void;
    onExternalContextUploaded: (fileName: string, content: string) => void;
    onExternalContextRemoved: () => void;
    onGenerate: (section: SectionName) => void;
    onControlChange: (section: SectionName, field: keyof { formality: number; tone: string; wordCount: string; }, value: string | number) => void;
    onGuidelineToggle: (itemKey: string, guidelineIndex: number, isChecked: boolean) => void;
    onCustomGuidelineChange: (itemKey: string, value: string) => void;
    onAddCustomGuideline: (itemKey: string) => void;
    onRemoveCustomGuideline: (itemKey: string, index: number) => void;
}


export const GenerationTools = ({
    isDisabled,
    isPending,
    generatingItem,
    sections,
    diagrams,
    externalContext,
    contextSelections,
    controlState,
    guidelineState,
    customGuidelineInput,
    onContextToggle,
    onExternalContextUploaded,
    onExternalContextRemoved,
    onGenerate,
    onControlChange,
    onGuidelineToggle,
    onCustomGuidelineChange,
    onAddCustomGuideline,
    onRemoveCustomGuideline,
}: GenerationToolsProps) => {
    const { t } = useLocalization();
    const { agents, isLoaded: agentsLoaded } = useAgents();
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();

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
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">{t('reportGenerator.step3Title')}</CardTitle>
                    <CardDescription>{t('reportGenerator.step3Desc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cn(isDisabled && 'opacity-50 pointer-events-none')}>
            <CardHeader>
                <CardTitle className="font-headline">{t('reportGenerator.step3Title')}</CardTitle>
                <CardDescription>{t('reportGenerator.step3Desc')}</CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="multiple" className="w-full space-y-1">
                    {orderedSections.map((key) => {
                        const agent = agents.find(a => a.id === sectionConfig[key as SectionName]?.agentId);
                        if (!agent) return null;

                        const promptConfig = agent.prompt as AgentPrompt;
                        const hasGuidelines = promptConfig.guidelines && promptConfig.guidelines.length > 0;
                        const { title, icon: Icon } = sectionConfig[key];

                        return (
                            <AccordionItem value={key} key={key}>
                                <AccordionTrigger className="rounded-md px-4 py-2 text-sm font-medium hover:bg-muted hover:no-underline">
                                    <div className="flex items-center gap-2">
                                        <Icon className="h-4 w-4" /> {title}
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="space-y-4 p-4">
                                    <Tabs defaultValue="prompt" className="w-full">
                                        <TabsList className="grid w-full grid-cols-3">
                                            <TabsTrigger value="prompt">{t('reportGenerator.tool_tab_prompt')}</TabsTrigger>
                                            <TabsTrigger value="controls">{t('reportGenerator.tool_tab_controls')}</TabsTrigger>
                                            <TabsTrigger value="context">{t('reportGenerator.tool_tab_context')}</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="prompt" className="pt-4 space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold text-muted-foreground">{t('reportGenerator.tool_prompt_label')}</Label>
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
                                                                    onCheckedChange={(checked) => onGuidelineToggle(key, index, !!checked)}
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
                                                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => onRemoveCustomGuideline(key, index)}>
                                                            <Trash2 className="h-3 w-3 text-destructive" />
                                                        </Button>
                                                    </div>
                                                ))}
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder="Add a custom guideline..."
                                                        value={customGuidelineInput[key] || ''}
                                                        onChange={(e) => onCustomGuidelineChange(key, e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), onAddCustomGuideline(key))}
                                                    />
                                                    <Button type="button" variant="secondary" onClick={() => onAddCustomGuideline(key)}>
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </TabsContent>
                                        
                                        <TabsContent value="controls" className="pt-4">
                                            <div className="space-y-6">
                                                <div className="space-y-3">
                                                    <Label htmlFor={`formality-${key}`}>{t('reportGenerator.tool_formality_label')}</Label>
                                                    <Slider id={`formality-${key}`} name={`formality_${key}`} value={[controlState[key as SectionName].formality]} onValueChange={(val) => onControlChange(key as SectionName, 'formality', val[0])} max={100} step={1} />
                                                    <div className="flex justify-between text-xs text-muted-foreground">
                                                        <span>{t('reportGenerator.tool_formality_informal')}</span>
                                                        <span>{t('reportGenerator.tool_formality_balanced')}</span>
                                                        <span>{t('reportGenerator.tool_formality_formal')}</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`tone-${key}`}>{t('reportGenerator.tool_tone_label')}</Label>
                                                    <Select name={`tone_${key}`} value={controlState[key as SectionName].tone} onValueChange={(val) => onControlChange(key as SectionName, 'tone', val)}>
                                                        <SelectTrigger id={`tone-${key}`}><SelectValue placeholder={t('reportGenerator.tool_tone_placeholder')} /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="professional">{t('reportGenerator.tool_tone_professional')}</SelectItem>
                                                            <SelectItem value="academic">{t('reportGenerator.tool_tone_academic')}</SelectItem>
                                                            <SelectItem value="casual">{t('reportGenerator.tool_tone_casual')}</SelectItem>
                                                            <SelectItem value="persuasive">{t('reportGenerator.tool_tone_persuasive')}</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`wordCount-${key}`}>{t('reportGenerator.tool_word_count_label')}</Label>
                                                    <Input id={`wordCount-${key}`} name={`wordCount_${key}`} type="number" placeholder={t('reportGenerator.tool_word_count_placeholder')} value={controlState[key as SectionName].wordCount} onChange={(e) => onControlChange(key as SectionName, 'wordCount', e.target.value)} />
                                                </div>
                                            </div>
                                        </TabsContent>
                                        <TabsContent value="context" className="pt-4">
                                            <ScrollArea className="h-60 w-full">
                                                <div className="space-y-4 pr-4">
                                                    {externalContext && (
                                                        <div className="space-y-2">
                                                            <Label className="font-semibold">External Document</Label>
                                                            <div className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id={`context-${key}-external`}
                                                                    checked={contextSelections[key]?.['external'] ?? false}
                                                                    onCheckedChange={() => onContextToggle(key, 'external')}
                                                                />
                                                                <Label htmlFor={`context-${key}-external`} className="text-sm font-normal truncate">
                                                                    {externalContext.fileName}
                                                                </Label>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="space-y-2">
                                                        <Label className="font-semibold">Contextual Sections</Label>
                                                        {orderedSections.filter(sKey => sKey !== key).map(contextKey => (
                                                            <div key={`ctx-s-${key}-${contextKey}`} className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id={`context-section-${key}-${contextKey}`}
                                                                    disabled={!sections[contextKey]}
                                                                    checked={contextSelections[key]?.[contextKey] ?? false}
                                                                    onCheckedChange={() => onContextToggle(key, contextKey)}
                                                                />
                                                                <Label htmlFor={`context-section-${key}-${contextKey}`} className={cn("text-sm font-normal", !sections[contextKey] && "text-muted-foreground/50")}>
                                                                    <div className="flex items-center gap-2">
                                                                        <BookCheck className="h-4 w-4" />
                                                                        {sectionConfig[contextKey].title}
                                                                    </div>
                                                                </Label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="space-y-2 pt-2 border-t">
                                                        <Label className="font-semibold">Contextual Diagrams</Label>
                                                         {orderedDiagrams.map(contextKey => (
                                                            <div key={`ctx-d-${key}-${contextKey}`} className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id={`context-diagram-${key}-${contextKey}`}
                                                                    disabled={!diagrams?.[contextKey]}
                                                                    checked={contextSelections[key]?.[contextKey] ?? false}
                                                                    onCheckedChange={() => onContextToggle(key, contextKey)}
                                                                />
                                                                <Label htmlFor={`context-diagram-${key}-${contextKey}`} className={cn("text-sm font-normal", !diagrams?.[contextKey] && "text-muted-foreground/50")}>
                                                                    <div className="flex items-center gap-2">
                                                                        <GitGraph className="h-4 w-4" />
                                                                        {diagramConfig[contextKey].title}
                                                                    </div>
                                                                </Label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </ScrollArea>
                                        </TabsContent>
                                    </Tabs>
                                    <div className="pt-2">
                                        <GenerateItemButton onClick={() => onGenerate(key)} itemKey={key} title={`${t('generateButton')} ${title}`} isPending={isPending} generatingItem={generatingItem} />
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
