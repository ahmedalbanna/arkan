'use client';

import React, { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Loader2, Sparkles, Plus, Trash2, SlidersHorizontal } from 'lucide-react';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { useProposalGenerationStore, type AdvancedProposalFields } from '@/hooks/useProposalGenerationStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocalization } from '@/context/LocalizationContext';
import { useProposalTemplates } from '@/hooks/use-templates';
import { Skeleton } from '../ui/skeleton';
import { Textarea } from '../ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { useGenerateProposal } from '@/hooks/use-proposal-generation';
import { useReportStore } from '@/hooks/useReportStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface GenerateButtonProps {
    isGenerating: boolean;
    generationMode: 'simple' | 'advanced';
}

function GenerateButton({ isGenerating, generationMode }: GenerateButtonProps) {
    const { t } = useLocalization();
    const { projectIdea } = useBuilderStore();
    const { selectedTemplateId, customGuidelines, advancedFields } = useProposalGenerationStore();
    const { externalContext } = useReportStore();
    const generationMutation = useGenerateProposal();
    const { userProfile } = useAuth();
    const hasCredits = (userProfile?.credits ?? 0) >= 1;

    const handleClick = () => {
        const payload = generationMode === 'simple'
            ? { projectIdea, templateId: selectedTemplateId, customGuidelines, externalContext }
            : { projectIdea: advancedFields.projectTitle, templateId: selectedTemplateId, customGuidelines, externalContext, advancedFields };

        generationMutation.mutate(payload);
    }

    const canGenerate = (generationMode === 'simple' && projectIdea) ||
                      (generationMode === 'advanced' && advancedFields.projectTitle && advancedFields.projectObjective);

    return (
        <Button
            type="button"
            onClick={handleClick}
            disabled={isGenerating || !canGenerate || !hasCredits}
            className="font-headline w-full"
            title={!hasCredits ? t('builder.toasts.insufficientCredits') : t('builder.proposalGenerator.generateButton')}
        >
            {isGenerating ? (
                <>
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                    {t('builder.codeGenerator.generateButtonLoading')}
                </>
            ) : (
                <>
                    <Sparkles className="me-2 h-4 w-4" />
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

const AdvancedFieldsForm = () => {
    const { advancedFields, setAdvancedField } = useProposalGenerationStore();
    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setAdvancedField(e.target.name as keyof AdvancedProposalFields, e.target.value);
    }

    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <Label htmlFor="projectTitle">Project Title</Label>
                <Input id="projectTitle" name="projectTitle" value={advancedFields.projectTitle} onChange={handleFieldChange} placeholder="Enter the project title..."/>
                <p className="text-xs text-muted-foreground">A clear, concise title that captures the essence of your project.</p>
            </div>
             <div className="space-y-1">
                <Label htmlFor="projectObjective">Project Objective</Label>
                <Textarea id="projectObjective" name="projectObjective" value={advancedFields.projectObjective} onChange={handleFieldChange} rows={3} placeholder="Describe the main objective of the project..."/>
                <p className="text-xs text-muted-foreground">What is the primary goal this project aims to achieve?</p>
            </div>
            <div className="space-y-1">
                <Label htmlFor="expectedOutcomes">Expected Outcomes</Label>
                <Textarea id="expectedOutcomes" name="expectedOutcomes" value={advancedFields.expectedOutcomes} onChange={handleFieldChange} rows={3} placeholder="List the expected outcomes and deliverables..."/>
                 <p className="text-xs text-muted-foreground">What specific results and deliverables do you expect from this project?</p>
            </div>
            <div className="space-y-1">
                <Label htmlFor="methodology">Methodology</Label>
                <Textarea id="methodology" name="methodology" value={advancedFields.methodology} onChange={handleFieldChange} rows={3} placeholder="Describe the methodology (e.g., Agile, Waterfall)..."/>
                <p className="text-xs text-muted-foreground">What approach or process will be followed for this project?</p>
            </div>
            <div className="space-y-1">
                <Label htmlFor="timeline">Timeline</Label>
                <Textarea id="timeline" name="timeline" value={advancedFields.timeline} onChange={handleFieldChange} rows={3} placeholder="Outline the project timeline, phases, and key milestones..."/>
                <p className="text-xs text-muted-foreground">What is the estimated duration and what are the key phases?</p>
            </div>
            <div className="space-y-1">
                <Label htmlFor="budget">Budget</Label>
                <Textarea id="budget" name="budget" value={advancedFields.budget} onChange={handleFieldChange} rows={3} placeholder="Provide a budget estimate and breakdown..."/>
                <p className="text-xs text-muted-foreground">What are the estimated costs for the project?</p>
            </div>
             <div className="space-y-1">
                <Label htmlFor="stakeholders">Stakeholders</Label>
                <Input id="stakeholders" name="stakeholders" value={advancedFields.stakeholders} onChange={handleFieldChange} placeholder="Identify key stakeholders and their roles..."/>
                 <p className="text-xs text-muted-foreground">Who are the key people or groups involved in or affected by this project?</p>
            </div>
             <div className="space-y-1">
                <Label htmlFor="projectContext">Project Context</Label>
                <Textarea id="projectContext" name="projectContext" value={advancedFields.projectContext} onChange={handleFieldChange} rows={4} placeholder="Provide background information and context..."/>
                 <p className="text-xs text-muted-foreground">What is the background and environment in which this project exists?</p>
            </div>
              <div className="space-y-1">
                <Label htmlFor="risksAndChallenges">Risks & Challenges</Label>
                <Textarea id="risksAndChallenges" name="risksAndChallenges" value={advancedFields.risksAndChallenges} onChange={handleFieldChange} rows={3} placeholder="Identify potential risks and challenges..."/>
                 <p className="text-xs text-muted-foreground">What potential risks, challenges, or obstacles might this project face?</p>
            </div>
              <div className="space-y-1">
                <Label htmlFor="projectRationale">Project Rationale</Label>
                <Textarea id="projectRationale" name="projectRationale" value={advancedFields.projectRationale} onChange={handleFieldChange} rows={3} placeholder="Explain why this project is necessary..."/>
                 <p className="text-xs text-muted-foreground">Why is this project important? What problems does it solve?</p>
            </div>
             <div className="space-y-1">
                <Label htmlFor="additionalContext">Additional Context</Label>
                <Textarea id="additionalContext" name="additionalContext" value={advancedFields.additionalContext} onChange={handleFieldChange} rows={3} placeholder="Any additional information that might be relevant..."/>
                 <p className="text-xs text-muted-foreground">Any other relevant information that could help in the analysis.</p>
            </div>
        </div>
    )
}

const ToolsSkeleton = () => (
    <Card className="flex flex-col h-full">
        <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </div>
            </div>
        </CardHeader>
        <CardContent className="grow space-y-6">
            {/* Tabs skeleton */}
            <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
            {/* Accordion skeleton */}
            <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
            </div>
        </CardContent>
        <CardFooter>
            <Skeleton className="h-10 w-full" />
        </CardFooter>
    </Card>
);

export const ProposalGenerationTools = ({
    isDisabled,
    isGenerating,
}: ProposalGenerationToolsProps) => {

    const { t } = useLocalization();
    const { data: templates, isLoading: templatesLoading } = useProposalTemplates();
    const [activeTab, setActiveTab] = useState<'simple' | 'advanced'>('simple');

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
        return <ToolsSkeleton />;
    }

    return (
        <Card className={cn("flex flex-col h-full", isDisabled && 'opacity-50 pointer-events-none')}>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="font-headline">{t('builder.proposalGenerator.toolsTitle')}</CardTitle>
                        <CardDescription>{t('builder.proposalGenerator.toolsDescription')}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="grow overflow-y-auto pr-2 space-y-4">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="simple">Simple</TabsTrigger>
                        <TabsTrigger value="advanced">Advanced</TabsTrigger>
                    </TabsList>
                    <TabsContent value="simple" className="pt-4">
                         <div>
                            <Label htmlFor="project-idea">{t('builder.proposalGenerator.mainSubjectLabel')}</Label>
                            <Textarea
                                id="project-idea"
                                name="projectIdea"
                                placeholder={t('builder.proposalGenerator.placeholder')}
                                rows={5}
                                required
                                value={projectIdea || ''}
                                onChange={(e) => setProjectIdea(e.target.value)}
                                disabled={isGenerating}
                                className="mt-1"
                            />
                        </div>
                    </TabsContent>
                    <TabsContent value="advanced" className="pt-4">
                        <AdvancedFieldsForm />
                    </TabsContent>
                </Tabs>

                 <Accordion type="multiple" className="w-full space-y-4">
                    <AccordionItem value="item-1">
                        <AccordionTrigger className="font-semibold text-base"><SlidersHorizontal className="me-2 h-4 w-4"/>{t('builder.proposalGenerator.generationSettings')}</AccordionTrigger>
                        <AccordionContent className="pt-4 space-y-4">
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
                <GenerateButton isGenerating={isGenerating} generationMode={activeTab} />
            </CardFooter>
        </Card>
    );
};
