'use client';

import { ReportGenerateSectionOutput, SectionName } from '@/ai/schemas';
import { SectionAccordionItem } from '@/components/section/SectionAccordionItem';
import { Accordion } from '@/components/ui/accordion';
import { AnimatedContainer } from '@/components/ui/animation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingIndicator, SectionLoadingCard } from '@/components/ui/loading-indicators';
import { useLocalization } from '@/context/LocalizationContext';
import { useReportModeGenerator } from '@/hooks'; // Corrected import
import { Agent } from '@/lib/models/agent';
import { Section } from '@/lib/models/section';
import { cn } from '@/lib/utils';
import { closestCenter, DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { UseMutationResult } from '@tanstack/react-query';
import { PanelLeftClose, Settings } from 'lucide-react';
import { Button } from '../ui/button';

// SortableSectionItem remains unchanged
interface SortableSectionItemProps {
    section: Section;
    agent: Agent;
    isGenerating: boolean;
    isAnythingGenerating: boolean;
    hasCredits: boolean;
    reportGenerationMutation: UseMutationResult<ReportGenerateSectionOutput, Error, { body: any }, unknown>;
    generationState?: {
        isLoading: boolean;
        isSuccess?: boolean;
        isError?: boolean;
        progress?: number;
        message?: string;
    };
    onRetry?: () => void;
}

function SortableSectionItem({ section, agent, generationState, onRetry, ...props }: SortableSectionItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id });
    const style = { transform: CSS.Transform.toString(transform), transition };

    // The logic for displaying SectionLoadingCard or SectionAccordionItem remains the same
    if (generationState && (generationState.isLoading || generationState.isSuccess || generationState.isError)) {
        return (
            <AnimatedContainer animation="fade-in-up" delay={100}>
                <div ref={setNodeRef} style={style} {...attributes}>
                    <SectionLoadingCard sectionName={agent.name} state={generationState} onRetry={onRetry} className="mb-2" />
                </div>
            </AnimatedContainer>
        );
    }

    return (
        <AnimatedContainer animation="fade-in-up" delay={100}>
            <div ref={setNodeRef} style={style} {...attributes}>
                <SectionAccordionItem
                    itemKey={section.id as SectionName}
                    agent={agent}
                    isGenerating={props.isGenerating}
                    isAnythingGenerating={props.isAnythingGenerating}
                    hasCredits={props.hasCredits}
                    reportGenerationMutation={props.reportGenerationMutation}
                    handleProps={listeners}
                />
            </div>
        </AnimatedContainer>
    );
}

// Simplified props
interface GenerationToolsProps {
    onCollapseToggle: () => void;
}

export const GenerationTools = ({ onCollapseToggle }: GenerationToolsProps) => {
    const { t } = useLocalization();

    // Fetching all data and logic directly from the hook
    const {
        orderedSections,
        setOrderedSections,
        isAnythingGenerating,
        reportGenerationMutation,
        hasCreditsForSingleSection,
        agents,
        agentsLoaded
    } = useReportModeGenerator();

    // Placeholder for states not yet in the hook - can be moved later
    const activeMutationKey: string | null = reportGenerationMutation.variables?.body.sectionId || null;
    const generationStates: Record<string, any> = {}; // This would need a more complex state management in the hook
    const onRetrySection = (sectionId: string) => {
        console.log('Retrying section:', sectionId);
        // In a real implementation, you would get the agentId and call the mutation again
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = orderedSections.findIndex(s => s.id === active.id);
            const newIndex = orderedSections.findIndex(s => s.id === over.id);
            setOrderedSections(arrayMove(orderedSections, oldIndex, newIndex));
        }
    };

    const isDisabled = isAnythingGenerating;

    const generationStats = {
        total: orderedSections.length,
        completed: Object.values(generationStates).filter(state => state.isSuccess).length,
        failed: Object.values(generationStates).filter(state => state.isError).length,
        generating: Object.values(generationStates).filter(state => state.isLoading).length,
    };

    if (!agentsLoaded) {
        return <div>Loading Generation Tools...</div>; // Or a skeleton loader
    }

    return (
        <AnimatedContainer animation="fade-in-up" delay={200}>
            <Card variant="glass" className={cn("flex flex-col h-full backdrop-blur-md shadow-soft hover:shadow-glow transition-all duration-200", isDisabled && 'opacity-50 pointer-events-none')}>
                <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600"><Settings className="h-5 w-5 text-white" /></div>
                            <div>
                                <CardTitle className="text-lg font-headline font-semibold">{t('builder.reportGenerator.toolsTitle')}</CardTitle>
                                <CardDescription>{t('builder.reportGenerator.toolsDesc')}</CardDescription>
                                {isAnythingGenerating && (
                                    <div className="mt-2">
                                        <LoadingIndicator
                                            state={{
                                                isLoading: true,
                                                message: `Generating ${activeMutationKey || 'section'}...`,
                                                progress: generationStats.completed > 0 ? (generationStats.completed / generationStats.total) * 100 : 0
                                            }}
                                            size="sm"
                                            showProgress={true}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {generationStats.total > 0 && <Badge variant="secondary" className="shadow-soft">{generationStats.completed}/{generationStats.total} Complete</Badge>}
                            <Button variant="ghost" size="icon" className="hidden lg:inline-flex hover:shadow-soft transition-all duration-200" onClick={onCollapseToggle}><PanelLeftClose className="h-5 w-5" /></Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow overflow-y-auto pr-2">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={orderedSections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                            <Accordion type="multiple" className="w-full space-y-1">
                                {orderedSections.map((section) => {
                                    const agent = agents?.find(a => a.id === section.agentId);
                                    if (!agent) {
                                        console.warn(`Agent with ID '${section.agentId}' not found for section '${section.id}'.`);
                                        return null;
                                    }

                                    const isGeneratingThis = isAnythingGenerating && activeMutationKey === section.id;
                                    const sectionState = generationStates[section.id] || { isLoading: isGeneratingThis };

                                    return (
                                        <SortableSectionItem
                                            key={section.id}
                                            section={section}
                                            agent={agent}
                                            isGenerating={isGeneratingThis}
                                            isAnythingGenerating={isAnythingGenerating}
                                            hasCredits={!!hasCreditsForSingleSection}
                                            reportGenerationMutation={reportGenerationMutation}
                                            generationState={sectionState}
                                            onRetry={onRetrySection ? () => onRetrySection(section.id) : undefined}
                                        />
                                    );
                                })}
                            </Accordion>
                        </SortableContext>
                    </DndContext>
                </CardContent>
            </Card>
        </AnimatedContainer>
    );
};