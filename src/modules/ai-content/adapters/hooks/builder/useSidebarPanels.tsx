'use client';

import React, { useMemo, lazy } from 'react';
import { 
    Settings, 
    LayoutTemplate, 
    SlidersHorizontal, 
    MessageSquare, 
    History as HistoryIcon, 
    Layers, 
    FileText,
    Terminal
} from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';
import { SidebarPanelConfig } from '@/modules/ai-content/adapters/components/builder/layout/types';

/**
 * useSidebarPanels — Primary panel registration hook for the Builder workspace.
 * Manages the dynamic configuration of left and right HUD panels.
 */

// Modular HUD Components — Lazy loaded for performance
const ProjectSettingsHUD = lazy(() => import('@/modules/ai-content/adapters/components/builder/settings/ProjectSettingsHUD').then(m => ({ default: m.ProjectSettingsHUD })));
const ApplyTemplatePanel = lazy(() => import('@/modules/ai-content/adapters/components/report-mode/templates/ApplyTemplatePanel'));
const GlobalIntelligenceHUD = lazy(() => import('@/modules/ai-content/adapters/components/builder/settings/GlobalIntelligenceHUD').then(m => ({ default: m.GlobalIntelligenceHUD })));
const SectionGenerationHUD = lazy(() => import('@/modules/ai-content/adapters/components/builder/generation/SectionGenerationHUD').then(m => ({ default: m.SectionGenerationHUD })));
const ChapterGenerationHUD = lazy(() => import('@/modules/ai-content/adapters/components/builder/generation/ChapterGenerationHUD').then(m => ({ default: m.ChapterGenerationHUD })));
const ProjectChat = lazy(() => import('@/modules/ai-content/adapters/components/report-mode/chat/ProjectChat').then(m => ({ default: m.ProjectChat })));
const SnapshotHistoryPanel = lazy(() => import('@/modules/projects/adapters/components/SnapshotHistoryPanel'));
const SidebarNavigator = lazy(() => import('@/modules/ai-content/adapters/components/builder/SidebarNavigator').then(m => ({ default: m.SidebarNavigator })));
const GenerationNavigator = lazy(() => import('@/modules/ai-content/adapters/components/builder/generation/GenerationNavigator').then(m => ({ default: m.GenerationNavigator })));
const UploadManager = lazy(() => import('@/modules/ai-content/adapters/components/builder/file-manager/UploadManager').then(m => ({ default: m.UploadManager })));

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

    // Setup Utility Panels (Left Sidebar)
    const leftPanels = useMemo<SidebarPanelConfig[]>(() => [
        {
            key: 'settings',
            title: 'Metadata Manifest',
            icon: <Settings className="h-4 w-4" />,
            content: <ProjectSettingsHUD />,
        },
        {
            key: 'templates',
            title: 'Layout Blueprint',
            icon: <LayoutTemplate className="h-4 w-4" />,
            content: <ApplyTemplatePanel />,
        },
        {
            key: 'navigator',
            title: 'Architecture',
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

    // AI & Intelligence Panels (Right Sidebar)
    const rightPanels = useMemo<SidebarPanelConfig[]>(() => {
        const activeSectionId = selectedSectionIds.length > 0 ? selectedSectionIds[0] : null;
        const activeSection = activeSectionId ? project?.getSection(activeSectionId) ?? null : null;
        const activeChapter = activeChapterId ? project?.getChapter(activeChapterId) ?? null : null;

        const sectionTitle = activeChapterId
            ? 'Chapter Neural Core'
            : selectedSectionIds.length > 1
                ? 'Cluster Synthesis'
                : 'Section Synthesis';

        return [
            {
                key: 'generate',
                title: 'AI Production',
                icon: <Terminal className="h-4 w-4" />,
                content: (
                    <GenerationNavigator
                        selectedSectionIds={selectedSectionIds}
                        onActiveSectionChange={onActiveSectionChange}
                        onActiveChapterChange={onActiveChapterChange}
                        activeChapterId={activeChapterId}
                    />
                ),
            },
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
                title: 'Temporal Snapshots',
                icon: <HistoryIcon className="h-4 w-4" />,
                content: <SnapshotHistoryPanel />,
            },
        ];
    }, [project, selectedSectionIds, activeChapterId, setActiveRightPanelKey, onActiveSectionChange, onActiveChapterChange]);

    return { leftPanels, rightPanels };
}
