
'use client';

import React from 'react';
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
import type { BuilderState } from '@/context/BuilderStateContext';
import { Loader2, Sparkles, Plus, Trash2, UploadCloud, FileText, X, Eye } from 'lucide-react';
import type { Agent, AgentGuideline, AgentPrompt } from '@/lib/agents';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-components';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';
import { useBuilderState } from '@/context/BuilderStateContext';


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
    reportState: BuilderState;
    isPending: boolean;
    generatingItem: string | null;
    contextSelections: Record<string, Record<string, boolean>>;
    onContextToggle: (parentKey: string, contextKey: string) => void;
    onExternalContextUploaded: (fileName: string, content: string) => void;
    onExternalContextRemoved: () => void;
    onGenerate: (section: SectionName) => void;
}

export const GenerationTools = ({ isDisabled, reportState, isPending, generatingItem, contextSelections, onContextToggle, onExternalContextUploaded, onExternalContextRemoved, onGenerate }: GenerationToolsProps) => {
    const { t } = useLocalization();
    const { agents, isLoaded: agentsLoaded } = useAgents();
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();
    const {
        controlState,
        handleControlChange,
        guidelineState,
        handleGuidelineToggle,
        customGuidelineInput,
        setCustomGuidelineInput,
        handleAddCustomGuideline,
        handleRemoveCustomGuideline
    } = useBuilderState();


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
                                                        onChange={(e) => setCustomGuidelineInput(key, e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomGuideline(key))}
                                                    />
                                                    <Button type="button" variant="secondary" onClick={() => handleAddCustomGuideline(key)}>
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </TabsContent>
                                        
                                        <TabsContent value="controls" className="pt-4">
                                            <div className="space-y-6">
                                                <div className="space-y-3">
                                                    <Label htmlFor={`formality-${key}`}>{t('reportGenerator.tool_formality_label')}</Label>
                                                    <Slider id={`formality-${key}`} name={`formality_${key}`} value={[controlState[key as SectionName].formality]} onValueChange={(val) => handleControlChange(key as SectionName, 'formality', val[0])} max={100} step={1} />
                                                    <div className="flex justify-between text-xs text-muted-foreground">
                                                        <span>{t('reportGenerator.tool_formality_informal')}</span>
                                                        <span>{t('reportGenerator.tool_formality_balanced')}</span>
                                                        <span>{t('reportGenerator.tool_formality_formal')}</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`tone-${key}`}>{t('reportGenerator.tool_tone_label')}</Label>
                                                    <Select name={`tone_${key}`} value={controlState[key as SectionName].tone} onValueChange={(val) => handleControlChange(key as SectionName, 'tone', val)}>
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
                                                    <Input id={`wordCount-${key}`} name={`wordCount_${key}`} type="number" placeholder={t('reportGenerator.tool_word_count_placeholder')} value={controlState[key as SectionName].wordCount} onChange={(e) => handleControlChange(key as SectionName, 'wordCount', e.target.value)} />
                                                </div>
                                            </div>
                                        </TabsContent>
                                        <TabsContent value="context" className="pt-4">
                                            <div className="space-y-3">
                                                <Label className="font-semibold">{t('reportGenerator.tool_context_label')}</Label>
                                                <p className="text-xs text-muted-foreground">{t('reportGenerator.tool_context_desc')}</p>
                                                <div className="max-h-60 overflow-y-auto space-y-2 rounded-md border p-2">
                                                    {reportState.externalContext && (
                                                        <>
                                                            <h4 className="text-xs font-bold uppercase text-muted-foreground">External Context</h4>
                                                             <div className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id={`context-${key}-external`}
                                                                    name={`context_${key}_external`}
                                                                    checked={contextSelections[key]?.['external'] ?? false}
                                                                    onCheckedChange={() => onContextToggle(key, 'external')}
                                                                />
                                                                <Label htmlFor={`context-${key}-external`} className="text-sm font-normal">
                                                                    {reportState.externalContext.fileName}
                                                                </Label>
                                                            </div>
                                                        </>
                                                    )}
                                                    <h4 className="text-xs font-bold uppercase text-muted-foreground">{t('reportGenerator.tool_context_sections')}</h4>
                                                    {orderedSections.filter(sKey => sKey !== key).map(contextKey => (
                                                        <div key={`ctx-s-${key}-${contextKey}`} className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id={`context-${key}-${contextKey}`}
                                                                name={`context_${key}_${contextKey}`}
                                                                disabled={!reportState.sections[contextKey]}
                                                                checked={contextSelections[key]?.[contextKey] ?? false}
                                                                onCheckedChange={() => onContextToggle(key, contextKey)}
                                                            />
                                                            <Label htmlFor={`context-${key}-${contextKey}`} className={cn("text-sm font-normal", !reportState.sections[contextKey] && "text-muted-foreground/50")}>
                                                                {sectionConfig[contextKey].title}
                                                            </Label>
                                                        </div>
                                                    ))}
                                                    <h4 className="text-xs font-bold uppercase text-muted-foreground pt-2">{t('reportGenerator.tool_context_diagrams')}</h4>
                                                    {orderedDiagrams.map(contextKey => (
                                                        <div key={`ctx-d-${key}-${contextKey}`} className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id={`context-${key}-${contextKey}`}
                                                                name={`context_${key}_${contextKey}`}
                                                                disabled={!reportState.diagrams?.[contextKey]}
                                                                checked={contextSelections[key]?.[contextKey] ?? false}
                                                                onCheckedChange={() => onContextToggle(key, contextKey)}
                                                            />
                                                            <Label htmlFor={`context-${key}-${contextKey}`} className={cn("text-sm font-normal", !reportState.diagrams?.[contextKey] && "text-muted-foreground/50")}>
                                                                {diagramConfig[contextKey].title}
                                                            </Label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
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
                    {reportState.externalContext ? (
                        <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground p-2 border rounded-md">
                           <div className="flex items-center gap-2 truncate">
                             <FileText className="h-4 w-4 shrink-0" />
                             <span className="truncate">{reportState.externalContext.fileName}</span>
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
                                            <DialogTitle>{reportState.externalContext.fileName}</DialogTitle>
                                        </DialogHeader>
                                        <ScrollArea className="h-[60vh] rounded-md border p-4">
                                            <ReactMarkdown components={markdownComponents}>{reportState.externalContext.content}</ReactMarkdown>
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
