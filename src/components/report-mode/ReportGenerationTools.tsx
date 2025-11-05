
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';
import { PanelLeftClose, ListPlus, Wand2 } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';
import { Button } from '../ui/button';
import { useBuilderStore, useWritingTool } from '@/hooks';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from '@/hooks';
import { Accordion } from '@/components/ui/accordion';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { SectionAccordionItem } from './SectionAccordionItem';
import { useSortable } from '@dnd-kit/sortable';
import { Section } from '@/lib/models';
import { ScrollArea } from '../ui/scroll-area';
import { CSS } from '@dnd-kit/utilities';
import { Loader2 } from 'lucide-react';

interface GenerationToolsProps {
  onCollapseToggle: () => void;
  orderedSections: Section[];
  setOrderedSections: (sections: Section[]) => void;
  isAnythingGenerating: boolean;
  activeMutationKey: string | null;
  onGenerateSection: (sectionId: string) => void;
  hasCreditsForSingleSection: boolean;
}

const SortableSectionItem = ({
  section,
  index,
  ...props
}: {
  section: Section;
  index: number;
  [key: string]: any; // To pass through other props
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: section.id });

  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <SectionAccordionItem
        itemKey={section.id}
        section={section}
        handleProps={{ ...listeners }}
        index={index}
        {...props}
      />
    </div>
  );
};


export const GenerationTools = ({
  onCollapseToggle,
  orderedSections,
  setOrderedSections,
  isAnythingGenerating,
  activeMutationKey,
  onGenerateSection,
  hasCreditsForSingleSection,
}: GenerationToolsProps) => {
  const { t } = useLocalization();
  const { project, updateProject } = useBuilderStore();
  const [tocText, setTocText] = useState('');

  const tocMutation = useWritingTool('/api/writing-tools/generate-toc', {
    onSuccess: (data: any) => {
        if (data.tableOfContents) {
            setTocText(data.tableOfContents.join('\n'));
            toast({ title: "Table of Contents Suggested", description: "AI has generated a suggested ToC for your project." });
        }
    }
  });


  const handleCreateSections = () => {
    if (!tocText.trim()) {
        toast({
            title: "Table of Contents is empty",
            description: "Please paste the section titles into the text area.",
            variant: "destructive",
        });
        return;
    }

    const sectionTitles = tocText.split('\n').map(title => title.trim()).filter(title => title);
    
    updateProject(p => {
        sectionTitles.forEach(title => {
            p.addCustomSection(undefined, title);
        });
    });

    toast({
        title: "Sections Created",
        description: `${sectionTitles.length} sections have been added to your project.`,
    });
    setTocText('');
  };

  const handleSuggestToc = () => {
      if (!project?.projectIdea) {
          toast({ title: "Project Idea is Missing", description: "Please add a project idea first.", variant: "destructive" });
          return;
      }
      tocMutation.mutate({ projectIdea: project.projectIdea });
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = orderedSections.findIndex((s) => s.id === active.id);
      const newIndex = orderedSections.findIndex((s) => s.id === over.id);
      const newOrder = arrayMove(orderedSections, oldIndex, newIndex);
      setOrderedSections(newOrder);
    }
  };

  return (
    <Card className={cn("flex flex-col h-full")}>
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
      <CardContent className="flex-grow flex flex-col gap-4 min-h-0">
          <div className="space-y-2">
              <Label htmlFor="toc-input">Table of Contents</Label>
              <Textarea
                id="toc-input"
                value={tocText}
                onChange={(e) => setTocText(e.target.value)}
                placeholder={"Introduction\nSystem Analysis\nSystem Design\nConclusion..."}
                className="flex-grow resize-none"
                rows={5}
              />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSuggestToc} variant="outline" className="w-full" disabled={tocMutation.isPending}>
                {tocMutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin"/> : <Wand2 className="me-2 h-4 w-4" />}
                AI Suggest ToC
            </Button>
            <Button onClick={handleCreateSections} className="w-full">
                <ListPlus className="me-2 h-4 w-4" />
                Create Sections
            </Button>
          </div>
          <ScrollArea className="flex-grow">
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={orderedSections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                <Accordion type="single" collapsible className="w-full space-y-2">
                  {orderedSections.map((section, index) => (
                    <SortableSectionItem
                      key={section.id}
                      section={section}
                      index={index}
                      onGenerate={() => onGenerateSection(section.id)}
                      isGenerating={activeMutationKey === section.id}
                      isAnythingGenerating={isAnythingGenerating}
                      hasCredits={hasCreditsForSingleSection}
                    />
                  ))}
                </Accordion>
              </SortableContext>
            </DndContext>
          </ScrollArea>
      </CardContent>
    </Card>
  );
};
