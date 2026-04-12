'use client';

import { BuilderPageSkeleton } from '@/app/builder/loading';
import { OnboardingGuide } from '@/components/onboarding/OnboardingGuide';
import { useBuilderStore } from '@/hooks';
import { cn } from '@/infrastructure/utils/cn';
import { useReportGenerator } from '@/modules/ai-content/adapters/hooks/report-mode/useReportGenerator';
import { useSnapshots } from '@/modules/projects/adapters/hooks/useSnapshots';
import { ProjectProperties } from '@/modules/projects/domain/entities/Project';
import React, { Suspense, useRef } from 'react';

// Hooks
import { useDesktopBreakpoint } from '../../hooks/builder/useDesktopBreakpoint';
import { useDocumentSuggestion } from '../../hooks/builder/useDocumentSuggestion';
import { useFullscreen } from '../../hooks/builder/useFullscreen';
import { useOnboarding } from '../../hooks/builder/useOnboarding';

// Layout Components
import { SelectionGenerationHUD } from './generation/SelectionGenerationHUD';
import { BuilderCanvas } from './layout/BuilderCanvas';
import { BuilderHeader } from './layout/BuilderHeader';
import { BuilderLayout } from './layout/BuilderLayout';
import { BuilderSidebar } from './layout/BuilderSidebar';
import { DocumentRenderer } from './renderer/DocumentRenderer';
import { DocumentToolbar } from './toolbar/DocumentToolbar';

interface BuilderWorkspaceProps {
  initialProject?: ProjectProperties | null;
}

/**
 * BuilderWorkspace — Desktop-only async project editor.
 * No keyboard shortcuts. Clean state management.
 * Sidebar state is centralized in useDesktopBreakpoint hook.
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
  const { sidebarState, setSidebarState, sidebarWidths, setSidebarWidth } = useDesktopBreakpoint();

  const comparisonSnapshotId = useBuilderStore((state) => state.comparisonSnapshotId);
  const setComparisonSnapshotId = useBuilderStore((state) => state.setComparisonSnapshotId);
  const { snapshots } = useSnapshots(project?.id);
  const comparisonSnapshot = snapshots.find((s) => s.id === comparisonSnapshotId) ?? null;

  if (!project) return <BuilderPageSkeleton />;

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex-grow flex flex-col bg-background',
        'h-[calc(100vh-64px)] overflow-hidden select-none',
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
              projectName={project.name || ''}
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
              width={sidebarWidths.right}
              onWidthChange={(w) => setSidebarWidth('right', w)}
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
          sidebarState={sidebarState}
          onSidebarToggle={(side) => setSidebarState(side, !sidebarState[side])}
        />
      </Suspense>
    </div>
  );
};
