'use client';

import { useBuilderPageLogic } from '@/modules/projects/adapters/hooks/use-builder-page';
import { useLocalization } from '@/context/LocalizationContext';
import React, { useState, useMemo, lazy, useEffect } from 'react';
import { Settings, UploadCloud, LayoutTemplate, BookOpenCheck, SlidersHorizontal, MessageSquare, Sparkles, History as HistoryIcon } from 'lucide-react';
import { useSaveProject } from '@/modules/projects/adapters/hooks/use-projects';
// Lazy load components
const ProjectSettingsPanel = lazy(() => import('@/modules/ai-content/adapters/components/report-mode/settings/ProjectSettingsPanel'));
const FileManager = lazy(() => import('@/modules/ai-content/adapters/components/report-mode/file-manager'));
const GenerationTools = lazy(() => import('@/modules/ai-content/adapters/components/report-mode/generation-tools'));
const ApplyTemplatePanel = lazy(() => import('@/modules/ai-content/adapters/components/report-mode/templates/ApplyTemplatePanel'));
const GlobalProjectControls = lazy(() => import('@/modules/ai-content/adapters/components/report-mode/settings/GlobalProjectControls').then(m => ({ default: m.GlobalProjectControls })));
const SectionTabsPanel = lazy(() => import('@/modules/ai-content/adapters/components/report-mode/generation-tools/SectionTabsPanel').then(m => ({ default: m.SectionTabsPanel })));
const ChapterTabsPanel = lazy(() => import('@/modules/ai-content/adapters/components/report-mode/generation-tools/ChapterTabsPanel').then(m => ({ default: m.ChapterTabsPanel })));
const ProjectChat = lazy(() => import('@/modules/ai-content/adapters/components/report-mode/chat/ProjectChat').then(m => ({ default: m.ProjectChat })));
const SnapshotHistoryPanel = lazy(() => import('@/modules/projects/adapters/components/SnapshotHistoryPanel'));

import { type ProjectProperties } from '@/modules/projects/domain/entities/Project';

export function useReportGenerator(initialProject?: ProjectProperties | null) {
  const { t, locale } = useLocalization();
  const [activePanelKey, setActivePanelKey] = useState('settings');
  const [activeRightPanelKey, setActiveRightPanelKey] = useState('section');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>([]);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [isOutlineVisible, setIsOutlineVisible] = useState(false);
  const { isSaving } = useSaveProject();
  const builderPageLogic = useBuilderPageLogic(initialProject);

  const activeSectionId = selectedSectionIds.length > 0 ? selectedSectionIds[0] : null;

  useEffect(() => {
    document.documentElement.style.setProperty('--zoom-scale', String(zoomLevel));
    return () => {
      document.documentElement.style.removeProperty('--zoom-scale');
    };
  }, [zoomLevel]);

  // Auto-switch to generation tools if a section or chapter is activated
  useEffect(() => {
    if (selectedSectionIds.length > 0 || activeChapterId) {
      setActivePanelKey('generate');
      setActiveRightPanelKey('section');
    }
  }, [selectedSectionIds, activeChapterId]);

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

  const leftPanels = useMemo(() => [
    {
        key: 'settings',
        title: 'Project Settings',
        icon: React.createElement(Settings, { className: "h-5 w-5" }),
        content: React.createElement(ProjectSettingsPanel),
    },
    {
        key: 'files',
        title: t('builder.tabs.files'),
        icon: React.createElement(UploadCloud, { className: "h-5 w-5" }),
        content: React.createElement(FileManager),
    },
    {
        key: 'templates',
        title: 'Apply Template',
        icon: React.createElement(LayoutTemplate, { className: "h-5 w-5" }),
        content: React.createElement(ApplyTemplatePanel),
    },
    {
        key: 'generate',
        title: t('builder.reportGenerator.toolsTitle'),
        icon: React.createElement(BookOpenCheck, { className: "h-5 w-5" }),
        content: React.createElement(GenerationTools, {
          selectedSectionIds,
          onActiveSectionChange: handleActiveSectionChange,
          onActiveChapterChange: (id) => {
            setActiveChapterId(id);
            if (id) setSelectedSectionIds([]);
          },
          activeChapterId,
        }),
    },
  ], [t, selectedSectionIds, activeChapterId]);

  const rightPanels = useMemo(() => {
    const activeSection = activeSectionId ? builderPageLogic.project?.getSection(activeSectionId) ?? null : null;
    const activeChapter = activeChapterId ? builderPageLogic.project?.getChapter(activeChapterId) ?? null : null;
    
    return [
      {
          key: 'section',
          title: activeChapterId ? 'Chapter Tools' : selectedSectionIds.length > 1 ? 'Bulk Editor' : 'Section Controls',
          icon: React.createElement(Sparkles, { className: "h-5 w-5" }),
          content: activeChapterId 
            ? React.createElement(ChapterTabsPanel, { chapter: activeChapter })
            : React.createElement(SectionTabsPanel, { 
                section: activeSection,
                selectedSectionIds: selectedSectionIds.length > 1 ? selectedSectionIds : undefined 
              }),
      },
      {
          key: 'global',
          title: 'Global Controls',
          icon: React.createElement(SlidersHorizontal, { className: "h-5 w-5" }),
          content: React.createElement(GlobalProjectControls),
      },
      {
          key: 'chat',
          title: 'AI Consultant',
          icon: React.createElement(MessageSquare, { className: "h-5 w-5" }),
          content: React.createElement(ProjectChat, { isOpen: true, onClose: () => setActiveRightPanelKey('section') }),
      },
      {
          key: 'snapshots',
          title: 'Snapshots',
          icon: React.createElement(HistoryIcon, { className: "h-5 w-5" }),
          content: React.createElement(SnapshotHistoryPanel),
      },
    ];
  }, [activeSectionId, activeChapterId, selectedSectionIds, builderPageLogic.project]);

  return {
    ...builderPageLogic,
    activePanelKey,
    setActivePanelKey,
    activeRightPanelKey,
    setActiveRightPanelKey,
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
    handleActiveSectionChange,
    activeChapterId,
    setActiveChapterId,
    isOutlineVisible,
    setIsOutlineVisible,
  };
}
