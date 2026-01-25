'use client';
import { BuilderPageSkeleton } from '@/app/builder/loading';
import { OnboardingGuide } from '@/components/onboarding/OnboardingGuide';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { useLocalization } from '@/context/LocalizationContext';
import { useReportGenerator } from '@/hooks/report-mode/useReportGenerator';
import { cn } from '@/lib/utils/cn';
import { lazy, Suspense } from 'react';

import { CollapsibleSidePanel } from '../ui/CollapsibleSidePanel';
import { ProjectChat } from './chat/ProjectChat';
import {
  BottomNavBar,
  FloatingActionButtons,
  FloatingControlPanel,
  FloatingLanguagePanel,
  ProjectHeader,
} from './generator';




const ReportResults = lazy(() => import('./ReportResults'));

/**
 * ReportSkeleton Component
 * Loading skeleton for the report generator layout
 */
function ReportSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start">
      <div className="lg:col-span-4">
        <BuilderPageSkeleton />
      </div>
      <div className="lg:col-span-8">
        <BuilderPageSkeleton />
      </div>
    </div>
  );
}

/**
 * ReportModeGenerator Component
 *
 * Main report builder interface. Manages the layout, floating controls,
 * and coordinates between generator tools and document preview.
 *
 * Refactored from 338 lines to ~120 lines by extracting:
 * - FloatingControlPanel → generator/FloatingControlPanel.tsx
 * - FloatingLanguagePanel → generator/FloatingLanguagePanel.tsx
 * - FloatingActionButtons → generator/FloatingActionButtons.tsx
 * - ProjectHeader → generator/ProjectHeader.tsx
 * - BottomNavBar → generator/BottomNavBar.tsx
 */
export default function ReportModeGenerator() {
  const { locale } = useLocalization();
  const {
    isMobile,
    activeMobileView,
    setActiveMobileView,
    activePanelKey,
    setActivePanelKey,
    showOnboarding,
    setShowOnboarding,
    handleOnboardingComplete,
    project,
    isStoreInitialized,
    updateProjectName,
    updateProject,
    isSaving,
    panels,
    isChatOpen,
    setIsChatOpen,
    handleComplexityChange,
    handleFormalityChange,
    handleLanguageChange,
    handleToneChange,
    handleZoomIn,
    handleZoomOut,
  } = useReportGenerator();

  if (!isStoreInitialized) {
    return <BuilderPageSkeleton />;
  }

  return (
    <ErrorBoundary>
      <div className="relative w-full h-screen flex flex-col overflow-hidden bg-background">
        {/* Onboarding Guide */}
        {showOnboarding && (
          <OnboardingGuide
            isOpen={showOnboarding}
            onOpenChange={setShowOnboarding}
            onComplete={handleOnboardingComplete}
          />
        )}

        {/* Floating Controls - Left Side */}
        <div className="fixed left-4 bottom-20 lg:bottom-8 flex flex-col gap-4 z-50">
          <FloatingControlPanel
            complexity={project?.complexity ?? 50}
            formality={project?.formality ?? 70}
            onComplexityChange={handleComplexityChange}
            onFormalityChange={handleFormalityChange}
          />

          <FloatingLanguagePanel
            language={project?.language ?? 'default'}
            tone={project?.tone ?? 'professional'}
            onLanguageChange={handleLanguageChange}
            onToneChange={handleToneChange}
          />
        </div>

        {/* Floating Action Buttons - Right Side */}
        <div className="fixed right-4 bottom-20 lg:bottom-8 flex flex-col gap-2 z-50">
          <FloatingActionButtons
            onChatToggle={() => setIsChatOpen(true)}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
          />
        </div>

        {/* Project Chat */}
        <ProjectChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

        {/* Main Content - Flex container with proper height */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Project Header */}
          <div className="flex-shrink-0 m-4">
            <ProjectHeader
              project={project}
              onNameChange={updateProjectName}
              onBlur={() => updateProject(p => p)}
              isSaving={isSaving}
            />
          </div>

          {/* Generator and Results Layout - Main content area */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full pb-16 lg:pb-0">
              <Suspense fallback={<ReportSkeleton />}>
                <div
                  className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full px-4 py-4 lg:px-6"
                  dir={locale === 'ar' ? 'rtl' : 'ltr'}
                >
                  {/* Generator Panel */}
                  <div
                    className={cn(
                      'lg:col-span-4 xl:col-span-4 h-full min-h-0 overflow-hidden',
                      isMobile && activeMobileView !== 'generator' && 'hidden'
                    )}
                  >
                    <CollapsibleSidePanel
                      panels={panels}
                      activeKey={activePanelKey}
                      onActiveKeyChange={setActivePanelKey}
                    />
                  </div>

                  {/* Results Panel */}
                  <div
                    className={cn(
                      'lg:col-span-8 xl:col-span-8 h-full min-h-0 overflow-hidden',
                      isMobile && activeMobileView !== 'result' && 'hidden'
                    )}
                  >
                    <ReportResults activePanelKey={activePanelKey} />
                  </div>
                </div>
              </Suspense>

              {/* Mobile Bottom Navigation */}
              {isMobile && (
                <BottomNavBar
                  activeView={activeMobileView}
                  onViewChange={setActiveMobileView}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
