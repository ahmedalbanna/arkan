'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { useMobile } from '@/hooks/util/use-mobile';
import { SidebarPanelConfig } from '@/modules/ai-content/adapters/components/builder/layout/types';
import {
    FileText,
    History as HistoryIcon,
    Layers,
    LayoutTemplate,
    MessageSquare,
    Settings,
    SlidersHorizontal
} from 'lucide-react';
import { lazy, useEffect, useMemo } from 'react';

// Modular HUD Components — Lazy loaded with prefetch on desktop
const ProjectSettingsHUD = lazy(() => import('@/modules/ai-content/adapters/components/builder/settings/ProjectSettingsHUD').then(m => ({ default: m.ProjectSettingsHUD })));
const TemplateLibraryHUD = lazy(() => import('@/modules/ai-content/adapters/components/builder/templates/TemplateLibraryHUD').then(m => ({ default: m.TemplateLibraryHUD })));
const GlobalIntelligenceHUD = lazy(() => import('@/modules/ai-content/adapters/components/builder/settings/GlobalIntelligenceHUD').then(m => ({ default: m.GlobalIntelligenceHUD })));
const SectionGenerationHUD = lazy(() => import('@/modules/ai-content/adapters/components/builder/generation/SectionGenerationHUD').then(m => ({ default: m.SectionGenerationHUD })));
const ChapterGenerationHUD = lazy(() => import('@/modules/ai-content/adapters/components/builder/generation/ChapterGenerationHUD').then(m => ({ default: m.ChapterGenerationHUD })));
const ProjectConsultantHUD = lazy(() => import('@/modules/ai-content/adapters/components/builder/chat/ProjectConsultantHUD').then(m => ({ default: m.ProjectConsultantHUD })));
const SnapshotHistoryPanel = lazy(() => import('@/modules/projects/adapters/components/SnapshotHistoryPanel'));
const SidebarNavigator = lazy(() => import('@/modules/ai-content/adapters/components/builder/SidebarNavigator').then(m => ({ default: m.SidebarNavigator })));
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
    const isMobile = useMobile();
    const isDesktop = !isMobile;

    // Prefetch critical panels on desktop
    useEffect(() => {
        if (!isDesktop) return;

        // Prefetch commonly used panels
        const prefetchModules = async () => {
            await Promise.all([
                import('@/modules/ai-content/adapters/components/builder/settings/ProjectSettingsHUD'),
                import('@/modules/ai-content/adapters/components/builder/generation/SectionGenerationHUD'),
            ]);
        };

        prefetchModules();
    }, [isDesktop]);

    // Desktop keyboard shortcuts for panel switching
    useEffect(() => {
        if (!isDesktop) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
                switch (e.key) {
                    case '1':
                        e.preventDefault();
                        setActiveRightPanelKey('settings');
                        break;
                    case '2':
                        e.preventDefault();
                        setActiveRightPanelKey('navigator');
                        break;
                    case '3':
                        e.preventDefault();
                        setActiveRightPanelKey('section');
                        break;
                    case '4':
                        e.preventDefault();
                        setActiveRightPanelKey('global');
                        break;
                    case '5':
                        e.preventDefault();
                        setActiveRightPanelKey('chat');
                        break;
                    case '6':
                        e.preventDefault();
                        setActiveRightPanelKey('snapshots');
                        break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isDesktop, setActiveRightPanelKey]);

    const rightPanels = useMemo<SidebarPanelConfig[]>(() => {
        const activeSectionId = selectedSectionIds.length > 0 ? selectedSectionIds[0] : null;
        const activeSection = activeSectionId ? project?.getSection(activeSectionId) ?? null : null;
        const activeChapter = activeChapterId ? project?.getChapter(activeChapterId) ?? null : null;

        const sectionTitle = activeChapterId
            ? 'Chapter Neural Core'
            : selectedSectionIds.length > 1
                ? 'Cluster Synthesis'
                : 'Section Synthesis';

        const panels: SidebarPanelConfig[] = [
            {
                key: 'settings',
                title: 'Metadata Manifest',
                icon: <Settings className="h-4 w-4" />,
                shortcut: '⌘⇧1',
                content: <ProjectSettingsHUD />,
            },
            {
                key: 'navigator',
                title: 'Architecture',
                icon: <Layers className="h-4 w-4" />,
                shortcut: '⌘⇧2',
                content: (
                    <SidebarNavigator
                        activeChapterId={activeChapterId}
                        selectedSectionIds={selectedSectionIds}
                        onActiveChapterChange={onActiveChapterChange}
                        onActiveSectionChange={onActiveSectionChange}
                    />
                ),
            },
            {
                key: 'section',
                title: sectionTitle,
                icon: <FileText className="h-4 w-4" />,
                shortcut: '⌘⇧3',
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
                shortcut: '⌘⇧4',
                content: <GlobalIntelligenceHUD />,
            },
            {
                key: 'chat',
                title: 'Project Consultant',
                icon: <MessageSquare className="h-4 w-4" />,
                shortcut: '⌘⇧5',
                content: <ProjectConsultantHUD isOpen={true} onClose={() => setActiveRightPanelKey('section')} />,
            },
            {
                key: 'snapshots',
                title: 'Temporal Snapshots',
                icon: <HistoryIcon className="h-4 w-4" />,
                shortcut: '⌘⇧6',
                content: <SnapshotHistoryPanel />,
            },
        ];

        // Add template library on desktop
        if (isDesktop) {
            panels.splice(1, 0, {
                key: 'templates',
                title: 'Layout Blueprint',
                icon: <LayoutTemplate className="h-4 w-4" />,
                shortcut: '⌘⇧T',
                content: <TemplateLibraryHUD />,
            });
        }

        return panels;
    }, [project, selectedSectionIds, activeChapterId, onActiveSectionChange, onActiveChapterChange, setActiveRightPanelKey, isDesktop]);

    return { leftPanels: [], rightPanels };
}
