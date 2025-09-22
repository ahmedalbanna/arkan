

'use client';

import React from 'react';
import { Accordion } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { type SectionName as SectionNameType } from '@/ai/schemas';
import { Loader2, PanelLeftClose } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';
import { useReportGenerationLogic } from '@/hooks';
import { SectionAccordionItem } from '@/components/section/SectionAccordionItem';
import { Button } from '../ui/button';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableSectionItemProps {
    id: SectionNameType;
    isGenerating: boolean;
    isAnythingGenerating: boolean;
    hasCredits: boolean;
    onGenerate: (section: SectionNameType) => void;
}

function SortableSectionItem({ id, ...props }: SortableSectionItemProps) {
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
                sectionKey={id}
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
}

export const GenerationTools = ({ onCollapseToggle }: GenerationToolsProps) => {
    const {
        isAnythingGenerating,
        activeMutationKey,
        onGenerateSection,
        hasCreditsForSingleSection,
        orderedSections,
        setOrderedSections,
    } = useReportGenerationLogic();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
          coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: any) => {
        const {active, over} = event;
        if (active.id !== over.id) {
          const oldIndex = orderedSections.indexOf(active.id);
          const newIndex = orderedSections.indexOf(over.id);
          setOrderedSections(arrayMove(orderedSections, oldIndex, newIndex));
        }
    };


    const isDisabled = isAnythingGenerating;
    const { t } = useLocalization();


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
                    <SortableContext items={orderedSections} strategy={verticalListSortingStrategy}>
                        <Accordion type="multiple" className="w-full space-y-1">
                            {orderedSections.map((key) => {
                                const isGeneratingThis = isAnythingGenerating && activeMutationKey === key;
                                return (
                                    <SortableSectionItem
                                        key={key}
                                        id={key}
                                        onGenerate={onGenerateSection}
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
