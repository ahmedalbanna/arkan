'use client';

import React, { useMemo, lazy } from 'react';
import { Settings, LayoutTemplate, SlidersHorizontal, MessageSquare, History as HistoryIcon, Database, Terminal, Layers, FileText } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';
import { SidebarPanelConfig } from '@/modules/ai-content/adapters/components/report-mode/layout/types';

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
const SidebarNavigator = lazy(() => import('@/modules/ai-content/adapters/components/report-mode/SidebarNavigator').then(m => ({ default: m.SidebarNavigator })));

interface UseSidebarPanelsProps {
    project: any;
    selectedSectionIds: string[];
    activeChapterId: string | null;
    onActiveSectionChange: (id: string | null, multiSelect?: boolean) => void;
    onActiveChapterChange: (id: string | null) => void;
    setActiveRightPanelKey: (key: string) => void;
}

export function useSidebarPanels({
    project,
    selectedSectionIds,
    activeChapterId,
    onActiveSectionChange,
    onActiveChapterChange,
    setActiveRightPanelKey
}: UseSidebarPanelsProps) {
    const { t } = useLocalization();

    const leftPanels = useMemo<SidebarPanelConfig[]>(() => [
        {
            key: 'settings',
            title: 'Project Settings',
            icon: <Settings className="h-4 w-4" />,
            content: <ProjectSettingsPanel />,
        },
        {
            key: 'files',
            title: 'Files',
            icon: <Database className="h-4 w-4" />,
            content: <FileManager />,
        },
        {
            key: 'templates',
            title: 'Templates',
            icon: <LayoutTemplate className="h-4 w-4" />,
            content: <ApplyTemplatePanel />,
        },
        {
            key: 'generate',
            title: 'Generation Tools',
            icon: <Terminal className="h-4 w-4" />,
            content: (
                <GenerationTools
                    selectedSectionIds={selectedSectionIds}
                    onActiveSectionChange={onActiveSectionChange}
                    onActiveChapterChange={onActiveChapterChange}
                    activeChapterId={activeChapterId}
                />
            ),
        },
        {
            key: 'navigator',
            title: 'Navigator',
            icon: <Layers className="h-4 w-4" />,
            content: (
                <SidebarNavigator
                    activeChapterId={activeChapterId}
                    selectedSectionIds={selectedSectionIds}
                    onActiveChapterChange={onActiveChapterChange}
                    onActiveSectionChange={onActiveSectionChange}
                />
            ),
        },
    ], [selectedSectionIds, activeChapterId, onActiveSectionChange, onActiveChapterChange]);

    const rightPanels = useMemo<SidebarPanelConfig[]>(() => {
        const activeSectionId = selectedSectionIds.length > 0 ? selectedSectionIds[0] : null;
        const activeSection = activeSectionId ? project?.getSection(activeSectionId) ?? null : null;
        const activeChapter = activeChapterId ? project?.getChapter(activeChapterId) ?? null : null;

        const sectionTitle = activeChapterId 
            ? 'Chapter Tools' 
            : selectedSectionIds.length > 1 
                ? 'Bulk Edit' 
                : 'Section Tools';

        return [
            {
                key: 'section',
                title: sectionTitle,
                icon: <FileText className="h-4 w-4" />,
                content: activeChapterId
                    ? <ChapterTabsPanel chapter={activeChapter} />
                    : <SectionTabsPanel
                        section={activeSection}
                        selectedSectionIds={selectedSectionIds.length > 1 ? selectedSectionIds : undefined}
                    />,
            },
            {
                key: 'global',
                title: 'Global Settings',
                icon: <SlidersHorizontal className="h-4 w-4" />,
                content: <GlobalProjectControls />,
            },
            {
                key: 'chat',
                title: 'Project Consultant',
                icon: <MessageSquare className="h-4 w-4" />,
                content: <ProjectChat isOpen={true} onClose={() => setActiveRightPanelKey('section')} />,
            },
            {
                key: 'snapshots',
                title: 'Snapshots',
                icon: <HistoryIcon className="h-4 w-4" />,
                content: <SnapshotHistoryPanel />,
            },
        ];
    }, [project, selectedSectionIds, activeChapterId, setActiveRightPanelKey]);

    return { leftPanels, rightPanels };
}
