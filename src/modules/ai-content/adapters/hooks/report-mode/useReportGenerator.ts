'use client';

import { useBuilderPageLogic } from '@/modules/projects/adapters/hooks/use-builder-page';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore } from '@/modules/projects/adapters/state/useBuilderStore';
import React, { useState, useMemo, lazy, useEffect } from 'react';
import { useSaveProject } from '@/modules/projects/adapters/hooks/use-projects';
import { useSidebarPanels } from './useSidebarPanels';

import { type ProjectProperties } from '@/modules/projects/domain/entities/Project';

export function useReportGenerator(initialProject?: ProjectProperties | null) {
  const { t, locale } = useLocalization();
  const [activePanelKey, setActivePanelKey] = useState<string>('files');
  const [activeRightPanelKey, setActiveRightPanelKey] = useState<string>('section');

  const isLeftPanelVisible = !!activePanelKey;
  const isRightPanelVisible = !!activeRightPanelKey;
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>([]);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [isOutlineVisible, setIsOutlineVisible] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const { isSaving } = useSaveProject();
  const builderPageLogic = useBuilderPageLogic(initialProject);
  const project = useBuilderStore(state => state.project);

  useEffect(() => {
    document.documentElement.style.setProperty('--zoom-scale', String(zoomLevel));
    return () => {
      document.documentElement.style.removeProperty('--zoom-scale');
    };
  }, [zoomLevel]);

  const handleActiveSectionChange = (id: string | null, multiSelect?: boolean) => {
    if (multiSelect && id) {
      setSelectedSectionIds(prev => {
        if (prev.includes(id)) {
          return prev.filter(sid => sid !== id);
        } else {
          return [...prev, id];
        }
      });
      setActiveChapterId(null);
    } else {
      setSelectedSectionIds(id ? [id] : []);
      if (id) setActiveChapterId(null);
    }
  };

  const handleActiveChapterChange = (id: string | null) => {
    setActiveChapterId(id);
    if (id) {
        const chapter = builderPageLogic.project?.getChapter(id);
        if (chapter) {
            setSelectedSectionIds(chapter.sections.map(s => s.id));
        } else {
            setSelectedSectionIds([]);
        }
    }
  };

  const { leftPanels, rightPanels } = useSidebarPanels({
    project: builderPageLogic.project,
    selectedSectionIds,
    activeChapterId,
    onActiveSectionChange: handleActiveSectionChange,
    onActiveChapterChange: handleActiveChapterChange,
    setActiveRightPanelKey,
  });

  const handleMoveItem = (activeId: string, overId: string) => {
    updateProject(p => p.moveItem(activeId, overId));
  };

  const handleUpdateTitle = (id: string, newTitle: string, isChapter: boolean) => {
    updateProject(p => p.updateItemTitle(id, newTitle, isChapter));
  };

  const handleDeleteItem = (id: string, isChapter: boolean) => {
    updateProject(p => p.deleteItem(id, isChapter));
  };

  const handleAddChapter = () => {
    updateProject(p => p.addChapter());
  };

  const handleAddSection = (chapterId: string) => {
    updateProject(p => p.addSection(chapterId));
  };

  const handleDuplicateItem = (id: string, isChapter: boolean) => {
    updateProject(p => p.duplicateItem(id, isChapter));
  };

  const handleUndo = () => {
    useBuilderStore.getState().undo();
  };

  const handleCopyItem = (id: string, isChapter: boolean) => {
    // Implement local storage or state based copy
    localStorage.setItem('arkan_copied_item', JSON.stringify({ id, isChapter }));
  };

  const handlePasteItem = (targetId: string, isChapter: boolean) => {
    const copied = localStorage.getItem('arkan_copied_item');
    if (copied) {
        const { id, isChapter: copiedIsChapter } = JSON.parse(copied);
        updateProject(p => p.pasteItem(id, copiedIsChapter, targetId, isChapter));
    }
  };

  return {
    ...builderPageLogic,
    activePanelKey,
    setActivePanelKey,
    activeRightPanelKey,
    setActiveRightPanelKey,
    isLeftPanelVisible,
    isRightPanelVisible,
    isSaving,
    leftPanels,
    rightPanels,
    t,
    locale,
    isChatOpen,
    setIsChatOpen,
    zoomLevel,
    setZoomLevel,
    selectedSectionIds,
    setSelectedSectionIds,
    handleActiveSectionChange,
    activeChapterId,
    setActiveChapterId,
    isOutlineVisible,
    setIsOutlineVisible,
    viewMode,
    setViewMode,
    handleMoveItem,
    handleUpdateTitle,
    handleDeleteItem,
    handleAddChapter,
    handleAddSection,
    handleDuplicateItem,
    handleUndo,
    handleCopyItem,
    handlePasteItem
  };
}
