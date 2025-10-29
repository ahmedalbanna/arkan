'use client';

import React from 'react';
import { Accordion } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';
import { PanelLeftClose } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';
import { SectionAccordionItem } from './SectionAccordionItem';
import { Button } from '../ui/button';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Section } from '@/lib/models/section';
import { Agent } from '@/lib/models';
import { SectionName } from '@/ai/schemas';

interface SortableSectionItemProps {
    id: string;
    agent: Agent;
    isGenerating: boolean;
    isAnythingGenerating: boolean;
    hasCredits: boolean;
    onGenerate: () => void;
}


function SortableSectionItem({ id, agent, ...props }: SortableSectionItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({id: id});

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
             <SectionAccordionItem
                itemKey={id}
                agent={agent}
                onGenerate={props.onGenerate}
                isGenerating={props.isGenerating}
                isAnythingGenerating={props.isAnythingGenerating}
                hasCredits={props.hasCredits}
                handleProps={listeners}
            />
        </div>
    );
}

interface GenerationToolsProps {
    onCollapseToggle: () => void;
    orderedSections: Section[];
    setOrderedSections: (sections: Section[]) => void;
    isAnythingGenerating: boolean;
    activeMutationKey: string | null;
    onGenerateSection: (sectionId: SectionName) => void;
    hasCreditsForSingleSection: boolean;
    agents: Agent[];
}

export const GenerationTools = ({
    onCollapseToggle,
    orderedSections,
    setOrderedSections,
    isAnythingGenerating,
    activeMutationKey,
    onGenerateSection,
    hasCreditsForSingleSection,
    agents,
}: GenerationToolsProps) => {
    const { t } = useLocalization();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
          coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: any) => {
        const {active, over} = event;
        if (active.id !== over.id) {
          const oldIndex = orderedSections.findIndex(s => s.id === active.id);
          const newIndex = orderedSections.findIndex(s => s.id === over.id);
          setOrderedSections(arrayMove(orderedSections, oldIndex, newIndex));
        }
    };


    const isDisabled = isAnythingGenerating;


    return (
        <Card className={cn("flex flex-col h-full", (isDisabled) && 'opacity-50 pointer-events-none')}>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="font-headline">{t('builder.reportGenerator.toolsTitle')}</CardTitle>
                        <CardDescription>{t('builder.reportGenerator.toolsDesc')}</CardDescription>
                    </div>
                     <Button variant="ghost" size="icon" className="hidden lg:inline-flex" onClick={onCollapseToggle}>
                        <PanelLeftClose className="h-5 w-5" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto pr-2">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={orderedSections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                        <Accordion type="multiple" className="w-full space-y-1">
                            {orderedSections.map((section) => {
                                const agent = agents?.find(a => a.id === section.agentId);
                                if (!agent) return null;

                                const isGeneratingThis = isAnythingGenerating && activeMutationKey === section.id;
                                return (
                                    <SortableSectionItem
                                        key={section.id}
                                        id={section.id}
                                        agent={agent}
                                        onGenerate={() => onGenerateSection(section.id as SectionName)}
                                        isGenerating={isGeneratingThis}
                                        isAnythingGenerating={isAnythingGenerating}
                                        hasCredits={!!hasCreditsForSingleSection}
                                    />
                                );
                            })}
                        </Accordion>
                    </SortableContext>
                </DndContext>
            </CardContent>
        </Card>
    );
};
