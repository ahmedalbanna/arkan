'use client';

import { useState, useCallback } from 'react';
import { toast, useBuilderStore } from '@/hooks';
import { generateRandomId } from '@/infrastructure/utils/randomId';
import { Chapter } from '@/modules/ai-content/domain/entities/Chapter';
import { Section } from '@/modules/ai-content/domain/entities/Section';
import { Project } from '@/modules/projects/domain/entities/Project';

/**
 * useOutlineOperations — Consolidated project mutation logic for the Outline system.
 * Handles structural changes, clipboard operations, and history integration.
 * 
 * DEFENSIVE MEASURES:
 * 1. Existence Guards: Checks for project and updateProject before all mutations.
 * 2. Id Standardization: Replaces uuidv4 with project-standard generateRandomId utility.
 * 3. Error Containment: Wraps complex structural transformations in try-catch blocks.
 * 4. Atomic Updates: Ensures mutations are performed on safe clones within the store callback.
 */

interface OutlineCallbacks {
  onSelectChapter?: (id: string | null) => void;
  onSelectSection?: (id: string | null) => void;
}

export const useOutlineOperations = (project: Project | null, callbacks?: OutlineCallbacks) => {
  const updateProject = useBuilderStore(state => state.updateProject);
  const undo = useBuilderStore(state => state.undo);
  const [clipboard, setClipboard] = useState<{ type: 'chapter' | 'section'; data: any } | null>(null);

  const handleMoveItem = useCallback((activeId: string, overId: string) => {
    if (!project || !updateProject) return;
    try {
      updateProject(p => p.moveContentItem(activeId, overId));
    } catch (error) {
      console.error('[Outline] Move operation failure:', error);
      toast({ title: 'Structural Error', description: 'Failed to reorder document nodes.', variant: 'destructive' });
    }
  }, [project, updateProject]);

  const handleUpdateTitle = useCallback((id: string, newTitle: string, isChapter: boolean) => {
    if (!project || !updateProject || !newTitle.trim()) return;

    try {
      if (isChapter) {
        updateProject(p => p.updateChapter(id, c => c.withProps({ title: newTitle.trim() })));
      } else {
        updateProject(p => p.updateSection(id, s => s.withProps({ title: newTitle.trim() })));
      }
    } catch (error) {
      console.error('[Outline] Title update failure:', error);
    }
  }, [project, updateProject]);

  const handleDeleteItem = useCallback((id: string, isChapter: boolean) => {
    if (!project || !updateProject) return;

    try {
      if (isChapter) {
        updateProject(p => p.removeChapter(id));
        callbacks?.onSelectChapter?.(null);
      } else {
        const info = project.findSection(id);
        if (info) {
          updateProject(p => p.updateChapter(info.chapter.id, c => c.removeSection(id)));
          callbacks?.onSelectSection?.(null);
        }
      }
    } catch (error) {
      console.error('[Outline] Deletion failure:', error);
      toast({ title: 'System Error', description: 'Failed to remove document node.', variant: 'destructive' });
    }
  }, [project, updateProject, callbacks]);

  const handleAddChapter = useCallback((title = "New Chapter") => {
    if (!updateProject) return;
    try {
      updateProject(p => p.addChapter(generateRandomId(), title));
    } catch (error) {
      console.error('[Outline] Chapter creation failure:', error);
    }
  }, [updateProject]);

  const handleAddSection = useCallback((chapterId: string, title = "New Section") => {
    if (!updateProject) return;
    try {
      updateProject(p => p.addSectionToChapter(chapterId, generateRandomId(), title));
    } catch (error) {
      console.error('[Outline] Section creation failure:', error);
    }
  }, [updateProject]);

  const handleDuplicateItem = useCallback((id: string, isChapter: boolean) => {
    if (!project || !updateProject) return;

    try {
      updateProject(p => (isChapter ? p.duplicateChapter(id, generateRandomId) : p.duplicateSection(id, generateRandomId)));
      toast({ title: 'Node Duplicated', description: `Successfully replicated ${isChapter ? 'chapter' : 'section'}.` });
    } catch (error) {
      console.error('[Outline] Duplication failure:', error);
      toast({ title: 'System Error', description: 'Failed to duplicate node.', variant: 'destructive' });
    }
  }, [project, updateProject]);

  const handleCopyItem = useCallback((id: string, isChapter: boolean) => {
    if (!project) return;

    try {
      if (isChapter) {
        const chapter = project.getChapter(id);
        if (chapter) setClipboard({ type: 'chapter', data: chapter.toProperties() });
      } else {
        const info = project.findSection(id);
        if (info) setClipboard({ type: 'section', data: info.section.toProperties() });
      }
      toast({ title: 'Copied', description: 'Item copied to outline clipboard.' });
    } catch (error) {
      console.error('[Outline] Copy failure:', error);
    }
  }, [project]);

  const handlePasteItem = useCallback((targetId: string, targetIsChapter: boolean) => {
    if (!clipboard || !project || !updateProject) return;

    try {
      updateProject(p => {
        if (!p) return p;
        const newId = generateRandomId();

        if (clipboard.type === 'chapter') {
          const newChapterProps = {
            ...clipboard.data,
            id: newId,
            title: `${clipboard.data.title} (Copy)`,
          };
          if (newChapterProps.sections) {
            newChapterProps.sections = newChapterProps.sections.map((s: any) => ({ ...s, id: generateRandomId() }));
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
    } catch (error) {
      console.error('[Outline] Paste failure:', error);
      toast({ title: 'System Error', description: 'Failed to paste node.', variant: 'destructive' });
    }
  }, [clipboard, project, updateProject]);

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
