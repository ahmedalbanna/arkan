'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast, useBuilderStore } from '@/hooks';
import { Chapter } from '@/modules/ai-content/domain/entities/Chapter';
import { Section } from '@/modules/ai-content/domain/entities/Section';
import { Project } from '@/modules/projects/domain/entities/Project';

/**
 * useOutlineOperations — Consolidated project mutation logic for the Outline system.
 * Handles structural changes, clipboard operations, and history integration.
 */

export const useOutlineOperations = (project: Project | null) => {
  const updateProject = useBuilderStore(state => state.updateProject);
  const undo = useBuilderStore(state => state.undo);
  const [clipboard, setClipboard] = useState<{ type: 'chapter' | 'section'; data: any } | null>(null);

  const handleMoveItem = (activeId: string, overId: string) => {
    updateProject(p => p.moveContentItem(activeId, overId));
  };

  const handleUpdateTitle = (id: string, newTitle: string, isChapter: boolean) => {
    if (isChapter) {
      updateProject(p => p.updateChapter(id, c => c.withProps({ title: newTitle })));
    } else {
      updateProject(p => p.updateSection(id, s => s.withProps({ title: newTitle })));
    }
  };

  const handleDeleteItem = (id: string, isChapter: boolean) => {
    if (isChapter) {
      updateProject(p => p.removeChapter(id));
    } else {
      const info = project?.findSection(id);
      if (info) {
        updateProject(p => p.updateChapter(info.chapter.id, c => c.removeSection(id)));
      }
    }
  };

  const handleAddChapter = (title = "New Chapter") => {
    updateProject(p => p.addChapter(uuidv4(), title));
  };

  const handleAddSection = (chapterId: string, title = "New Section") => {
    updateProject(p => p.addSectionToChapter(chapterId, uuidv4(), title));
  };

  const handleDuplicateItem = (id: string, isChapter: boolean) => {
    updateProject(p => (isChapter ? p.duplicateChapter(id, uuidv4) : p.duplicateSection(id, uuidv4)));
  };

  const handleCopyItem = (id: string, isChapter: boolean) => {
    if (!project) return;
    
    if (isChapter) {
      const chapter = project.getChapter(id);
      if (chapter) setClipboard({ type: 'chapter', data: chapter.toProperties() });
    } else {
      const info = project.findSection(id);
      if (info) setClipboard({ type: 'section', data: info.section.toProperties() });
    }
    toast({ title: 'Copied', description: 'Item copied to outline clipboard.' });
  };

  const handlePasteItem = (targetId: string, targetIsChapter: boolean) => {
    if (!clipboard || !project) return;

    updateProject(p => {
      const newId = uuidv4();

      if (clipboard.type === 'chapter') {
        const newChapterProps = {
          ...clipboard.data,
          id: newId,
          title: `${clipboard.data.title} (Copy)`,
        };
        if (newChapterProps.sections) {
          newChapterProps.sections = newChapterProps.sections.map((s: any) => ({ ...s, id: uuidv4() }));
        }
        const newChapter = new Chapter(newChapterProps);

        let insertionIndex = -1;
        if (targetIsChapter) {
          insertionIndex = p.content.findIndex(c => c.id === targetId);
        } else {
          const info = p.findSection(targetId);
          if (info) insertionIndex = p.content.findIndex(c => c.id === info.chapter.id);
        }

        if (insertionIndex !== -1) {
          const newContent = [...p.content];
          newContent.splice(insertionIndex + 1, 0, newChapter);
          return p.withProps({ content: newContent });
        }
      } else if (clipboard.type === 'section') {
        const newSectionProps = {
          ...clipboard.data,
          id: newId,
          title: `${clipboard.data.title} (Copy)`,
        };
        const newSection = new Section(newSectionProps);

        if (targetIsChapter) {
          return p.updateChapter(targetId, c => c.addSection(newSection, 0));
        } else {
          const info = p.findSection(targetId);
          if (info) {
            return p.updateChapter(info.chapter.id, c => c.addSection(newSection, info.sectionIndex + 1));
          }
        }
      }
      return p;
    });
    toast({ title: 'Pasted', description: `Successfully pasted ${clipboard.type}.` });
  };

  return {
    handleMoveItem,
    handleUpdateTitle,
    handleDeleteItem,
    handleAddChapter,
    handleAddSection,
    handleDuplicateItem,
    handleCopyItem,
    handlePasteItem,
    undo,
    clipboard
  };
};
