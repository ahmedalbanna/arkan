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
import { v4 as uuidv4 } from 'uuid';
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
    updateProject(p => p.addSectionToChapter(chapterId, uuidv4(), 'Untitled Section'));
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="group/chapter-container">
      <div className={cn(
        "relative bg-card/40 border rounded-2xl shadow-sm overflow-hidden transition-all duration-300 hover:translate-x-0.5",
        isActive 
            ? "border-primary/30 bg-primary/[0.02] shadow-[0_4px_20px_rgba(0,0,0,0.04)] ring-1 ring-primary/10" 
            : "border-border/60 hover:border-primary/20 hover:shadow-md"
      )}>
        <div 
          className={cn(
            "flex items-center px-4 py-2.5 cursor-pointer border-b transition-colors",
            isActive ? "bg-primary/[0.04] border-primary/10" : "bg-muted/10 hover:bg-muted/20 border-border/40"
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
                className="h-4 w-4 rounded-md"
              />
            </div>
          )}
          
          <div className="flex-1 py-0 min-w-0">
            <div className="flex items-center gap-3 flex-1 min-w-0 group">
              {listeners && (
                <div 
                    {...listeners} 
                    className="p-1.5 rounded-lg cursor-grab touch-none -ml-2 flex items-center gap-2 text-muted-foreground/40 transition-all hover:bg-background/80 hover:text-primary active:cursor-grabbing" 
                    onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-[10px] w-4 text-center font-black uppercase tracking-[0.2em] tabular-nums">{index + 1}</span>
                  <GripVertical className="h-4 w-4 opacity-40 group-hover:opacity-100" />
                </div>
              )}
              
              <div className="flex flex-col flex-1 min-w-0 text-left">
                <span className={cn(
                    "text-[11px] font-black uppercase tracking-[0.2em] transition-colors duration-300",
                    isActive ? "text-primary" : "text-muted-foreground/80 group-hover:text-primary"
                )}>
                    {chapter.title || 'UNTITLED CHAPTER'}
                </span>
                <span className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em] mt-0.5">
                    {sectionsInChapter.length} Sections Integrated
                </span>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                    "h-8 w-8 rounded-xl transition-all duration-300",
                    isActive ? "bg-primary/10 text-primary" : "hover:bg-primary/5 hover:text-primary text-muted-foreground/60"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCollapsed(!isCollapsed);
                }}
              >
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)",
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
              transition={{ duration: 0.35, ease: [0.33, 1, 0.68, 1] }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-muted/5 relative">
                {/* Visual depth vertical line */}
                <div className="absolute left-6 top-0 bottom-10 w-px bg-gradient-to-b from-border/60 via-primary/10 to-transparent" />
                
                <div className="w-full space-y-2.5 pl-6 rtl:pl-0 rtl:pr-6">
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

                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={(e) => { e.stopPropagation(); handleAddSection(chapter.id); }} 
                    className="w-full h-9 text-[9px] font-black uppercase tracking-[0.2em] gap-2 hover:bg-primary/5 hover:text-primary border border-dashed border-border/60 hover:border-primary/30 transition-all duration-300 rounded-xl mt-4 text-muted-foreground/60"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    Integrate New Section
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
