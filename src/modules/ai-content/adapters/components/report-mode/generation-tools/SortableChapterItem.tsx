'use client';

import { Button } from '@/components/ui/button';
import { Chapter } from '@/modules/ai-content/domain/entities/Chapter';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  PlusCircle,
  ChevronDown,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { SectionAccordionItem } from './SectionAccordionItem';
import { useBuilderStore } from "@/hooks";
import { cn } from '@/infrastructure/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

interface SortableChapterItemProps {
  chapter: Chapter;
  index: number;
  isProjectBuildMode: boolean;
  selectedSectionsForBuild: Set<string>;
  toggleChapterSelection: (chapterId: string, select: boolean) => void;
  toggleSectionSelection: (sectionId: string) => void;
  activeSectionId: string | null;
  selectedSectionIds?: string[];
  onActivateSection: (sectionId: string, multiSelect?: boolean) => void;
  onActivate?: () => void;
  isActive?: boolean;
}

export function SortableChapterItem({
  chapter,
  index,
  isProjectBuildMode,
  selectedSectionsForBuild,
  toggleChapterSelection,
  toggleSectionSelection,
  activeSectionId,
  selectedSectionIds = [],
  onActivateSection,
  onActivate,
  isActive,
}: SortableChapterItemProps) {
    const { 
        updateProject
    } = useBuilderStore(state => ({
        updateProject: state.updateProject,
    }));
    
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: chapter.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 0,
    position: 'relative',
  };

  const sectionsInChapter = chapter.sections;
  const isAllSectionsSelected = useMemo(() => {
    if (sectionsInChapter.length === 0) return false;
    return sectionsInChapter.every(s => selectedSectionsForBuild.has(s.id));
  }, [sectionsInChapter, selectedSectionsForBuild]);

  const isSomeSectionsSelected = useMemo(() => {
    if (sectionsInChapter.length === 0) return false;
    const hasSelected = sectionsInChapter.some(s => selectedSectionsForBuild.has(s.id));
    return hasSelected && !isAllSectionsSelected;
  }, [sectionsInChapter, selectedSectionsForBuild, isAllSectionsSelected]);

  const handleAddSection = (chapterId: string) => {
    updateProject(p => p.addSectionToChapter(chapterId, 'Untitled Section'));
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div className={cn(
        "bg-card border rounded-xl shadow-sm overflow-hidden group/chapter transition-all duration-200",
        isActive ? "border-primary ring-1 ring-primary/20 -translate-y-[1px]" : "border-border/60"
      )}>
        <div 
          className={cn(
            "flex items-center px-4 py-3 border-b cursor-pointer",
            isActive ? "bg-primary/[0.03]" : "bg-muted/20 hover:bg-muted/30"
          )}
          onClick={() => onActivate?.()}
        >
          {isProjectBuildMode && (
            <div className="flex items-center gap-2 mr-3" onClick={(e) => e.stopPropagation()}>
              <Checkbox
                id={`select-chapter-${chapter.id}`}
                checked={isAllSectionsSelected}
                aria-checked={isSomeSectionsSelected ? 'mixed' : isAllSectionsSelected}
                onCheckedChange={(checked: any) => toggleChapterSelection(chapter.id, !!checked)}
                aria-label={`Select all sections in chapter ${chapter.title}`}
                className="h-4 w-4"
              />
            </div>
          )}
          <div className="flex-1 py-0 min-w-0">
            <div className="flex items-center gap-3 flex-1 min-w-0 group">
              {listeners && (
                <div {...listeners} className="p-1.5 rounded-md cursor-grab touch-none -ml-2 flex items-center gap-2 text-muted-foreground transition-colors hover:bg-background/80 hover:text-primary" onClick={(e) => e.stopPropagation()}>
                  <span className="text-[10px] w-5 text-center font-bold">{index + 1}</span>
                  <GripVertical className="h-4 w-4" />
                </div>
              )}
              <span className={cn(
                "text-sm font-bold tracking-tight truncate flex-1 text-left min-w-0 transition-colors uppercase tracking-widest",
                isActive ? "text-primary" : "group-hover:text-primary"
              )}>
                {chapter.title}
              </span>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg group-hover/chapter:bg-background/50"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCollapsed(!isCollapsed);
                }}
              >
                <ChevronDown className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform duration-300",
                  isCollapsed && "-rotate-90"
                )} />
              </Button>
            </div>
          </div>
        </div>
        
        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="p-3 space-y-3 bg-muted/5">
                <div className="w-full space-y-3">
                  {chapter.sections.map((section, sectionIndex) => (
                    <SectionAccordionItem
                      key={section.id}
                      section={section}
                      sectionIndex={sectionIndex}
                      chapterIndex={index}
                      isProjectBuildMode={isProjectBuildMode}
                      isSelected={selectedSectionsForBuild.has(section.id)}
                      toggleSectionSelection={toggleSectionSelection}
                      isActive={selectedSectionIds.includes(section.id)}
                      onActivate={onActivateSection}
                    />
                  ))}
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={(e) => { e.stopPropagation(); handleAddSection(chapter.id); }} 
                  className="w-full h-8 text-[10px] font-bold uppercase tracking-widest gap-2 hover:bg-primary/5 hover:text-primary border border-dashed border-transparent hover:border-primary/20 transition-all"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  Add Section
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
