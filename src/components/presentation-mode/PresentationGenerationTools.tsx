
'use client';

import { type DiagramType, type SectionName as SectionNameType } from '@/ai/schemas';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useAgents, useBuilderStore, useGenerationUIStore, useSections, useToast } from '@/hooks';
import { getSelectedGuidelines } from '@/lib/guideline-utils';
import { Project } from '@/lib/models/project';
import { cn } from '@/lib/utils';
import { Loader2, PanelLeftClose, Settings, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import { AcademicUploaders } from '../academicSolver-mode/AcademicUploaders';
import { GuidelineEditor } from '../section/SectionGuidelineEditor';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
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
                    <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-10 w-full" />
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-full" />
                </CardFooter>
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
        guidelineState,
    } = useGenerationUIStore();
    const { userProfile } = useAuth();
    const hasCreditsForGeneration = (userProfile?.credits ?? 0) >= 1;

    const { agents, isLoaded: agentsLoaded } = useAgents();

    const [tone, setTone] = useState('');
    const [complexity, setComplexity] = useState('');

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

        const sourceDocuments = [];

        if (project?.proposal) {
            sourceDocuments.push({
                fileName: "Project Proposal",
                content: JSON.stringify(project.proposal, null, 2)
            });
        }
        
        if(project?.sections) {
            for (const key in project.sections) {
                sourceDocuments.push({
                    fileName: "Report Section: " + key,
                    content: project.sections[key as SectionNameType]!
                });
            }
        }
        
        if(project?.diagrams) {
            for (const key in project.diagrams) {
                 sourceDocuments.push({
                    fileName: `Diagram: ${key}`,
                    content: project.diagrams[key as DiagramType]!.plantUmlCode
                });
            }
        }

        if(project?.externalContext) {
            project.externalContext.forEach((file) => {
                sourceDocuments.push(file);
            });
        }


        const body = {
            proposal: project?.proposal,
            projectPlan: project?.projectPlan,
            sourceDocuments: sourceDocuments,
            guidelines: getSelectedGuidelines(agent, guidelineState['presentation']),
            tone: tone,
            complexity: complexity,
        };
        onGenerate(body);
    }

    if (!agentsLoaded || !agent) {
        return <ToolsSkeleton />;
    }

    return (
        <Card className={cn("flex flex-col h-full", isDisabled && 'opacity-50 pointer-events-none')}>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="font-headline">{t('builder.presentationGenerator.toolsTitle')}</CardTitle>
                        <CardDescription>{t('builder.presentationGenerator.toolsDesc')}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto pr-2">
                <Tabs defaultValue="generate" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="generate">{t('builder.presentationGenerator.generateTab')}</TabsTrigger>
                        <TabsTrigger value="history">{t('builder.presentationGenerator.historyTab')}</TabsTrigger>
                    </TabsList>
                    <TabsContent value="generate" className="pt-6 space-y-4">
                        
                        <div>
                            <h4 className="text-sm font-semibold mb-2">{t('builder.presentationGenerator.sourceDocuments')}</h4>
                            <p className="text-xs text-muted-foreground mb-2">The AI will automatically review all available project data. You can also upload additional files below.</p>
                            <Accordion type="single" collapsible className="w-full space-y-1">
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

                        <div>
                            <h4 className="text-sm font-semibold mb-2">{t('builder.presentationGenerator.generationSettings')}</h4>
                            <Accordion type="multiple" className="w-full space-y-1">
                                <AccordionItem value="settings">
                                    <AccordionTrigger className="rounded-md px-4 py-2 text-sm font-medium hover:bg-muted hover:no-underline">
                                        <div className="flex items-center gap-2">
                                            <Settings className="h-4 w-4" /> {t('builder.presentationGenerator.advancedSettings')}
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-4 p-4 border">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="tone-select">{t('builder.reportGenerator.tool_tone_label')}</Label>
                                                <Select value={tone} onValueChange={setTone}>
                                                    <SelectTrigger id="tone-select"><SelectValue placeholder={t('builder.reportGenerator.tool_tone_professional')} /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="professional">{t('builder.reportGenerator.tool_tone_professional')}</SelectItem>
                                                        <SelectItem value="casual">{t('builder.reportGenerator.tool_tone_casual')}</SelectItem>
                                                        <SelectItem value="enthusiastic">{t('builder.presentationGenerator.toneEnthusiastic')}</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="complexity-select">{t('builder.presentationGenerator.complexity')}</Label>
                                                <Select value={complexity} onValueChange={setComplexity}>
                                                    <SelectTrigger id="complexity-select"><SelectValue placeholder={t('builder.presentationGenerator.complexityDefault')} /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="summary">{t('builder.presentationGenerator.complexitySummary')}</SelectItem>
                                                        <SelectItem value="detailed">{t('builder.presentationGenerator.complexityDetailed')}</SelectItem>
                                                        <SelectItem value="technical">{t('builder.presentationGenerator.complexityTechnical')}</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="guidelines">
                                    <AccordionTrigger className="rounded-md px-4 py-2 text-sm font-medium hover:bg-muted hover:no-underline">
                                        {t('builder.presentationGenerator.promptAndGuidelines')}
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-4 p-4 border">
                                        <GuidelineEditor itemKey="presentation" agentId="generate-presentation" isAdmin={userProfile?.role === 'admin'} />
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    </TabsContent>
                    <TabsContent value="history" className="pt-6">
                        <ScrollArea className="h-96">
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
                                <p className="text-sm text-muted-foreground text-center">{t('builder.presentationGenerator.historyEmpty')}</p>
                            )}
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
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
    );
};
