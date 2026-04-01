'use client';

import { BuilderPageSkeleton } from '@/app/builder/loading';
import { OnboardingGuide } from '@/components/onboarding/OnboardingGuide';
import { ResizableHandle, ResizablePanelGroup } from '@/components/ui/resizable';
import { useReportGenerator } from '@/modules/ai-content/adapters/hooks/report-mode/useReportGenerator';
import { useKeyboardShortcuts } from '@/modules/ai-content/adapters/hooks/report-mode/useKeyboardShortcuts';
import { useSaveProject } from '@/modules/projects/adapters/hooks/use-projects';
import { type ProjectProperties } from '@/modules/projects/domain/entities/Project';
import { Suspense, lazy } from 'react';
import { BuilderHeader } from './layout/BuilderHeader';
import { BuilderSidebar } from './layout/BuilderSidebar';
import { BuilderCanvas } from './layout/BuilderCanvas';
import { useBuilderStore } from '@/modules/projects/adapters/state/useBuilderStore';
import { FloatingOutline } from './FloatingOutline';

const ReportResults = lazy(() => import('./ReportResults'));

export default function ReportModeGenerator({ initialProject }: { initialProject?: ProjectProperties | null }) {
    const {
        locale,
        activePanelKey,
        setActivePanelKey,
        activeRightPanelKey,
        setActiveRightPanelKey,
        isLeftPanelVisible,
        isRightPanelVisible,
        showOnboarding,
        setShowOnboarding,
        handleOnboardingComplete,
        project,
        isStoreInitialized,
        updateProjectName,
        updateProject,
        leftPanels,
        rightPanels,
        zoomLevel,
        setZoomLevel,
        activeChapterId,
        setActiveChapterId,
        selectedSectionIds,
        handleActiveSectionChange,
        isOutlineVisible,
        setIsOutlineVisible,
        viewMode,
        setViewMode,
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
        rewriteStyles
    } = useReportGenerator(initialProject);

    const hasUnsavedChanges = useBuilderStore(state => state.hasUnsavedChanges);

    const handleZoomIn = () => setZoomLevel(prev => Math.min(2, prev + 0.1));
    const handleZoomOut = () => setZoomLevel(prev => Math.max(0.5, prev - 0.1));
    const handleZoomReset = () => setZoomLevel(1);

    const { saveProjectMutation, isSaving } = useSaveProject();

    const handleSave = () => {
        if (project) {
            saveProjectMutation.mutate(project.toStateObject());
        }
    };

    useKeyboardShortcuts({
        onSave: handleSave,
        onZoomIn: handleZoomIn,
        onZoomOut: handleZoomOut,
        onZoomReset: handleZoomReset,
    });

    if (!isStoreInitialized || !project) {
        return <BuilderPageSkeleton />;
    }

    return (
        <div className="relative flex-grow flex flex-col bg-background h-[calc(100vh-64px)] overflow-hidden">
            <OnboardingGuide isOpen={showOnboarding} onOpenChange={setShowOnboarding} onComplete={handleOnboardingComplete} />
            <Suspense fallback={<BuilderPageSkeleton />}>
                <BuilderHeader 
                    projectName={project?.name || ''}
                    onProjectNameChange={updateProjectName}
                    onProjectNameBlur={() => updateProject(p => p)}
                    isSaving={isSaving}
                    hasUnsavedChanges={hasUnsavedChanges}
                    onSave={handleSave}
                />

                <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
                    {/* Immersive Global Environment Layer */}
                    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% -20%, hsl(var(--primary) / 0.05), transparent 50%)' }} />
                    </div>

                    <div className="relative z-10 flex-1 flex flex-col w-full h-full">
                        <div className="h-full">
                            <ResizablePanelGroup 
                                direction="horizontal" 
                                className="h-full items-stretch"
                                dir={locale === 'ar' ? 'rtl' : 'ltr'}
                            >
                                <BuilderSidebar 
                                    side="left"
                                    panels={leftPanels}
                                    activeKey={activePanelKey}
                                    onActiveKeyChange={setActivePanelKey}
                                />

                                <ResizableHandle withHandle className="bg-transparent hover:bg-primary/10 transition-colors w-1.5 z-50" />

                                <BuilderCanvas
                                    zoomLevel={zoomLevel}
                                    onZoomIn={handleZoomIn}
                                    onZoomOut={handleZoomOut}
                                    onZoomReset={handleZoomReset}
                                    floatingElements={
                                        <FloatingOutline 
                                            isVisible={isOutlineVisible}
                                            project={project}
                                            activeChapterId={activeChapterId}
                                            selectedSectionIds={selectedSectionIds}
                                            onActiveChapterChange={setActiveChapterId}
                                            onActiveSectionChange={(id) => handleActiveSectionChange(id)}
                                            onMoveItem={handleMoveItem}
                                            onUpdateTitle={handleUpdateTitle}
                                            onDeleteItem={handleDeleteItem}
                                            onAddChapter={handleAddChapter}
                                            onAddSection={handleAddSection}
                                            onDuplicateItem={handleDuplicateItem}
                                            onUndo={handleUndo}
                                            onCopyItem={handleCopyItem}
                                            onPasteItem={handlePasteItem}
                                        />
                                    }
                                >
                                    <ReportResults
                                        activeChapterId={activeChapterId}
                                        setActiveChapterId={setActiveChapterId}
                                        selectedSectionIds={selectedSectionIds}
                                        handleActiveSectionChange={handleActiveSectionChange}
                                        isOutlineVisible={isOutlineVisible}
                                        setIsOutlineVisible={setIsOutlineVisible}
                                        viewMode={viewMode}
                                        setViewMode={setViewMode}
                                        zoomLevel={zoomLevel}
                                        activeRightPanelKey={activeRightPanelKey}
                                        summarizeMutation={summarizeMutation}
                                        expandMutation={expandMutation}
                                        rewriteMutation={rewriteMutation}
                                        rewriteStyles={rewriteStyles}
                                    />
                                </BuilderCanvas>

                                <ResizableHandle withHandle className="bg-transparent hover:bg-primary/10 transition-colors w-1.5 z-50" />

                                <BuilderSidebar 
                                    side="right"
                                    panels={rightPanels}
                                    activeKey={activeRightPanelKey}
                                    onActiveKeyChange={setActiveRightPanelKey}
                                />
                            </ResizablePanelGroup>
                        </div>
                    </div>
                </main>
            </Suspense>
        </div>
    );
}
