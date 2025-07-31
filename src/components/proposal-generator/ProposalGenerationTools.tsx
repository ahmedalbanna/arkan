

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Loader2, Sparkles, Plus, Trash2, FileText, AlertCircle, Download, Languages } from 'lucide-react';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocalization } from '@/context/LocalizationContext';
import { useProposalTemplates } from '@/hooks/use-templates';
import { Skeleton } from '../ui/skeleton';
import { Textarea } from '../ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { useGenerateProposal } from '@/hooks/use-proposal-generation';

interface GenerateButtonProps {
    isGenerating: boolean;
}

function GenerateButton({ isGenerating }: GenerateButtonProps) {
    const { t } = useLocalization();
    const { projectIdea } = useBuilderStore();
    const generationMutation = useGenerateProposal();

    const handleClick = () => {
        generationMutation.mutate({
            projectIdea: useBuilderStore.getState().projectIdea,
            templateId: useBuilderStore.getState().selectedTemplateId,
            customGuidelines: useBuilderStore.getState().customGuidelines,
        });
    }

    return (
        <Button
            type="button"
            onClick={handleClick}
            disabled={isGenerating || !projectIdea}
            className="font-headline w-full"
            title={t('builder.proposalGenerator.generateButton')}
        >
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            {t('builder.proposalGenerator.generateButton')}
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
    const { userProfile } = useAuth();
    const { data: templates, isLoading: templatesLoading, isError } = useProposalTemplates();

    const {
        projectIdea,
        setProjectIdea,
        selectedTemplateId,
        setSelectedTemplateId,
        customGuidelines,
        addCustomGuideline,
        removeCustomGuideline,
        customGuidelineInput,
        setCustomGuidelineInput,
    } = useBuilderStore();


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
    
    if (isError) {
         return (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Error</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center text-center text-destructive">
                    <AlertCircle className="h-8 w-8 mb-2" />
                    <p>Failed to load proposal templates.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cn(isDisabled && 'opacity-50 pointer-events-none')}>
            <CardHeader>
                <CardTitle className="font-headline">{t('builder.proposalGenerator.toolsTitle')}</CardTitle>
                <CardDescription>{t('builder.proposalGenerator.toolsDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                    <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
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
                            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => removeCustomGuideline(index)}>
                                <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                        </div>
                    ))}
                    <div className="flex gap-2">
                        <Input
                            placeholder={t('builder.proposalGenerator.customGuidelinePlaceholder')}
                            value={customGuidelineInput}
                            onChange={(e) => setCustomGuidelineInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddGuideline())}
                        />
                        <Button type="button" variant="secondary" onClick={handleAddGuideline}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <GenerateButton isGenerating={isGenerating} />
            </CardFooter>
        </Card>
    );
};
