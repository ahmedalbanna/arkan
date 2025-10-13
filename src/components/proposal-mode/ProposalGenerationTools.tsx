

'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useProposalGenerationToolsLogic } from '@/hooks/use-proposal-generation-tools-logic';
import { cn } from '@/lib/utils';
import { Lightbulb, Loader2, Plus, SlidersHorizontal, Sparkles, Trash2 } from 'lucide-react';

interface GenerateButtonProps {
    isGenerating: boolean;
    generationMode: 'simple' | 'advanced';
}

function GenerateButton({ isGenerating, generationMode }: GenerateButtonProps) {
    const { t, handleGenerateClick, canGenerate, hasCredits, generationMutation } = useProposalGenerationToolsLogic();

    return (
        <Button
            type="button"
            onClick={handleGenerateClick}
            disabled={isGenerating || !canGenerate || !hasCredits || generationMutation.isPending}
            variant="gradient"
            className="font-headline w-full hover:shadow-glow transition-all duration-200"
            title={!hasCredits ? t('builder.toasts.insufficientCredits') : t('builder.proposalGenerator.generateButton')}
        >
            {isGenerating || generationMutation.isPending ? (
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
}

const AdvancedFieldsForm = () => {
    const { advancedFields, handleFieldChange } = useProposalGenerationToolsLogic();

    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <Label htmlFor="projectTitle">Project Title</Label>
                <Input id="projectTitle" name="projectTitle" value={advancedFields.projectTitle} onChange={handleFieldChange} placeholder="Enter the project title..." />
                <p className="text-xs text-muted-foreground">A clear, concise title that captures the essence of your project.</p>
            </div>
            <div className="space-y-1">
                <Label htmlFor="projectObjective">Project Objective</Label>
                <Textarea id="projectObjective" name="projectObjective" value={advancedFields.projectObjective} onChange={handleFieldChange} rows={3} placeholder="Describe the main objective of the project..." />
                <p className="text-xs text-muted-foreground">What is the primary goal this project aims to achieve?</p>
            </div>
            <div className="space-y-1">
                <Label htmlFor="expectedOutcomes">Expected Outcomes</Label>
                <Textarea id="expectedOutcomes" name="expectedOutcomes" value={advancedFields.expectedOutcomes} onChange={handleFieldChange} rows={3} placeholder="List the expected outcomes and deliverables..." />
                <p className="text-xs text-muted-foreground">What specific results and deliverables do you expect from this project?</p>
            </div>
            <div className="space-y-1">
                <Label htmlFor="timeline">Timeline</Label>
                <Input id="timeline" name="timeline" value={advancedFields.timeline} onChange={handleFieldChange} placeholder="e.g., 6 months, Q4 2024" />
                <p className="text-xs text-muted-foreground">What is the estimated duration of the project?</p>
            </div>
            <div className="space-y-1">
                <Label htmlFor="methodology">Methodology</Label>
                <Input id="methodology" name="methodology" value={advancedFields.methodology} onChange={handleFieldChange} placeholder="e.g., Agile, Waterfall, Scrum" />
                <p className="text-xs text-muted-foreground">What approach or process will be followed for this project?</p>
            </div>
            <div className="space-y-1">
                <Label htmlFor="knowledge">Knowledge & Context</Label>
                <Textarea id="knowledge" name="additionalContext" value={advancedFields.additionalContext || ''} onChange={handleFieldChange} rows={5} placeholder="Provide background information, rationale, potential risks, and any other context..." />
                <p className="text-xs text-muted-foreground">Provide any background info, rationale, risks, or other context to guide the AI.</p>
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
        <CardContent className="flex-grow space-y-6">
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
}: ProposalGenerationToolsProps) => {

    const {
        t,
        activeTab,
        setActiveTab,
        projectIdea,
        setProjectIdea,
        customGuidelines,
        removeCustomGuideline,
        customGuidelineInput,
        setCustomGuidelineInput,
        handleAddGuideline,
        generationMutation,
        suggestIdeaMutation,
        handleSuggestIdea,
    } = useProposalGenerationToolsLogic();

    return (
        <Card className={cn("flex flex-col h-full backdrop-blur-md shadow-soft hover:shadow-glow transition-all duration-200", isDisabled && 'opacity-50 pointer-events-none')}>
            <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
                <CardTitle className="font-headline">{t('builder.proposalGenerator.toolsTitle')}</CardTitle>
                <CardDescription>{t('builder.proposalGenerator.toolsDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto pr-2 space-y-4">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'simple' | 'advanced')} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-background/50 to-primary/5">
                        <TabsTrigger value="simple" className="hover:shadow-soft transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-600 data-[state=active]:text-white">Simple</TabsTrigger>
                        <TabsTrigger value="advanced" className="hover:shadow-soft transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-600 data-[state=active]:text-white">Advanced</TabsTrigger>
                    </TabsList>
                    <TabsContent value="simple" className="pt-4">
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <Label htmlFor="project-idea">{t('builder.proposalGenerator.mainSubjectLabel')}</Label>
                                <Button variant="ghost" size="sm" onClick={handleSuggestIdea} disabled={suggestIdeaMutation.isPending}>
                                    {suggestIdeaMutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Lightbulb className="me-2 h-4 w-4" />}
                                    Suggest Idea
                                </Button>
                            </div>
                            <Textarea
                                id="project-idea"
                                name="projectIdea"
                                placeholder={t('builder.proposalGenerator.placeholder')}
                                rows={5}
                                required
                                value={projectIdea || ''}
                                onChange={(e) => setProjectIdea(e.target.value)}
                                disabled={generationMutation.isPending}
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
                        <AccordionTrigger className="font-semibold text-base"><SlidersHorizontal className="me-2 h-4 w-4" />{t('builder.proposalGenerator.generationSettings')}</AccordionTrigger>
                        <AccordionContent className="pt-4 space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground">{t('builder.proposalGenerator.customGuidelinesLabel')}</Label>
                                {customGuidelines.map((custom, index) => (
                                    <div key={index} className="flex items-center gap-2 text-sm">
                                        <span>- {custom}</span>
                                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => removeCustomGuideline(index)} disabled={generationMutation.isPending}>
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
                                        disabled={generationMutation.isPending}
                                    />
                                    <Button type="button" variant="secondary" onClick={handleAddGuideline} disabled={generationMutation.isPending}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
            <CardFooter>
                <GenerateButton isGenerating={generationMutation.isPending} generationMode={activeTab} />
            </CardFooter>
        </Card>
    );
};
