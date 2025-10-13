

'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AnimatedContainer } from '@/components/ui/animation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useAgents, useBuilderStore, useGenerationUIStore, useToast } from '@/hooks';
import { Project } from '@/lib/models/project';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { History, Loader2, Sparkles } from 'lucide-react';
import { AcademicUploaders } from '../academicSolver-mode/AcademicUploaders';
import { ScrollArea } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface PresentationGenerationToolsProps {
    isDisabled: boolean;
    isGenerating: boolean;
    onGenerate: (variables: any) => void;
}

function ToolsSkeleton() {
    return (
        <div className="space-y-6">
            <Card variant="glass" className="backdrop-blur-md shadow-soft hover:shadow-glow">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
                    <Skeleton className="h-6 w-3/4 bg-gradient-to-r from-muted to-muted/80" />
                    <Skeleton className="h-4 w-full bg-gradient-to-r from-muted to-muted/80" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-24 w-full bg-gradient-to-r from-muted to-muted/80" />
                    <Skeleton className="h-10 w-full bg-gradient-to-r from-muted to-muted/80" />
                </CardContent>
            </Card>
            <Card variant="glass" className="backdrop-blur-md shadow-soft hover:shadow-glow">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
                    <Skeleton className="h-6 w-1/2 bg-gradient-to-r from-muted to-muted/80" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-24 w-full bg-gradient-to-r from-muted to-muted/80" />
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
            <AnimatedContainer animation="fade-in-up" delay={100}>
                <Card className={cn("flex flex-col h-full backdrop-blur-md shadow-soft hover:shadow-glow", isDisabled && 'opacity-50 pointer-events-none')}>
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
                        <CardTitle className="font-headline">{t('builder.presentationGenerator.toolsTitle')}</CardTitle>
                        <CardDescription>{t('builder.presentationGenerator.toolsDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <AnimatedContainer animation="fade-in-up" delay={200}>
                            <div>
                                <h4 className="text-sm font-semibold mb-2 font-headline">{t('builder.presentationGenerator.sourceDocuments')}</h4>
                                <p className="text-xs text-muted-foreground mb-2">The AI will automatically review all available project data. You can also upload additional files below.</p>
                                <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value="file-uploader" className="bg-gradient-to-r from-background/50 to-primary/5 backdrop-blur-sm shadow-soft hover:shadow-glow rounded-lg border">
                                        <AccordionTrigger className="rounded-md px-4 py-2 text-sm font-medium hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10 hover:shadow-soft hover:no-underline">
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
                        </AnimatedContainer>

                    </CardContent>
                    <CardFooter className="flex flex-col gap-2 bg-gradient-to-r from-muted/30 to-primary/5">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="w-full">
                                        <Button
                                            type="button"
                                            onClick={handleGenerateClick}
                                            disabled={isDisabled || isGenerating || !hasCreditsForGeneration || !hasContent}
                                            className="font-headline w-full"
                                            variant="gradient"
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
            </AnimatedContainer>

            <AnimatedContainer animation="fade-in-up" delay={300}>
                <Card variant="glass" className="backdrop-blur-md shadow-soft hover:shadow-glow">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
                        <CardTitle className="font-headline flex items-center gap-2">
                            <div className="p-1 rounded-lg bg-gradient-to-br from-primary to-primary-600 shadow-soft">
                                <History className="w-4 h-4 text-white" />
                            </div>
                            {t('builder.presentationGenerator.historyTab')}
                        </CardTitle>
                        <CardDescription>
                            {t('builder.presentationGenerator.historyDesc')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-48 bg-gradient-to-r from-background/50 to-primary/5 backdrop-blur-sm shadow-soft rounded-lg">
                            {presentations.length > 0 ? (
                                <div className="space-y-2 p-2">
                                    {presentations.map((p, index) => {
                                        const isValidDate = p.id && !isNaN(new Date(p.id).getTime());
                                        return (
                                            <AnimatedContainer key={p.id} animation="fade-in-up" delay={index * 100}>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => setActivePresentationId(p.id)}
                                                    className={cn(
                                                        "w-full h-auto justify-start text-left p-2 hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10 hover:shadow-soft",
                                                        activePresentationId === p.id && "bg-gradient-to-r from-primary/20 to-blue-500/20 shadow-soft"
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
                                            </AnimatedContainer>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <AnimatedContainer animation="fade-in-up" delay={100}>
                                        <p className="text-sm text-muted-foreground text-center py-8">{t('builder.presentationGenerator.historyEmpty')}</p>
                                    </AnimatedContainer>
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </AnimatedContainer>
        </div>
    );
};
