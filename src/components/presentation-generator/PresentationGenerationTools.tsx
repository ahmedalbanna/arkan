
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
import { presentationConfig } from '@/lib/report-config';
import { Loader2, Sparkles, Plus, Trash2 } from 'lucide-react';
import type { Agent, AgentGuideline, AgentPrompt } from '@/lib/agents';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-components';


interface GenerateButtonProps {
    isGenerating: boolean;
}

function GenerateButton({ isGenerating }: GenerateButtonProps) {
    const { agents } = useAgents();
    const agent = agents.find(a => a.id === presentationConfig.presentation.agentId);
    
    return (
        <Button
            type="submit"
            name="itemToGenerate"
            value="presentation"
            disabled={isGenerating || !agent?.isEnabled}
            className="font-headline w-full"
            title={!agent?.isEnabled ? 'This agent is disabled' : 'Generate Presentation'}
        >
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Generate Presentation
        </Button>
    );
}


interface PresentationGenerationToolsProps {
    isDisabled: boolean;
    isGenerating: boolean;
}

export const PresentationGenerationTools = ({ isDisabled, isGenerating }: PresentationGenerationToolsProps) => {
    const { agents, isLoaded: agentsLoaded } = useAgents();
    const [customGuidelines, setCustomGuidelines] = useState<string[]>([]);
    const [customGuidelineInput, setCustomGuidelineInput] = useState('');

    const agent = agents.find(a => a.id === presentationConfig.presentation.agentId);

    const handleAddCustomGuideline = () => {
        const newGuideline = customGuidelineInput.trim();
        if (newGuideline) {
            setCustomGuidelines(prev => [...prev, newGuideline]);
            setCustomGuidelineInput('');
        }
    };

    const handleRemoveCustomGuideline = (indexToRemove: number) => {
        setCustomGuidelines(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    if (!agentsLoaded || !agent) {
        return <Card><CardHeader><CardTitle>Loading Tools...</CardTitle></CardHeader><CardContent><Loader2 className="animate-spin" /></CardContent></Card>
    }

    const promptConfig = agent.prompt as AgentPrompt;

    return (
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
                                <presentationConfig.presentation.icon className="h-4 w-4" /> {presentationConfig.presentation.title}
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 p-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground">Base Prompt</Label>
                                <div className="p-3 rounded-md border bg-muted text-xs">
                                    <ReactMarkdown components={markdownComponents}>{promptConfig.base}</ReactMarkdown>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground">Custom Guidelines</Label>
                                {customGuidelines.map((custom, index) => (
                                    <div key={index} className="flex items-center gap-2 text-sm">
                                        <span>- {custom}</span>
                                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => handleRemoveCustomGuideline(index)}>
                                            <Trash2 className="h-3 w-3 text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Add a custom guideline..."
                                        value={customGuidelineInput}
                                        onChange={(e) => setCustomGuidelineInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomGuideline())}
                                    />
                                    <Button type="button" variant="secondary" onClick={handleAddCustomGuideline}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                             {/* Hidden inputs to pass data to server action */}
                            {customGuidelines.map((g, i) => (
                                <input key={i} type="hidden" name="guidelines[]" value={g} />
                            ))}

                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
            <CardFooter>
                <GenerateButton isGenerating={isGenerating} />
            </CardFooter>
        </Card>
    );
};
