'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye } from 'lucide-react';

import { A4Page } from '@/components/shared/A4Page';
import { CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore } from '@/hooks';
import { Document } from './Document';
import { SnapshotComparison } from './SnapshotComparison';
import { useSnapshots } from '@/modules/projects/adapters/hooks/useSnapshots';
import { CoverPage } from '@/components/shared/CoverPage';
import { CoverPageSettingsPanel } from './settings/CoverPageSettingsPanel';
import { OutlineManager } from './outline/OutlineManager';
import { ReportSteps } from './ReportSteps';
import { DocumentToolbar } from './DocumentToolbar';
import { cn } from '@/infrastructure/utils/cn';


interface ReportResultsProps {
  activeChapterId: string | null;
  setActiveChapterId: (id: string | null) => void;
  selectedSectionIds: string[];
  handleActiveSectionChange: (id: string | null, multiSelect?: boolean) => void;
  isOutlineVisible: boolean;
  setIsOutlineVisible: (visible: boolean) => void;
  viewMode: 'edit' | 'preview';
  setViewMode: (mode: 'edit' | 'preview') => void;
  zoomLevel: number;
  activeRightPanelKey?: string;
  summarizeMutation?: any;
  expandMutation?: any;
  rewriteMutation?: any;
  rewriteStyles?: { label: string; style: string }[];
}

const ReportResults = ({
  activeChapterId,
  setActiveChapterId,
  selectedSectionIds,
  handleActiveSectionChange,
  isOutlineVisible,
  setIsOutlineVisible,
  viewMode,
  setViewMode,
  zoomLevel,
  activeRightPanelKey,
  summarizeMutation,
  expandMutation,
  rewriteMutation,
  rewriteStyles,
}: ReportResultsProps) => {
  const { t } = useLocalization();
  const project = useBuilderStore(state => state.project);
  const updateProject = useBuilderStore(state => state.updateProject);
  const undo = useBuilderStore(state => state.undo);
  const version = useBuilderStore(state => state.version);
  const updateProjectFromMarkdown = useBuilderStore(state => state.updateProjectFromMarkdown);
  const selectedFileId = useBuilderStore(state => state.selectedFileId);
  const comparisonSnapshotId = useBuilderStore(state => state.comparisonSnapshotId);
  const setComparisonSnapshotId = useBuilderStore(state => state.setComparisonSnapshotId);
  const { snapshots } = useSnapshots(project?.id);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCoverPage, setShowCoverPage] = useState(false);
  const [showCoverSettings, setShowCoverSettings] = useState(false);

  // Toggle cover page + settings panel together
  const handleToggleCoverPage = (visible: boolean) => {
    setShowCoverPage(visible);
    setShowCoverSettings(visible);
  };

  const containerRef = React.useRef<HTMLDivElement>(null);
  const comparisonSnapshot = snapshots.find((s: any) => s.id === comparisonSnapshotId);

  const toggleFullscreen = () => {
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

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const hasContent = project?.content && project.content.length > 0;

  // Intelligent writing suggestion based on project state
  const getSuggestion = () => {
    if (!project || !project.sections) return "Start by adding a chapter or applying a template.";
    const emptySection = project.sections.find(s => !s.content);
    if (emptySection) {
      return `Try generating the "${emptySection.title}" section next.`;
    }
    return "All sections have content. You can now review or export your document.";
  };
  const suggestion = getSuggestion();

  const renderContent = () => {
    if (comparisonSnapshot && project) {
      return (
        <SnapshotComparison
          activeProject={project}
          comparisonSnapshot={comparisonSnapshot}
          onClose={() => setComparisonSnapshotId(null)}
        />
      );
    }

    return (
      <div className="flex flex-col items-center">
        {/* Cover Page — animated entry/exit */}
        <AnimatePresence>
          {showCoverPage && (
            <motion.div
              key="cover-page"
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="w-full"
            >
              <CoverPage project={project} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Document body */}
        {hasContent && project ? (
          <A4Page>
            <Document
              project={project}
              viewMode={viewMode}
              onMarkdownChange={updateProjectFromMarkdown}
              activeChapterId={activeChapterId}
              setActiveChapterId={setActiveChapterId}
              selectedSectionIds={selectedSectionIds}
              handleActiveSectionChange={handleActiveSectionChange}
              summarizeMutation={summarizeMutation}
              expandMutation={expandMutation}
              rewriteMutation={rewriteMutation}
              rewriteStyles={rewriteStyles}
            />
          </A4Page>
        ) : (
          <div className="max-w-[210mm] mx-auto my-4 w-full">
            <ReportSteps />
          </div>
        )}
      </div>
    );
  };

  if (comparisonSnapshot && project) {
    return (
      <div className="h-full flex flex-col overflow-hidden rounded-xl border border-border/40 bg-card text-card-foreground shadow-sm">
        {renderContent()}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-border/40 bg-card text-card-foreground shadow-sm transition-all duration-500 relative",
        isFullscreen && "fixed inset-0 z-[100] rounded-none border-none"
      )}
    >
      <DocumentToolbar
        project={project}
        viewMode={viewMode}
        setViewMode={setViewMode}
        isOutlineVisible={isOutlineVisible}
        setIsOutlineVisible={setIsOutlineVisible}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        suggestion={suggestion}
        showCoverPage={showCoverPage}
        setShowCoverPage={handleToggleCoverPage}
      />

      {/* Preview mode indicator — adjusted for h-14 toolbar */}
      <AnimatePresence>
        {viewMode === 'preview' && (
          <motion.div
            key="preview-indicator"
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute top-14 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 pointer-events-none"
          >
            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400 bg-background/95 backdrop-blur-xl border border-amber-500/20 px-3 py-1.5 rounded-full shadow-lg shadow-amber-500/5">
              <Eye className="h-3 w-3" />
              Preview — hover for AI actions
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CardContent className="flex-grow flex flex-col p-0 relative min-h-0 overflow-hidden">
        {/* Canvas background — aligned with BuilderCanvas dot grid (28px, primary color) */}
        <div className="absolute inset-0 bg-[#f8fafc] dark:bg-[#0f172a] pointer-events-none">
          <div
            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
            style={{
              backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, hsl(var(--primary)) 1px, transparent 0)',
              backgroundSize: '28px 28px',
            }}
          />
        </div>

        <OutlineManager
          isVisible={isOutlineVisible}
          project={project}
          activeChapterId={activeChapterId}
          selectedSectionIds={selectedSectionIds}
          onActiveChapterChange={setActiveChapterId}
          onActiveSectionChange={handleActiveSectionChange}
        />

        {/* Floating Cover Settings Panel */}
        <CoverPageSettingsPanel
          isOpen={showCoverSettings}
          onClose={() => setShowCoverSettings(false)}
        />

        <ScrollArea className="flex-grow relative scroll-smooth">
          <div className="py-12 px-8 flex justify-center min-h-full">
            <div
              className="w-full max-w-5xl transition-all duration-500 ease-in-out origin-top"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              {renderContent()}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </div>
  );
};

export default React.memo(ReportResults);
