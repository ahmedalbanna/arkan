'use client';

import React, { Suspense, useState, useEffect, useRef } from 'react';
import { ProjectProperties } from '@/modules/projects/domain/entities/Project';
import { useReportGenerator } from '@/modules/ai-content/adapters/hooks/report-mode/useReportGenerator';
import { useSidebarPanels } from '@/modules/ai-content/adapters/hooks/builder/useSidebarPanels';
import { useBuilderStore } from '@/hooks';
import { BuilderPageSkeleton } from '@/app/builder/loading';
import { OnboardingGuide } from '@/components/onboarding/OnboardingGuide';
import { useSnapshots } from '@/modules/projects/adapters/hooks/useSnapshots';
import { cn } from '@/infrastructure/utils/cn';

// Layout HUD & Modular Components
import { BuilderLayout } from './layout/BuilderLayout';
import { BuilderHeader } from './layout/BuilderHeader';
import { BuilderSidebar } from './layout/BuilderSidebar';
import { BuilderCanvas } from './layout/BuilderCanvas';
import { DocumentToolbar } from './toolbar/DocumentToolbar';
import { DocumentRenderer } from './renderer/DocumentRenderer';
import { SelectionGenerationHUD } from './generation/SelectionGenerationHUD';

interface BuilderWorkspaceProps {
    initialProject?: ProjectProperties | null;
}

export const BuilderWorkspace: React.FC<BuilderWorkspaceProps> = ({ initialProject }) => {
    const {
        project,
        updateProject,
        updateProjectName,
        isSaving,
        hasUnsavedChanges,
        handleSave,
        activeChapterId,
        setActiveChapterId,
        selectedSectionIds,
        handleActiveSectionChange,
        activePanelKey,
        setActivePanelKey,
        activeRightPanelKey,
        setActiveRightPanelKey,
        zoomLevel,
        handleZoomIn,
        handleZoomOut,
        handleZoomReset,
        summarizeMutation,
        expandMutation,
        rewriteMutation,
        rewriteStyles,
        viewMode,
        setViewMode,
        syncProjectStructure,
    } = useReportGenerator(initialProject);

    const { leftPanels, rightPanels } = useSidebarPanels({
        project,
        activeChapterId,
        selectedSectionIds,
        onActiveChapterChange: setActiveChapterId,
        onActiveSectionChange: handleActiveSectionChange,
        setActiveRightPanelKey,
    });

    const [showOnboarding, setShowOnboarding] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    
    const containerRef = useRef<HTMLDivElement>(null);
    const comparisonSnapshotId = useBuilderStore(state => state.comparisonSnapshotId);
    const setComparisonSnapshotId = useBuilderStore(state => state.setComparisonSnapshotId);
    const { snapshots } = useSnapshots(project?.id);
    const comparisonSnapshot = snapshots.find((s) => s.id === comparisonSnapshotId) ?? null;

    const handleToggleFullscreen = () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().then(() => {
                setIsFullscreen(true);
            }).catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    useEffect(() => {
        const completed = localStorage.getItem('arkan_onboarding_completed');
        if (!completed) setShowOnboarding(true);
    }, []);

    const handleOnboardingComplete = () => {
        localStorage.setItem('arkan_onboarding_completed', 'true');
        setShowOnboarding(false);
    };

    // Intelligent writing suggestion based on project state
    const suggestion = (() => {
        if (!project || !project.sections) return "Start by adding a chapter or applying a template.";
        const emptySection = project.sections.find(s => !s.content);
        if (emptySection) return `Try generating the "${emptySection.title}" section next.`;
        return "All sections have content. You can now review or export your document.";
    })();

    if (!project) return <BuilderPageSkeleton />;

    return (
        <div 
            ref={containerRef}
            className={cn(
                "relative flex-grow flex flex-col bg-background h-[calc(100vh-64px)] overflow-hidden",
                isFullscreen && "fixed inset-0 z-[100] h-screen h-svh w-screen"
            )}
        >
            <OnboardingGuide isOpen={showOnboarding} onOpenChange={setShowOnboarding} onComplete={handleOnboardingComplete} />
            
            <Suspense fallback={<BuilderPageSkeleton />}>
                <BuilderLayout
                    header={
                        <BuilderHeader 
                            projectName={project?.name || ''}
                            onProjectNameChange={updateProjectName}
                            onProjectNameBlur={() => updateProject(p => p)}
                            isSaving={isSaving}
                            hasUnsavedChanges={hasUnsavedChanges}
                            onSave={handleSave}
                        />
                    }
                    leftSidebar={
                        <BuilderSidebar 
                            side="left"
                            panels={leftPanels}
                            activeKey={activePanelKey}
                            onActiveKeyChange={setActivePanelKey}
                        />
                    }
                    rightSidebar={
                        <BuilderSidebar 
                            side="right"
                            panels={rightPanels}
                            activeKey={activeRightPanelKey}
                            onActiveKeyChange={setActiveRightPanelKey}
                        />
                    }
                    canvas={
                        <div className="relative h-full">
                            <SelectionGenerationHUD viewMode={viewMode} />
                            <BuilderCanvas
                                zoomLevel={zoomLevel}
                                onZoomIn={handleZoomIn}
                                onZoomOut={handleZoomOut}
                                onZoomReset={handleZoomReset}
                                containerRef={containerRef}
                                toolbar={
                                    <DocumentToolbar 
                                        project={project}
                                        viewMode={viewMode}
                                        setViewMode={setViewMode}
                                        isFullscreen={isFullscreen}
                                        onToggleFullscreen={handleToggleFullscreen}
                                        suggestion={suggestion}
                                    />
                                }
                            >
                                <DocumentRenderer
                                    project={project}
                                    viewMode={viewMode}
                                    activeChapterId={activeChapterId}
                                    setActiveChapterId={setActiveChapterId}
                                    selectedSectionIds={selectedSectionIds}
                                    handleActiveSectionChange={handleActiveSectionChange}
                                    showCoverPage={true}
                                    comparisonSnapshot={comparisonSnapshot}
                                    onCloseComparison={() => setComparisonSnapshotId(null)}
                                    updateProjectFromMarkdown={useBuilderStore.getState().updateProjectFromMarkdown}
                                    summarizeMutation={summarizeMutation}
                                    expandMutation={expandMutation}
                                    rewriteMutation={rewriteMutation}
                                    rewriteStyles={rewriteStyles}
                                />
                            </BuilderCanvas>
                        </div>
                    }
                />
            </Suspense>
        </div>
    );
};
