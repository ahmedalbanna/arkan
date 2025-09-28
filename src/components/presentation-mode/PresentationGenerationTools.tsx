

'use client';

import type { DiagramType, SectionName as SectionNameType } from '@/ai/schemas';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useAgents, useBuilderStore, useGenerationUIStore, useSections, useToast } from '@/hooks';
import { getSelectedGuidelines } from '@/lib/guideline-utils';
import { Project } from '@/lib/models/project';
import { cn } from '@/lib/utils';
import { Loader2, PanelLeftClose, Sparkles, History } from 'lucide-react';
import React, { useState } from 'react';
import { AcademicUploaders } from '../academicSolver-mode/AcademicUploaders';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { ScrollArea } from '../ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '../ui/skeleton';

interface PresentationGenerationToolsProps {
    isDisabled: boolean;
    isGenerating: boolean;
    onGenerate: (variables: any) => void;
}

function ToolsSkeleton() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-24 w-full" />
                </CardContent>
            </Card>
        </div>
    )
}

export const PresentationGenerationTools = (props: PresentationGenerationToolsProps) => {
    const { t } = useLocalization();
    const { isDisabled, isGenerating, onGenerate } = props;
    const { toast } = useToast();

    const { project, setProject } = useBuilderStore();
    const {
        activePresentationId,
        setActivePresentationId,
    } = useGenerationUIStore();
    const { userProfile } = useAuth();
    const hasCreditsForGeneration = (userProfile?.credits ?? 0) >= 1;

    const { agents, isLoaded: agentsLoaded } = useAgents();

    const agent = agents.find(a => a.id === 'generate-presentation');
    const presentations = project?.presentation?.history || [];
    const hasContent = !!project?.proposal || !!project?.projectPlan || Object.keys(project?.sections || {}).length > 0 || (project?.externalContext?.length || 0) > 0;

    const handleAddExternalContext = (fileName: string, content: string) => {
        if (!project) return;
        project.addExternalContext(fileName, content, 'context');
        setProject(new Project(project.toStateObject()));
    }

    const handleRemoveExternalContext = (index: number) => {
        if (!project) return;
        project.removeExternalContext(index);
        setProject(new Project(project.toStateObject()));
    }

    const handleGenerateClick = () => {
        if (!project) return;

        // The AI now handles context selection automatically. Pass everything.
        const body = {
            proposal: project.proposal,
            projectPlan: project.projectPlan,
            otherSections: project.sections,
            otherDiagrams: Object.fromEntries(Object.entries(project.diagrams || {}).map(([key, value]) => [key, value?.plantUmlCode])),
            externalContext: project.externalContext,
        };

        onGenerate(body);
    }

    if (!agentsLoaded || !agent) {
        return <ToolsSkeleton />;
    }

    return (
        <div className="space-y-6">
            <Card className={cn("flex flex-col h-full", isDisabled && 'opacity-50 pointer-events-none')}>
                <CardHeader>
                    <CardTitle className="font-headline">{t('builder.presentationGenerator.toolsTitle')}</CardTitle>
                    <CardDescription>{t('builder.presentationGenerator.toolsDesc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h4 className="text-sm font-semibold mb-2">{t('builder.presentationGenerator.sourceDocuments')}</h4>
                        <p className="text-xs text-muted-foreground mb-2">The AI will automatically review all available project data. You can also upload additional files below.</p>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="file-uploader">
                                <AccordionTrigger className="rounded-md px-4 py-2 text-sm font-medium hover:bg-muted hover:no-underline">
                                    {t('builder.presentationGenerator.uploadNewContext')}
                                </AccordionTrigger>
                                <AccordionContent className="p-4 border">
                                    <AcademicUploaders
                                        title=""
                                        onContentAdded={handleAddExternalContext}
                                        onContentRemoved={handleRemoveExternalContext}
                                        isProcessing={isDisabled}
                                        uploadedContent={project?.externalContext?.filter(item => item.type === 'context') || []}
                                    />
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>

                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="w-full">
                                    <Button
                                        type="button"
                                        onClick={handleGenerateClick}
                                        disabled={isDisabled || isGenerating || !hasCreditsForGeneration || !hasContent}
                                        className="font-headline w-full"
                                    >
                                        {isGenerating ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
                                        {t('builder.presentationGenerator.generateButton')}
                                    </Button>
                                </div>
                            </TooltipTrigger>
                            {!hasCreditsForGeneration ? (
                                <TooltipContent>
                                    <p>{t('builder.toasts.insufficientCredits')}</p>
                                </TooltipContent>
                            ) : !hasContent ? (
                                <TooltipContent>
                                    <p>{t('builder.presentationGenerator.tooltips.noContent')}</p>
                                </TooltipContent>
                            ) : null}
                        </Tooltip>
                    </TooltipProvider>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <History className="w-5 h-5" />
                        {t('builder.presentationGenerator.historyTab')}
                    </CardTitle>
                    <CardDescription>
                        {t('builder.presentationGenerator.historyDesc')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-48">
                        {presentations.length > 0 ? (
                            <div className="space-y-2">
                                {presentations.map(p => {
                                    const isValidDate = p.id && !isNaN(new Date(p.id).getTime());
                                    return (
                                        <Button
                                            key={p.id}
                                            variant="ghost"
                                            onClick={() => setActivePresentationId(p.id)}
                                            className={cn(
                                                "w-full h-auto justify-start text-left p-2",
                                                activePresentationId === p.id && "bg-muted"
                                            )}
                                        >
                                            <div className="flex flex-col">
                                                <span>{p.name} ({t('builder.presentationGenerator.historyItem', { slideCount: (p.slides || []).length })})</span>
                                                {isValidDate && (
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatDistanceToNow(new Date(p.id), { addSuffix: true })}
                                                    </span>
                                                )}
                                            </div>
                                        </Button>
                                    )
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-8">{t('builder.presentationGenerator.historyEmpty')}</p>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
};
