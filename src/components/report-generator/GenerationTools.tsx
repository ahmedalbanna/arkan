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
import { SectionNameSchema, DiagramTypeSchema, type SectionName } from '@/ai/schemas';
import type { ReportState } from '@/app/generate-report/actions';
import { Loader2, Sparkles } from 'lucide-react';

const orderedSections = SectionNameSchema.options;
const orderedDiagrams = DiagramTypeSchema.options;

type ControlState = {
  formality: number;
  tone: string;
  wordCount: string;
};

const getInitialControlState = (): Record<SectionName, ControlState> => {
  const initial: Partial<Record<SectionName, ControlState>> = {};
  orderedSections.forEach(key => {
    initial[key] = { formality: 50, tone: 'professional', wordCount: '300' };
  });
  return initial as Record<SectionName, ControlState>;
};

const generateInstructionText = (controls: ControlState, t: (key: string) => string) => {
    let instructions = [];
    if (controls.formality !== undefined) {
        const formality = controls.formality;
        let formalityDesc = t('reportGenerator.tool_formality_balanced');
        if (formality < 33) formalityDesc = t('reportGenerator.tool_formality_informal');
        else if (formality > 66) formalityDesc = t('reportGenerator.tool_formality_formal');
        instructions.push(`- The writing style should be ${formalityDesc}.`);
    }
    if (controls.tone && controls.tone !== "none") {
        instructions.push(`- Adopt a ${controls.tone} tone.`);
    }
    if (controls.wordCount) {
        instructions.push(`- The response should be approximately ${controls.wordCount} words long.`);
    }

    if (instructions.length > 0) {
        return `Additionally, please adhere to the following constraints for your response:\n${instructions.join('\n')}`;
    }
    return t('reportGenerator.tool_instruction_none');
};


interface GenerateItemButtonProps {
    itemKey: string;
    title: string;
    isPending: boolean;
    generatingItem: string | null;
}

function GenerateItemButton({ itemKey, title, isPending, generatingItem }: GenerateItemButtonProps) {
    const { agents } = useAgents();
    const agentId = (sectionConfig[itemKey as SectionName] || diagramConfig[itemKey as keyof typeof diagramConfig])?.agentId;
    const agent = agents.find(a => a.id === agentId);
    const isGeneratingThis = isPending && generatingItem === itemKey;

    return (
        <Button
            type="submit"
            name="itemToGenerate"
            value={itemKey}
            disabled={isPending || !agent?.isEnabled}
            className="font-headline"
            title={!agent?.isEnabled ? 'This agent is disabled' : title}
        >
            {isGeneratingThis ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            {title}
        </Button>
    );
}

interface GenerationToolsProps {
    reportState: ReportState;
    isPending: boolean;
    generatingItem: string | null;
    contextSelections: Record<string, Record<string, boolean>>;
    onContextToggle: (parentKey: string, contextKey: string) => void;
}

export const GenerationTools = ({ reportState, isPending, generatingItem, contextSelections, onContextToggle }: GenerationToolsProps) => {
    const { t } = useLocalization();
    const { agents } = useAgents();
    const [controlState, setControlState] = useState<Record<SectionName, ControlState>>(getInitialControlState);

    const handleControlChange = (section: SectionName, field: keyof ControlState, value: string | number) => {
        setControlState(prevState => ({
            ...prevState,
            [section]: { ...prevState[section], [field]: value }
        }));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">{t('reportGenerator.step3Title')}</CardTitle>
                <CardDescription>{t('reportGenerator.step3Desc')}</CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="multiple" className="w-full space-y-1">
                    {[...orderedSections, ...orderedDiagrams].map((key, index) => {
                        const isSection = index < orderedSections.length;
                        const config = isSection ? sectionConfig[key as SectionName] : diagramConfig[key as keyof typeof diagramConfig];
                        const agent = agents.find(a => a.id === config.agentId);
                        if (!agent) return null;
                        const { title, icon: Icon } = config;
                        
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
                                            {isSection && <TabsTrigger value="controls">{t('reportGenerator.tool_tab_controls')}</TabsTrigger>}
                                            <TabsTrigger value="context">{t('reportGenerator.tool_tab_context')}</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="prompt" className="pt-4">
                                            <div className="space-y-2">
                                                <Label htmlFor={`prompt-${key}`} className="text-xs font-semibold text-muted-foreground">{t('reportGenerator.tool_prompt_label')}</Label>
                                                <Textarea id={`prompt-${key}`} name={`prompt_${key}`} defaultValue={agent.prompt} rows={10} className="font-mono text-sm" />
                                            </div>
                                        </TabsContent>
                                        {isSection && (
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
                                                    <div className="p-3 bg-muted/50 rounded-md text-xs text-muted-foreground space-y-1">
                                                        <p className="font-semibold">{t('reportGenerator.tool_instruction_preview')}</p>
                                                        <pre className="whitespace-pre-wrap font-mono text-primary/80">{generateInstructionText(controlState[key as SectionName], t)}</pre>
                                                    </div>
                                                </div>
                                            </TabsContent>
                                        )}
                                        <TabsContent value="context" className="pt-4">
                                            <div className="space-y-3">
                                                <Label className="font-semibold">{t('reportGenerator.tool_context_label')}</Label>
                                                <p className="text-xs text-muted-foreground">{t('reportGenerator.tool_context_desc')}</p>
                                                <div className="max-h-60 overflow-y-auto space-y-2 rounded-md border p-2">
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
                                                    {orderedDiagrams.filter(dKey => dKey !== key).map(contextKey => (
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
                                    <GenerateItemButton itemKey={key} title={`Generate ${title}`} isPending={isPending} generatingItem={generatingItem} />
                                </AccordionContent>
                            </AccordionItem>
                        );
                    })}
                </Accordion>
            </CardContent>
        </Card>
    );
};
