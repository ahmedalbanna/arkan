'use client';

import React, { useMemo, lazy } from 'react';
import { Settings, UploadCloud, LayoutTemplate, BookOpenCheck, SlidersHorizontal, MessageSquare, Sparkles, History as HistoryIcon } from 'lucide-react';
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
            icon: <Settings className="h-5 w-5" />,
            content: <ProjectSettingsPanel />,
        },
        {
            key: 'files',
            title: t('builder.tabs.files'),
            icon: <UploadCloud className="h-5 w-5" />,
            content: <FileManager />,
        },
        {
            key: 'templates',
            title: 'Apply Template',
            icon: <LayoutTemplate className="h-5 w-5" />,
            content: <ApplyTemplatePanel />,
        },
        {
            key: 'generate',
            title: 'Neural Architect',
            icon: <BookOpenCheck className="h-5 w-5" />,
            content: (
                <GenerationTools
                    selectedSectionIds={selectedSectionIds}
                    onActiveSectionChange={onActiveSectionChange}
                    onActiveChapterChange={onActiveChapterChange}
                    activeChapterId={activeChapterId}
                />
            ),
        },
    ], [t, selectedSectionIds, activeChapterId, onActiveSectionChange, onActiveChapterChange]);

    const rightPanels = useMemo<SidebarPanelConfig[]>(() => {
        const activeSectionId = selectedSectionIds.length > 0 ? selectedSectionIds[0] : null;
        const activeSection = activeSectionId ? project?.getSection(activeSectionId) ?? null : null;
        const activeChapter = activeChapterId ? project?.getChapter(activeChapterId) ?? null : null;

        return [
            {
                key: 'section',
                title: activeChapterId ? 'Chapter Tools' : selectedSectionIds.length > 1 ? 'Bulk Editor' : 'Section Controls',
                icon: <Sparkles className="h-5 w-5" />,
                content: activeChapterId
                    ? <ChapterTabsPanel chapter={activeChapter} />
                    : <SectionTabsPanel
                        section={activeSection}
                        selectedSectionIds={selectedSectionIds.length > 1 ? selectedSectionIds : undefined}
                    />,
            },
            {
                key: 'global',
                title: 'Global Controls',
                icon: <SlidersHorizontal className="h-5 w-5" />,
                content: <GlobalProjectControls />,
            },
            {
                key: 'chat',
                title: 'AI Consultant',
                icon: <MessageSquare className="h-5 w-5" />,
                content: <ProjectChat isOpen={true} onClose={() => setActiveRightPanelKey('section')} />,
            },
            {
                key: 'snapshots',
                title: 'Snapshots',
                icon: <HistoryIcon className="h-5 w-5" />,
                content: <SnapshotHistoryPanel />,
            },
        ];
    }, [project, selectedSectionIds, activeChapterId, setActiveRightPanelKey]);

    return { leftPanels, rightPanels };
}
