'use client';

import React, { useState } from 'react';
import { A4Page } from '@/components/shared/A4Page';
import {
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore } from '@/hooks';
import MarkdownEditor from './MarkdownEditor';
import { DiffView } from '@/components/shared/DiffView';
import { computeDiff } from '@/modules/projects/domain/utils/diff';
import { useSnapshots } from '@/modules/projects/adapters/hooks/useSnapshots';
import { Project } from '@/modules/projects/domain/entities/Project';
import { Badge } from '@/components/ui/badge';
import { X, GitCompare } from 'lucide-react';
import { CoverPage } from '@/components/shared/CoverPage';
import { BookOpenCheck, Brush, LayoutList, Bot, FileVideo, FileText, ChevronDown, Lightbulb, History, Maximize2, Minimize2, ListTree } from 'lucide-react';
import { FloatingOutline } from './FloatingOutline';
import { TableOfContentForm } from './TableOfContentForm';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { FileContentViewer } from './file-manager/FileContentViewer';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { SessionActions } from './session/SessionActions';
import { cn } from '@/infrastructure/utils/cn';

const ReportSteps = () => {
  const { t } = useLocalization();

  const steps = [
    {
      icon: <FileVideo className="h-6 w-6 text-primary" />,
      title: "1. Customize Cover Page",
      description: "Click on the text on the cover page to edit your project's title, description, and author details directly."
    },
    {
      icon: <LayoutList className="h-6 w-6 text-primary" />,
      title: "2. Insert Table of Contents",
      description: "Use the 'Add Chapter' button or paste a structure in the 'Generation Tools' to create your document's outline."
    },
    {
      icon: <Bot className="h-6 w-6 text-primary" />,
      title: "3. AI Generate Project Template",
      description: "Apply a pre-defined template to structure your report and generate content for all sections with a single click."
    },
    {
      icon: <Brush className="h-6 w-6 text-primary" />,
      title: "4. Customize Generation Tools",
      description: "For each section, expand it to edit the AI prompt, add guidelines, and select context from other sections or files."
    },
    {
      icon: <BookOpenCheck className="h-6 w-6 text-primary" />,
      title: "5. View Chapter and Section",
      description: "Generate content by clicking the 'Generate' button on any section and review the results as they appear in the editor."
    }
  ];

  return (
    <div className="p-8">
      <div className="text-center mb-10">
        <h3 className="text-xl font-semibold font-headline">{t('builder.reportGenerator.emptyStateTitle')}</h3>
        <p className="text-muted-foreground">{t('builder.reportGenerator.emptyStateDesc')}</p>
      </div>
      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start gap-4">
            <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full">
              {step.icon}
            </div>
            <div>
              <h4 className="font-semibold">{step.title}</h4>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface ReportResultsProps {
    activePanelKey: string;
    activeChapterId: string | null;
    setActiveChapterId: (id: string | null) => void;
    selectedSectionIds: string[];
    handleActiveSectionChange: (id: string | null, multiSelect?: boolean) => void;
    isOutlineVisible: boolean;
    setIsOutlineVisible: (visible: boolean) => void;
}

const ReportResults = ({ 
    activePanelKey,
    activeChapterId,
    setActiveChapterId,
    selectedSectionIds,
    handleActiveSectionChange,
    isOutlineVisible,
    setIsOutlineVisible
}: ReportResultsProps) => {
  const { t } = useLocalization();
  const project = useBuilderStore(state => state.project);
  const updateProject = useBuilderStore(state => state.updateProject);
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
        const snapshotProject = new Project(comparisonSnapshot.snapshotData);
        const diff = computeDiff(snapshotProject.fullMarkdownContent, project.fullMarkdownContent);

        return (
            <div className="flex flex-col h-full min-h-0 bg-background/40 backdrop-blur-xl border border-primary/10 rounded-2xl overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between px-8 py-6 border-b border-primary/10 bg-primary/5">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/20 shadow-inner">
                            <GitCompare className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-[14px] font-black uppercase tracking-[0.2em] text-foreground">Manifest_Comparison</h2>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mt-1">
                                Comparing Active with <span className="text-primary font-bold">{comparisonSnapshot.name}</span>
                            </p>
                        </div>
                    </div>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setComparisonSnapshotId(null)}
                        className="h-9 px-4 text-[11px] font-black uppercase tracking-widest border-primary/10 hover:bg-primary/10 hover:text-primary transition-all rounded-xl"
                    >
                        <X className="h-4 w-4 mr-2" />
                        Exit Comparison
                    </Button>
                </div>
                
                <ScrollArea className="flex-1">
                    <div className="p-12 max-w-5xl mx-auto">
                        <div className="mb-8 flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] font-black tracking-widest border-green-500/20 text-green-500 bg-green-500/5">
                                ADDITIONS_V1
                            </Badge>
                            <Badge variant="outline" className="text-[10px] font-black tracking-widest border-destructive/20 text-destructive bg-destructive/5">
                                DELETIONS_V1
                            </Badge>
                        </div>
                        <DiffView diff={diff} />
                    </div>
                </ScrollArea>
                
                <div className="p-4 border-t border-primary/5 bg-muted/5 flex items-center justify-between opacity-50">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em]">Technical_Diff_Engine_v1.0</span>
                    <span className="text-[9px] font-mono">LCS_ALGORITHM_STABLE</span>
                </div>
            </div>
        );
    }

    switch (activePanelKey) {
        case 'settings':
            return <CoverPage project={project} />;
        case 'templates':
             return (
                <A4Page>
                    <TableOfContentForm />
                </A4Page>
            );
        case 'files': {
            const selectedFile = project?.externalContext.find(f => f.id === selectedFileId);

            if (!selectedFile) {
                return (
                    <A4Page>
                        <div className="p-8 text-center text-muted-foreground h-full flex flex-col justify-center items-center">
                            <FileText className="mx-auto h-16 w-16 mb-4" />
                            <h3 className="text-xl font-semibold font-headline text-foreground">File Content Viewer</h3>
                            <p className="mt-2">When you select a file from the manager, its content will be displayed here for review and analysis.</p>
                        </div>
                    </A4Page>
                );
            }

            return (
                <A4Page>
                    <FileContentViewer fileName={selectedFile.fileName} content={selectedFile.content} />
                </A4Page>
            );
        }
        case 'generate':
        default:
             if (hasContent) {
                 return (
                    <A4Page>
                        <MarkdownEditor
                            key={version} // Re-mount editor when version changes
                            content={project?.fullMarkdownContent || ''}
                            onChange={handleContentChange}
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
        "h-full flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-md transition-all duration-500",
        isFullscreen && "fixed inset-0 z-[100] rounded-none border-none"
    )}>
      {/* Document View Status Toolbar */}
      <div className="flex items-center justify-between px-6 py-2.5 border-b bg-muted/10 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest bg-background/50 px-2 py-1 rounded-md border border-border/40 shadow-sm">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            Live Preview
          </div>
          {project?.meta.updated && (
            <span className="text-[9px] text-muted-foreground/60 font-bold uppercase tracking-tighter">
              Last auto-save: {formatDistanceToNow(new Date(project.meta.updated), { addSuffix: true })}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-7 w-7 transition-all duration-300",
                    isOutlineVisible ? "bg-primary/10 text-primary" : "hover:bg-primary/5 hover:text-primary"
                  )}
                  onClick={() => setIsOutlineVisible(!isOutlineVisible)}
                >
                  <ListTree className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[10px] font-bold uppercase tracking-widest">
                Toggle Document Outline
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 hover:bg-primary/5 hover:text-primary"
                  onClick={toggleFullscreen}
                >
                  {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[10px] font-bold uppercase tracking-widest">
                {isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase tracking-wider gap-2 px-2 hover:bg-primary/5 hover:text-primary">
                  <Lightbulb className="h-3.5 w-3.5 text-yellow-500" />
                  Writer's Guide
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs p-4 space-y-2">
                <p className="font-bold text-xs uppercase tracking-widest text-primary">Intelligent Suggestion</p>
                <p className="text-[11px] leading-relaxed italic">{suggestion}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <CardContent className="flex-grow flex flex-col p-0 relative min-h-0 overflow-hidden">
          {/* Subtle Canvas Background */}
          <div className="absolute inset-0 bg-[#f8fafc] dark:bg-[#0f172a] pointer-events-none">
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          </div>

          <FloatingOutline 
            isVisible={isOutlineVisible}
            project={project}
            activeChapterId={activeChapterId}
            selectedSectionIds={selectedSectionIds}
            onActiveChapterChange={setActiveChapterId}
            onActiveSectionChange={handleActiveSectionChange}
            onMoveItem={(activeId, overId) => updateProject(p => p.moveContentItem(activeId, overId))}
          />

          <ScrollArea className="flex-grow relative scroll-smooth">
              <div className="py-12 px-8 flex justify-center min-h-full">
                  <div className="w-full max-w-5xl transition-all duration-500 ease-in-out origin-top">
                    {renderContent()}
                  </div>
              </div>
          </ScrollArea>
      </CardContent>
    </div>
  );
};

export default React.memo(ReportResults);
