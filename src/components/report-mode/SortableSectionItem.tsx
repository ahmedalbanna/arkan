
'use client';

import {
  AccordionItem,
} from "@/components/ui/accordion";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React from 'react';
import { SectionAccordionItem } from './SectionAccordionItem';
import type { Section } from "@/lib/models";


interface SortableSectionItemProps {
  section: Section;
  index: number;
  chapterIndex: number;
  onGenerate: () => void;
  isGenerating: boolean;
  isAnythingGenerating: boolean;
  hasCredits: boolean;
  isSelected: boolean;
  onSelect: () => void;
  isCheckboxVisible: boolean;
}

export function SortableSectionItem({
  section,
  index,
  chapterIndex,
  ...props
}: SortableSectionItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 0,
    position: 'relative',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <SectionAccordionItem
        itemKey={section.id}
        section={section}
        handleProps={{ ...listeners }}
        chapterIndex={chapterIndex}
        index={index}
        {...props}
      />
    </div>
  );
};
