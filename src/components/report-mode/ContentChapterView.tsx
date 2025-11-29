
'use client';

import A4Page from '@/components/shared/A4Page';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocalization } from '@/context/LocalizationContext';
import { Chapter, Section } from '@/lib/models';
import { PlusCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { SectionView } from './SectionView';

interface ContentChapterViewProps {
  chapter: Chapter;
  onUpdateSection: (sectionId: string, newContent: string) => void;
  onUpdateSectionTitle: (sectionId: string, newTitle: string) => void;
  onUpdateChapterTitle: (chapterId: string, newTitle: string) => void;
  onAddSection: (chapterId: string, index: number) => void;
  onMoveSectionUp: (sectionId: string) => void;
  onMoveSectionDown: (sectionId: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onDeleteChapter: (chapterId: string) => void;
}

export function ContentChapterView({
  chapter,
  onUpdateSection,
  onUpdateSectionTitle,
  onUpdateChapterTitle,
  onAddSection,
  onMoveSectionUp,
  onMoveSectionDown,
  onDeleteSection,
  onDeleteChapter,
}: ContentChapterViewProps) {
  const { t } = useLocalization();
  const [editedChapterTitle, setEditedChapterTitle] = useState(chapter.title);

  useEffect(() => {
    setEditedChapterTitle(chapter.title);
  }, [chapter.title]);

  const handleChapterTitleSave = () => {
    if (editedChapterTitle.trim() && editedChapterTitle !== chapter.title) {
      onUpdateChapterTitle(chapter.id, editedChapterTitle.trim());
    }
  };

  const handleChapterTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      e.currentTarget.blur();
    }
  };

  const hasSections = chapter.sections && chapter.sections.length > 0;

  return (
    <A4Page key={chapter.id} onDelete={() => onDeleteChapter(chapter.id)}>
      <Input
        value={editedChapterTitle}
        onChange={(e) => setEditedChapterTitle(e.target.value)}
        onBlur={handleChapterTitleSave}
        onKeyDown={handleChapterTitleKeyDown}
        className="w-full text-3xl font-bold text-primary font-headline border-0 focus-visible:ring-1 focus-visible:ring-offset-0 p-1 h-auto bg-transparent mb-6"
      />
      {hasSections ? (
        chapter.sections.map((section, index) => (
          <div key={section.id} className="group relative mb-8 last:mb-0">
            <SectionView
              chapterId={chapter.id}
              sectionKey={section.id}
              title={section.title}
              content={section.content || ''}
              onUpdate={onUpdateSection}
              onTitleChange={onUpdateSectionTitle}
              isFirst={index === 0}
              isLast={index === chapter.sections.length - 1}
              onMoveUp={() => onMoveSectionUp(section.id)}
              onMoveDown={() => onMoveSectionDown(section.id)}
              onDelete={() => onDeleteSection(section.id)}
            />
            <div className="absolute -bottom-4 left-0 right-0 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-full h-px bg-primary/20"></div>
              <Button
                variant="outline"
                size="icon"
                className="absolute h-8 w-8 rounded-full bg-background hover:bg-muted"
                onClick={() => onAddSection(chapter.id, index + 1)}
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
          <h3 className="mt-4 text-lg font-semibold text-muted-foreground">This chapter is empty.</h3>
          <p className="text-sm text-muted-foreground mb-4">Add a section to start building your report.</p>
          <Button onClick={() => onAddSection(chapter.id, 0)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add First Section
          </Button>
        </div>
      )}
    </A4Page>
  );
}
