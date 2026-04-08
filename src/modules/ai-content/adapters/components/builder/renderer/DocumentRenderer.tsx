'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ShieldAlert, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { A4Page } from '@/components/shared/A4Page';
import { BuilderDocument } from './BuilderDocument';
import { SnapshotComparison } from './SnapshotComparison';
import { CoverPage } from '@/components/shared/CoverPage';
import { ReportSteps } from './ReportSteps';
import { Project } from '@/modules/projects/domain/entities/Project';
import { type ComparisonSnapshot, type RewriteStyleOption, type SectionMutation } from './types';
import { BuilderPageSkeleton } from '@/app/builder/loading';

// ── Error Boundary for Document Rendering ────────────────────────────────────────

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class RendererErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[DocumentRenderer] Rendering pipeline crash:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-[210mm] mx-auto my-20 p-12 rounded-[32px] border-2 border-dashed border-destructive/20 bg-destructive/5 text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
          <div className="h-20 w-20 mx-auto rounded-[28px] bg-destructive/10 flex items-center justify-center border border-destructive/20 shadow-2xl">
            <ShieldAlert className="h-10 w-10 text-destructive" />
          </div>
          <div className="space-y-2">
            <h3 className="text-[18px] font-black uppercase tracking-tight text-destructive">
              Document Rendering Error
            </h3>
            <p className="text-[12px] text-muted-foreground/70 italic font-medium leading-relaxed max-w-md mx-auto">
              The document renderer encountered an unexpected error while processing the project
              structure.
            </p>
          </div>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="h-11 px-8 rounded-xl border-destructive/20 text-destructive hover:bg-destructive/10 transition-all gap-2.5 font-black uppercase tracking-widest text-[10px]"
          >
            <RefreshCcw className="h-4 w-4" />
            Reload Workspace
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Main Component ─────────────────────────────────────────────────────────────

const MemoizedSnapshotComparison = React.memo(SnapshotComparison);
const MemoizedBuilderDocument = React.memo(BuilderDocument);

interface DocumentRendererProps {
    project: Project | null;
    viewMode: 'edit' | 'preview';
    activeChapterId: string | null;
    setActiveChapterId: (id: string | null) => void;
    selectedSectionIds: string[];
    handleActiveSectionChange: (id: string | null, multiSelect?: boolean) => void;
    showCoverPage: boolean;
    comparisonSnapshot: ComparisonSnapshot | null;
    onCloseComparison: () => void;
    updateProjectFromMarkdown: (markdown: string) => void;
    summarizeMutation: SectionMutation;
    expandMutation: SectionMutation;
    rewriteMutation: SectionMutation;
    rewriteStyles: RewriteStyleOption[];
}

const DocumentRendererComponent: React.FC<DocumentRendererProps> = ({
    project,
    viewMode,
    activeChapterId,
    setActiveChapterId,
    selectedSectionIds,
    handleActiveSectionChange,
    showCoverPage,
    comparisonSnapshot,
    onCloseComparison,
    updateProjectFromMarkdown,
    summarizeMutation,
    expandMutation,
    rewriteMutation,
    rewriteStyles,
}) => {
    // 1. EXISTENCE GUARD — Prevent rendering if project is not yet hydrated
    if (!project) return <BuilderPageSkeleton />;

    const hasContent = Array.isArray(project.content) && project.content.length > 0;

    // 2. COMPARISON MODE — Isolated view
    if (comparisonSnapshot) {
        return (
            <RendererErrorBoundary>
                <MemoizedSnapshotComparison
                    activeProject={project}
                    comparisonSnapshot={comparisonSnapshot}
                    onClose={onCloseComparison}
                />
            </RendererErrorBoundary>
        );
    }

    // 3. PRODUCTION RENDER
    return (
        <RendererErrorBoundary>
            <div className="flex flex-col items-center">
                {/* Cover Page */}
                <AnimatePresence mode="wait">
                    {showCoverPage && (
                        <motion.div
                            key="cover-page"
                            initial={{ opacity: 0, y: -24, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -24, scale: 0.98 }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            className="w-full mb-12"
                        >
                            <CoverPage project={project} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Document body or Setup Guide */}
                <div className="w-full transition-all duration-700">
                    {hasContent ? (
                        <A4Page>
                            <MemoizedBuilderDocument
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
                        <div className="max-w-[210mm] mx-auto my-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-1000">
                            <ReportSteps />
                        </div>
                    )}
                </div>
            </div>
        </RendererErrorBoundary>
    );
};

export const DocumentRenderer = React.memo(DocumentRendererComponent);

DocumentRenderer.displayName = 'DocumentRenderer';
