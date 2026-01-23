
'use client';

import { useBuilderPageLogic } from '@/hooks/core/use-builder-page';
import { useLocalization } from '@/context/LocalizationContext';
import { useMobile } from '@/hooks/util/use-mobile';
import React, { useState, useMemo, lazy, useEffect } from 'react';
import { Settings, UploadCloud, LayoutTemplate, BookOpenCheck } from 'lucide-react';
import { useSaveProject } from '@/hooks/data/use-projects';
// Lazy load components
const ProjectSettingsPanel = lazy(() => import('@/components/report-mode/settings/ProjectSettingsPanel'));
const FileManager = lazy(() => import('@/components/report-mode/file-manager'));
const GenerationTools = lazy(() => import('@/components/report-mode/generation-tools'));
const ApplyTemplatePanel = lazy(() => import('@/components/report-mode/templates/ApplyTemplatePanel'));

export function useReportGenerator() {
  const { t, locale } = useLocalization();
  const isMobile = useMobile();
  const [activeMobileView, setActiveMobileView] = useState<'generator' | 'result'>('result');
  const [activePanelKey, setActivePanelKey] = useState('settings');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const { isSaving } = useSaveProject();
  const builderPageLogic = useBuilderPageLogic();

  useEffect(() => {
    document.documentElement.style.setProperty('--zoom-scale', String(zoomLevel));
    return () => {
      document.documentElement.style.removeProperty('--zoom-scale');
    };
  }, [zoomLevel]);

  // Handler functions for floating controls
  const handleComplexityChange = (value: number) => {
    builderPageLogic.updateProject(p => p.with({ complexity: value }));
  };

  const handleFormalityChange = (value: number) => {
    builderPageLogic.updateProject(p => p.with({ formality: value }));
  };

  const handleLanguageChange = (value: string) => {
    builderPageLogic.updateProject(p => p.with({ language: value as any }));
  };

  const handleToneChange = (value: string) => {
    builderPageLogic.updateProject(p => p.with({ tone: value as any }));
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  };

  const panels = useMemo(() => [
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
        content: React.createElement(GenerationTools),
    },
  ], [t]);

  return {
    ...builderPageLogic,
    isMobile,
    activeMobileView,
    setActiveMobileView,
    activePanelKey,
    setActivePanelKey,
    isSaving,
    panels,
    t,
    locale,
    isChatOpen,
    setIsChatOpen,
    zoomLevel,
    setZoomLevel,
    handleComplexityChange,
    handleFormalityChange,
    handleLanguageChange,
    handleToneChange,
    handleZoomIn,
    handleZoomOut,
  };
}
