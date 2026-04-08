'use client';

import React, { Suspense, useRef, Profiler, useCallback, Fragment } from 'react';
import { ProjectProperties } from '@/modules/projects/domain/entities/Project';
import { useReportGenerator } from '@/modules/ai-content/adapters/hooks/report-mode/useReportGenerator';
import { useBuilderStore } from '@/hooks';
import { BuilderPageSkeleton } from '@/app/builder/loading';
import { OnboardingGuide } from '@/components/onboarding/OnboardingGuide';
import { useSnapshots } from '@/modules/projects/adapters/hooks/useSnapshots';
import { cn } from '@/infrastructure/utils/cn';

// Custom Layout Hooks
import { useFullscreen } from '../../hooks/builder/useFullscreen';
import { useOnboarding } from '../../hooks/builder/useOnboarding';
import { useDocumentSuggestion } from '../../hooks/builder/useDocumentSuggestion';

// Layout & Modular Components
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

/**
 * BuilderWorkspace — Root orchestrator for the builder environment.
 * Responsible for high-level state management and layout composition.
 */
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
    rightPanels,
  } = useReportGenerator(initialProject);

  const containerRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef);
  const { showOnboarding, setShowOnboarding, completeOnboarding } = useOnboarding();
  const suggestion = useDocumentSuggestion(project);

  const comparisonSnapshotId = useBuilderStore((state) => state.comparisonSnapshotId);
  const setComparisonSnapshotId = useBuilderStore((state) => state.setComparisonSnapshotId);
  const { snapshots } = useSnapshots(project?.id);
  const comparisonSnapshot = snapshots.find((s) => s.id === comparisonSnapshotId) ?? null;

  const handleProfilerRender = useCallback(
    (id: string, phase: string, actualDuration: number, baseDuration: number) => {
      if (process.env.NODE_ENV === 'development') {
        console.info(`[Profiler:${id}]`, { phase, actualDuration, baseDuration });
      }
    },
    []
  );

  if (!project) return <BuilderPageSkeleton />;

  const ProfilerWrapper = process.env.NODE_ENV === 'development' ? Profiler : Fragment;
  const profilerProps =
    process.env.NODE_ENV === 'development'
      ? { id: 'BuilderWorkspace', onRender: handleProfilerRender }
      : {};

  return (
    <ProfilerWrapper {...profilerProps}>
      <div
        ref={containerRef}
        className={cn(
          'relative flex-grow flex flex-col bg-background h-[calc(100vh-64px)] overflow-hidden',
          isFullscreen && 'fixed inset-0 z-[100] h-screen h-svh w-screen'
        )}
      >
        <OnboardingGuide
          isOpen={showOnboarding}
          onOpenChange={setShowOnboarding}
          onComplete={completeOnboarding}
        />

        <Suspense fallback={<BuilderPageSkeleton />}>
          <BuilderLayout
            header={
              <BuilderHeader
                projectName={project?.name || ''}
                onProjectNameChange={updateProjectName}
                onProjectNameBlur={() => updateProject((p) => p)}
                isSaving={isSaving}
                hasUnsavedChanges={hasUnsavedChanges}
                onSave={handleSave}
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
                      onToggleFullscreen={toggleFullscreen}
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
    </ProfilerWrapper>
  );
};
