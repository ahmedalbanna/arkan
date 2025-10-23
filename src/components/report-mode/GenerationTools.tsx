'use client';

import { SectionName } from '@/ai/schemas';
import { SectionAccordionItem } from '@/components/section/SectionAccordionItem';
import { Accordion } from '@/components/ui/accordion';
import { AnimatedContainer } from '@/components/ui/animation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingIndicator, SectionLoadingCard } from '@/components/ui/loading-indicators';
import { useLocalization } from '@/context/LocalizationContext';
import { Agent } from '@/lib/models/agent';
import { Section } from '@/lib/models/section';
import { cn } from '@/lib/utils';
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMutation } from '@tanstack/react-query';
import { PanelLeftClose, Settings } from 'lucide-react';
import { Button } from '../ui/button';

interface SortableSectionItemProps {
    id: string;
    agent: Agent;
    isGenerating: boolean;
    isAnythingGenerating: boolean;
    hasCredits: boolean;
    reportGenerationMutation: ReturnType<typeof useMutation>;
    handleProps: any;
    generationState?: {
        isLoading: boolean;
        isSuccess?: boolean;
        isError?: boolean;
        progress?: number;
        message?: string;
    };
    onRetry?: () => void;
}

function SortableSectionItem({ id, agent, generationState, onRetry, handleProps, ...props }: SortableSectionItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    if (generationState && (generationState.isLoading || generationState.isSuccess || generationState.isError)) {
        return (
            <AnimatedContainer animation="fade-in-up" delay={100}>
                <div ref={setNodeRef} style={style} {...attributes}>
                    <SectionLoadingCard
                        sectionName={agent.name}
                        state={generationState}
                        onRetry={onRetry}
                        className="mb-2"
                    />
                </div>
            </AnimatedContainer>
        );
    }

    return (
        <AnimatedContainer animation="fade-in-up" delay={100}>
            <div ref={setNodeRef} style={style} {...attributes}>
                <SectionAccordionItem
                    itemKey={id as SectionName}
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

interface GenerationToolsProps {
    onCollapseToggle: () => void;
    orderedSections: Section[];
    setOrderedSections: (sections: Section[]) => void;
    isAnythingGenerating: boolean;
    activeMutationKey: string | null;
    reportGenerationMutation: ReturnType<typeof useMutation>;
    hasCreditsForSingleSection: boolean;
    agents: Agent[];
    generationStates?: Record<string, {
        isLoading: boolean;
        isSuccess?: boolean;
        isError?: boolean;
        progress?: number;
        message?: string;
    }>;
    onRetrySection?: (sectionId: string) => void;
}

export const GenerationTools = ({
    onCollapseToggle,
    orderedSections,
    setOrderedSections,
    isAnythingGenerating,
    activeMutationKey,
    reportGenerationMutation,
    hasCreditsForSingleSection,
    agents,
    generationStates = {},
    onRetrySection,
}: GenerationToolsProps) => {
    const { t } = useLocalization();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (active.id !== over.id) {
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

    return (
        <AnimatedContainer animation="fade-in-up" delay={200}>
            <Card variant="glass" className={cn("flex flex-col h-full backdrop-blur-md shadow-soft hover:shadow-glow transition-all duration-200", (isDisabled) && 'opacity-50 pointer-events-none')}>
                <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600">
                                <Settings className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-headline font-semibold">{t('builder.reportGenerator.toolsTitle')}</CardTitle>
                                <CardDescription>{t('builder.reportGenerator.toolsDesc')}</CardDescription>

                                {isAnythingGenerating && (
                                    <div className="mt-2">
                                        <LoadingIndicator
                                            state={{
                                                isLoading: true,
                                                message: `Generating ${activeMutationKey || 'section'}...`,
                                                progress: generationStats.completed > 0 ?
                                                    (generationStats.completed / generationStats.total) * 100 : 0
                                            }}
                                            size="sm"
                                            showProgress={true}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {generationStats.total > 0 && (
                                <Badge variant="secondary" className="shadow-soft">
                                    {generationStats.completed}/{generationStats.total} Complete
                                </Badge>
                            )}
                            <Button variant="ghost" size="icon" className="hidden lg:inline-flex hover:shadow-soft transition-all duration-200" onClick={onCollapseToggle}>
                                <PanelLeftClose className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow overflow-y-auto pr-2">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={orderedSections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                            <Accordion type="multiple" className="w-full space-y-1">
                                {orderedSections.map((section, index) => {
                                    const agent = agents?.find(a => a.id === section.agentId);
                                    if (!agent) return null;

                                    const isGeneratingThis = isAnythingGenerating && activeMutationKey === section.id;
                                    const sectionState = generationStates[section.id] || {
                                        isLoading: isGeneratingThis,
                                        isSuccess: false,
                                        isError: false,
                                        progress: isGeneratingThis ? 50 : undefined,
                                        message: isGeneratingThis ? 'Generating...' : undefined
                                    };

                                    return (
                                        <SortableSectionItem
                                            key={section.id}
                                            id={section.id}
                                            agent={agent}
                                            isGenerating={isGeneratingThis}
                                            isAnythingGenerating={isAnythingGenerating}
                                            hasCredits={!!hasCreditsForSingleSection}
                                            reportGenerationMutation={reportGenerationMutation}
                                            handleProps={{}}
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
