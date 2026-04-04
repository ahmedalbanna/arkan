'use client';

import React, { useMemo, lazy } from 'react';
import { Settings, LayoutTemplate, SlidersHorizontal, MessageSquare, History as HistoryIcon, Layers, FileText } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';
import { SidebarPanelConfig } from '@/modules/ai-content/adapters/components/builder/layout/types';

// Lazy load components
const ProjectSettingsHUD = lazy(() => import('@/modules/ai-content/adapters/components/builder/settings/ProjectSettingsHUD').then(m => ({ default: m.ProjectSettingsHUD })));
const ApplyTemplatePanel = lazy(() => import('@/modules/ai-content/adapters/components/report-mode/templates/ApplyTemplatePanel'));
const GlobalIntelligenceHUD = lazy(() => import('@/modules/ai-content/adapters/components/builder/settings/GlobalIntelligenceHUD').then(m => ({ default: m.GlobalIntelligenceHUD })));
const SectionGenerationHUD = lazy(() => import('@/modules/ai-content/adapters/components/builder/generation/SectionGenerationHUD').then(m => ({ default: m.SectionGenerationHUD })));
const ChapterGenerationHUD = lazy(() => import('@/modules/ai-content/adapters/components/builder/generation/ChapterGenerationHUD').then(m => ({ default: m.ChapterGenerationHUD })));
const ProjectChat = lazy(() => import('@/modules/ai-content/adapters/components/report-mode/chat/ProjectChat').then(m => ({ default: m.ProjectChat })));
const SnapshotHistoryPanel = lazy(() => import('@/modules/projects/adapters/components/SnapshotHistoryPanel'));
const SidebarNavigator = lazy(() => import('@/modules/ai-content/adapters/components/builder/SidebarNavigator').then(m => ({ default: m.SidebarNavigator })));

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
            title: 'Metadata Manifest',
            icon: <Settings className="h-4 w-4" />,
            content: <ProjectSettingsHUD />,
        },
        {
            key: 'templates',
            title: 'Templates',
            icon: <LayoutTemplate className="h-4 w-4" />,
            content: <ApplyTemplatePanel />,
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
                    ? <ChapterGenerationHUD chapter={activeChapter} />
                    : <SectionGenerationHUD
                        section={activeSection}
                        selectedSectionIds={selectedSectionIds.length > 1 ? selectedSectionIds : undefined}
                    />,
            },
            {
                key: 'global',
                title: 'Intelligence Matrix',
                icon: <SlidersHorizontal className="h-4 w-4" />,
                content: <GlobalIntelligenceHUD />,
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
