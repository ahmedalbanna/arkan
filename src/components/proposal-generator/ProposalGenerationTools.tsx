
'use client';

import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Loader2, Sparkles, Plus, Trash2, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-components';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type ProposalTemplateKey, templates as proposalTemplates } from '@/lib/proposal-templates';

interface GenerateButtonProps {
    isGenerating: boolean;
}

function GenerateButton({ isGenerating }: GenerateButtonProps) {
    return (
        <Button
            type="submit"
            name="itemToGenerate"
            value="proposal"
            disabled={isGenerating}
            className="font-headline w-full"
            title={'Generate Proposal'}
        >
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Generate Proposal
        </Button>
    );
}

interface ProposalGenerationToolsProps {
    isDisabled: boolean;
    isGenerating: boolean;
}

export const ProposalGenerationTools = ({ 
    isDisabled, 
    isGenerating,
}: ProposalGenerationToolsProps) => {
    
    const {
        selectedTemplate,
        handleTemplateChange,
        customGuidelines,
        handleAddCustomGuideline,
        handleRemoveCustomGuideline,
        customGuidelineInput,
        setCustomGuidelineInput,
    } = useBuilderStore();

    const currentTemplate = proposalTemplates[selectedTemplate];

    if (!currentTemplate) {
        return <Card><CardHeader><CardTitle>Loading Templates...</CardTitle></CardHeader><CardContent><Loader2 className="animate-spin" /></CardContent></Card>;
    }

    return (
        <Card className={cn(isDisabled && 'opacity-50 pointer-events-none')}>
            <CardHeader>
                <CardTitle className="font-headline">Generation Tools</CardTitle>
                <CardDescription>Refine the AI's instructions.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="space-y-2 mb-4">
                    <Label htmlFor="proposal-template">Proposal Template</Label>
                    <Select value={selectedTemplate} onValueChange={(value) => handleTemplateChange(value as ProposalTemplateKey)}>
                        <SelectTrigger id="proposal-template">
                            <SelectValue placeholder="Select a template" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(proposalTemplates).map(([key, template]) => (
                                <SelectItem key={key} value={key}>{template.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                 </div>
                <Accordion type="single" collapsible defaultValue="proposal" className="w-full space-y-1">
                    <AccordionItem value="proposal">
                        <AccordionTrigger className="rounded-md px-4 py-2 text-sm font-medium hover:bg-muted hover:no-underline">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4" /> Edit Prompt Details
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 p-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground">Base Prompt</Label>
                                <div className="p-3 rounded-md border bg-muted text-xs">
                                    <ReactMarkdown components={markdownComponents}>{currentTemplate.prompt}</ReactMarkdown>
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
                                        value={customGuidelineInput['proposal'] || ''}
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
