

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Loader2, Sparkles, Plus, Trash2, SlidersHorizontal, BookOpen } from 'lucide-react';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { useProposalGenerationStore } from '@/hooks/useProposalGenerationStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocalization } from '@/context/LocalizationContext';
import { useProposalTemplates } from '@/hooks/use-templates';
import { Skeleton } from '../ui/skeleton';
import { Textarea } from '../ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { useGenerateProposal } from '@/hooks/use-proposal-generation';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { useReportStore } from '@/hooks/useReportStore';

interface GenerateButtonProps {
    isGenerating: boolean;
}

function GenerateButton({ isGenerating }: GenerateButtonProps) {
    const { t } = useLocalization();
    const { projectIdea } = useBuilderStore();
    const { selectedTemplateId, customGuidelines } = useProposalGenerationStore();
    const { externalContext } = useReportStore();
    const generationMutation = useGenerateProposal();
    const { userProfile } = useAuth();
    const hasCredits = (userProfile?.credits ?? 0) >= 1;

    const handleClick = () => {
        generationMutation.mutate({
            projectIdea,
            templateId: selectedTemplateId,
            customGuidelines,
            externalContext: externalContext,
        });
    }

    return (
        <Button
            type="button"
            onClick={handleClick}
            disabled={isGenerating || !projectIdea || !hasCredits}
            className="font-headline w-full"
            title={!hasCredits ? t('builder.toasts.insufficientCredits') : t('builder.proposalGenerator.generateButton')}
        >
            {isGenerating ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('builder.codeGenerator.generateButtonLoading')}
                </>
            ) : (
                <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {`${t('builder.proposalGenerator.generateButton')} (1 Credit)`}
                </>
            )}
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
    
    const { t } = useLocalization();
    const { data: templates, isLoading: templatesLoading } = useProposalTemplates();

    const { projectIdea, setProjectIdea } = useBuilderStore();
    const {
        selectedTemplateId,
        setSelectedTemplateId,
        customGuidelines,
        addCustomGuideline,
        removeCustomGuideline,
        customGuidelineInput,
        setCustomGuidelineInput,
    } = useProposalGenerationStore();


    const handleAddGuideline = () => {
        addCustomGuideline();
    }

    if (templatesLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card className={cn("flex flex-col h-full", isDisabled && 'opacity-50 pointer-events-none')}>
            <CardHeader>
                <CardTitle className="font-headline">{t('builder.proposalGenerator.toolsTitle')}</CardTitle>
                <CardDescription>{t('builder.proposalGenerator.toolsDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto pr-2 space-y-4">
                 <Accordion type="multiple" className="w-full space-y-4" defaultValue={['item-1']}>
                    <AccordionItem value="item-1">
                        <AccordionTrigger className="font-semibold text-base"><SlidersHorizontal className="mr-2 h-4 w-4"/> Generation Settings</AccordionTrigger>
                        <AccordionContent className="pt-4 space-y-4">
                             <div>
                                <Label htmlFor="project-idea">Main Subject or Idea</Label>
                                <Textarea
                                    id="project-idea"
                                    name="projectIdea"
                                    placeholder="e.g., A training report on new data analysis techniques in the banking sector."
                                    rows={5}
                                    required
                                    value={projectIdea || ''}
                                    onChange={(e) => setProjectIdea(e.target.value)}
                                    disabled={isGenerating}
                                    className="mt-1"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="proposal-template">{t('builder.proposalGenerator.templateLabel')}</Label>
                                <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId} disabled={isGenerating}>
                                    <SelectTrigger id="proposal-template">
                                        <SelectValue placeholder="Select a template" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {templates?.map(template => (
                                            <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground">{t('builder.proposalGenerator.customGuidelinesLabel')}</Label>
                                {customGuidelines.map((custom, index) => (
                                    <div key={index} className="flex items-center gap-2 text-sm">
                                        <span>- {custom}</span>
                                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => removeCustomGuideline(index)} disabled={isGenerating}>
                                            <Trash2 className="h-3 w-3 text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                                <div className="flex gap-2">
                                    <Input
                                        placeholder={t('builder.proposalGenerator.addGuidelinePlaceholder')}
                                        value={customGuidelineInput}
                                        onChange={(e) => setCustomGuidelineInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddGuideline())}
                                        disabled={isGenerating}
                                    />
                                    <Button type="button" variant="secondary" onClick={handleAddGuideline} disabled={isGenerating}>
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
