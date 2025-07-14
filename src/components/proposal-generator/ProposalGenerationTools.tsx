
'use client';

import React, { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAgents } from '@/hooks/use-agents';
import { cn } from '@/lib/utils';
import { AGENTS } from '@/lib/agents';
import { Loader2, Sparkles, Plus, Trash2, FileText } from 'lucide-react';
import type { Agent, AgentGuideline, AgentPrompt } from '@/lib/agents';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-components';

interface GenerateButtonProps {
    isGenerating: boolean;
}

function GenerateButton({ isGenerating }: GenerateButtonProps) {
    const { agents } = useAgents();
    const agent = agents.find(a => a.id === 'generate-proposal');
    
    return (
        <Button
            type="submit"
            name="itemToGenerate"
            value="proposal"
            disabled={isGenerating || !agent?.isEnabled}
            className="font-headline w-full"
            title={!agent?.isEnabled ? 'This agent is disabled' : 'Generate Proposal'}
        >
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Generate Proposal
        </Button>
    );
}

interface ProposalGenerationToolsProps {
    isDisabled: boolean;
    isGenerating: boolean;
    customGuidelines: string[];
    setCustomGuidelines: React.Dispatch<React.SetStateAction<string[]>>;
}

export const ProposalGenerationTools = ({ 
    isDisabled, 
    isGenerating,
    customGuidelines,
    setCustomGuidelines
}: ProposalGenerationToolsProps) => {
    
    const [customGuidelineInput, setCustomGuidelineInput] = useState('');
    const agent = AGENTS.find(a => a.id === 'generate-proposal');

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

    if (!agent) {
        return <Card><CardHeader><CardTitle>Agent not found</CardTitle></CardHeader></Card>;
    }

    const promptConfig = agent.prompt as AgentPrompt;

    return (
        <Card className={cn(isDisabled && 'opacity-50 pointer-events-none')}>
            <CardHeader>
                <CardTitle className="font-headline">Generation Tools</CardTitle>
                <CardDescription>Refine the AI's instructions.</CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible defaultValue="proposal" className="w-full space-y-1">
                    <AccordionItem value="proposal">
                        <AccordionTrigger className="rounded-md px-4 py-2 text-sm font-medium hover:bg-muted hover:no-underline">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4" /> Generate Proposal
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
