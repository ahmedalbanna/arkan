'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { ProjectProperties } from '@/modules/projects/domain/entities/Project';
import { useReportGenerator } from '@/modules/ai-content/adapters/hooks/report-mode/useReportGenerator';
import { useSidebarPanels } from '@/modules/ai-content/adapters/hooks/report-mode/useSidebarPanels';
import { useBuilderStore } from '@/hooks';
import { BuilderPageSkeleton } from '@/app/builder/loading';
import { OnboardingGuide } from '@/components/onboarding/OnboardingGuide';

// New Layout HUD Components
import { BuilderLayout } from './layout/BuilderLayout';
import { BuilderHeader } from './layout/BuilderHeader';
import { BuilderSidebar } from './layout/BuilderSidebar';
import { DocumentCanvas } from './canvas/DocumentCanvas';

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
        isOutlineVisible,
        setIsOutlineVisible,
        zoomLevel,
        handleZoomIn,
        handleZoomOut,
        handleZoomReset,
        handleMoveItem,
        handleUpdateTitle,
        handleDeleteItem,
        handleAddChapter,
        handleAddSection,
        handleDuplicateItem,
        handleUndo,
        handleCopyItem,
        handlePasteItem,
        summarizeMutation,
        expandMutation,
        rewriteMutation,
        rewriteStyles,
        viewMode,
        setViewMode,
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

    useEffect(() => {
        const completed = localStorage.getItem('arkan_onboarding_completed');
        if (!completed) {
            setShowOnboarding(true);
        }
    }, []);

    const handleOnboardingComplete = () => {
        localStorage.setItem('arkan_onboarding_completed', 'true');
        setShowOnboarding(false);
    };

    if (!project) return <BuilderPageSkeleton />;

    return (
        <div className="relative flex-grow flex flex-col bg-background h-[calc(100vh-64px)] overflow-hidden">
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
                        <DocumentCanvas
                            zoomLevel={zoomLevel}
                            onZoomIn={handleZoomIn}
                            onZoomOut={handleZoomOut}
                            onZoomReset={handleZoomReset}
                            isOutlineVisible={isOutlineVisible}
                            setIsOutlineVisible={setIsOutlineVisible}
                            viewMode={viewMode}
                            setViewMode={setViewMode}
                            activeChapterId={activeChapterId}
                            setActiveChapterId={setActiveChapterId}
                            selectedSectionIds={selectedSectionIds}
                            handleActiveSectionChange={handleActiveSectionChange}
                            activeRightPanelKey={activeRightPanelKey}
                            project={project}
                            handleMoveItem={handleMoveItem}
                            handleUpdateTitle={handleUpdateTitle}
                            handleDeleteItem={handleDeleteItem}
                            handleAddChapter={handleAddChapter}
                            handleAddSection={handleAddSection}
                            handleDuplicateItem={handleDuplicateItem}
                            handleUndo={handleUndo}
                            handleCopyItem={handleCopyItem}
                            handlePasteItem={handlePasteItem}
                            summarizeMutation={summarizeMutation}
                            expandMutation={expandMutation}
                            rewriteMutation={rewriteMutation}
                            rewriteStyles={rewriteStyles}
                        />
                    }
                />
            </Suspense>
        </div>
    );
};
