'use client';

import { useBuilderPageLogic } from '@/modules/projects/adapters/hooks/use-builder-page';
import { useLocalization } from '@/context/LocalizationContext';
import { useMobile } from '@/hooks/util/use-mobile';
import React, { useState, useMemo, lazy, useEffect } from 'react';
import { Settings, UploadCloud, LayoutTemplate, BookOpenCheck, SlidersHorizontal, MessageSquare, Sparkles } from 'lucide-react';
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

import { type ProjectProperties } from '@/modules/projects/domain/entities/Project';

export function useReportGenerator(initialProject?: ProjectProperties | null) {
  const { t, locale } = useLocalization();
  const isMobile = useMobile();
  const [activeMobileView, setActiveMobileView] = useState<'generator' | 'result'>('result');
  const [activePanelKey, setActivePanelKey] = useState('settings');
  const [activeRightPanelKey, setActiveRightPanelKey] = useState('section');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const { isSaving } = useSaveProject();
  const builderPageLogic = useBuilderPageLogic(initialProject);

  useEffect(() => {
    document.documentElement.style.setProperty('--zoom-scale', String(zoomLevel));
    return () => {
      document.documentElement.style.removeProperty('--zoom-scale');
    };
  }, [zoomLevel]);

  // Auto-switch to generation tools if a section or chapter is activated
  useEffect(() => {
    if (activeSectionId || activeChapterId) {
      setActivePanelKey('generate');
      setActiveRightPanelKey('section');
    }
  }, [activeSectionId, activeChapterId]);

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
          activeSectionId,
          onActiveSectionChange: (id) => {
            setActiveSectionId(id);
            if (id) setActiveChapterId(null);
          },
          onActiveChapterChange: (id) => {
            setActiveChapterId(id);
            if (id) setActiveSectionId(null);
          },
        }),
    },
  ], [t, activeSectionId, activeChapterId]);

  const rightPanels = useMemo(() => {
    const activeSection = activeSectionId ? builderPageLogic.project?.getSection(activeSectionId) ?? null : null;
    const activeChapter = activeChapterId ? builderPageLogic.project?.getChapter(activeChapterId) ?? null : null;
    
    return [
      {
          key: 'section',
          title: activeChapterId ? 'Chapter Tools' : 'Section Controls',
          icon: React.createElement(Sparkles, { className: "h-5 w-5" }),
          content: activeChapterId 
            ? React.createElement(ChapterTabsPanel, { chapter: activeChapter })
            : React.createElement(SectionTabsPanel, { section: activeSection }),
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
    ];
  }, [activeSectionId, activeChapterId, builderPageLogic.project]);

  return {
    ...builderPageLogic,
    isMobile,
    activeMobileView,
    setActiveMobileView,
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
    activeSectionId,
    setActiveSectionId,
    activeChapterId,
    setActiveChapterId,
  };
}
