'use client';

import React, { useState } from 'react';
import { A4Page } from '@/components/shared/A4Page';
import { MarkdownViewer } from '@/components/shared/MarkdownViewer';
import {
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore } from '@/hooks';
import { Document } from './Document';
import { SnapshotComparison } from './SnapshotComparison';
import { useSnapshots } from '@/modules/projects/adapters/hooks/useSnapshots';
import { Project } from '@/modules/projects/domain/entities/Project';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { CoverPage } from '@/components/shared/CoverPage';
import { FileText, ChevronDown, History } from 'lucide-react';
import { OutlineManager } from './outline/OutlineManager';
import { ReportSteps } from './ReportSteps';
import { DocumentToolbar } from './DocumentToolbar';
import { TableOfContentForm } from './TableOfContentForm';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { FileContentViewer } from './file-manager/FileContentViewer';
import { Separator } from '@/components/ui/separator';
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
  zoomLevel
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
  const [isSuggestionVisible, setIsSuggestionVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
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

  const handleContentChange = (newMarkdown: string) => {
    updateProjectFromMarkdown(newMarkdown);
  };

  const hasContent = project?.content && project.content.length > 0;

  // Logic for suggestions
  const getSuggestion = () => {
    if (!project || !project.sections) return "Start by adding a chapter or applying a template.";
    const emptySection = project.sections.find(s => !s.content);
    if (emptySection) {
      return `Suggestion: Try generating the "${emptySection.title}" section next.`;
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

    if (hasContent && project) {
      return (
        <A4Page>
          <Document
            project={project}
            viewMode={viewMode}
            onMarkdownChange={updateProjectFromMarkdown}
          />
        </A4Page>
      )
    }

    return (
      <div className="max-w-[210mm] mx-auto my-4">
        <ReportSteps />
      </div>
    )
  }

  if (comparisonSnapshot && project) {
    return (
      <div className="h-full flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-md">
        {renderContent()}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn(
      "flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-md transition-all duration-500",
      isFullscreen && "fixed inset-0 z-[100] rounded-none border-none"
    )}>
      <DocumentToolbar
        project={project}
        viewMode={viewMode}
        setViewMode={setViewMode}
        isOutlineVisible={isOutlineVisible}
        setIsOutlineVisible={setIsOutlineVisible}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        suggestion={suggestion}
      />

      <CardContent className="flex-grow flex flex-col p-0 relative min-h-0 overflow-hidden">
        {/* Subtle Canvas Background */}
        <div className="absolute inset-0 bg-[#f8fafc] dark:bg-[#0f172a] pointer-events-none">
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        </div>

        <OutlineManager
          isVisible={isOutlineVisible}
          project={project}
          activeChapterId={activeChapterId}
          selectedSectionIds={selectedSectionIds}
          onActiveChapterChange={setActiveChapterId}
          onActiveSectionChange={handleActiveSectionChange}
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
