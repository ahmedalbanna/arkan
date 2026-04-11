'use client';

import { BuilderPageSkeleton } from '@/app/builder/loading';
import { A4Page } from '@/components/shared/A4Page';
import { Button } from '@/components/ui/button';
import { useMobile } from '@/hooks/util/use-mobile';
import { cn } from '@/infrastructure/utils/cn';
import { Project } from '@/modules/projects/domain/entities/Project';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronUp, Loader2, RefreshCcw, ShieldAlert } from 'lucide-react';
import React, { Component, ErrorInfo, ReactNode, Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { ReportSteps } from './ReportSteps';
import { type ComparisonSnapshot, type RewriteStyleOption, type SectionMutation } from './types';

// Lazy load heavy components
const LazyCoverPage = lazy(() => import('@/components/shared/CoverPage').then(m => ({ default: m.CoverPage })));
const LazySnapshotComparison = lazy(() => import('./SnapshotComparison').then(m => ({ default: m.SnapshotComparison })));
const LazyBuilderDocument = lazy(() => import('./BuilderDocument').then(m => ({ default: m.BuilderDocument })));

// ── Error Boundary for Document Rendering ────────────────────────────────────────

interface ErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class RendererErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[DocumentRenderer] Rendering pipeline crash:', error, errorInfo);
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isDev = process.env.NODE_ENV === 'development';

      return (
        <div className="max-w-[210mm] mx-auto my-12 p-8 rounded-2xl border-2 border-dashed border-destructive/20 bg-destructive/5 text-center space-y-5 animate-in fade-in zoom-in-95 duration-500">
          <div className="h-16 w-16 mx-auto rounded-xl bg-destructive/10 flex items-center justify-center border border-destructive/20 shadow-lg">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h3 className="text-[16px] font-black uppercase tracking-tight text-destructive">
              Document Rendering Error
            </h3>
            <p className="text-[11px] text-muted-foreground/70 italic font-medium leading-relaxed max-w-md mx-auto">
              The document renderer encountered an unexpected error while processing the project structure.
            </p>
            {isDev && this.state.error && (
              <div className="mt-4 p-4 bg-destructive/10 rounded-xl text-left font-mono text-[10px] overflow-auto max-h-[200px]">
                <p className="font-bold text-destructive mb-2">{this.state.error.name}</p>
                <p className="text-muted-foreground/80">{this.state.error.message}</p>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-[9px] text-muted-foreground/60">Stack trace</summary>
                    <pre className="mt-2 text-[8px] whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                  </details>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center justify-center gap-3">
            <Button
              onClick={this.handleReload}
              variant="outline"
              className="h-10 px-5 rounded-lg border-destructive/20 text-destructive hover:bg-destructive/10 transition-all gap-2 font-black uppercase tracking-widest text-[9px]"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              Reload Workspace
            </Button>
            <Button
              onClick={this.handleReset}
              variant="ghost"
              className="h-10 px-5 rounded-lg text-muted-foreground hover:text-foreground transition-all gap-2 font-black uppercase tracking-widest text-[9px]"
            >
              Try Again
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Loading Fallback ─────────────────────────────────────────────────────────

const LoadingFallback = () => (
  <div className="max-w-[210mm] mx-auto my-12 p-12 rounded-2xl border border-primary/10 bg-muted/5 text-center space-y-4 animate-pulse">
    <Loader2 className="h-10 w-10 mx-auto text-primary/40 animate-spin" />
    <div className="space-y-2">
      <div className="h-4 w-32 bg-primary/10 rounded mx-auto" />
      <div className="h-3 w-48 bg-primary/5 rounded mx-auto" />
    </div>
  </div>
);

// ── Scroll to Top Button ─────────────────────────────────────────────────────

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const isDesktop = !useMobile();

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 500);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (!isDesktop || !isVisible) return null;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      onClick={scrollToTop}
      className="fixed bottom-24 right-6 z-40 p-3 bg-background/90 backdrop-blur-xl border border-primary/20 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 group"
      aria-label="Scroll to top"
    >
      <ChevronUp className="h-5 w-5 text-primary/60 group-hover:text-primary transition-colors" />
    </motion.button>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────

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
  const isDesktop = !useMobile();
  const [errorBoundaryKey, setErrorBoundaryKey] = useState(0);
  const [renderStartTime] = useState(Date.now());

  // Reset error boundary on project change
  useEffect(() => {
    setErrorBoundaryKey(prev => prev + 1);
  }, [project?.id]);

  // Log render performance in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const renderTime = Date.now() - renderStartTime;
      if (renderTime > 100) {
        console.warn(`[DocumentRenderer] Slow render: ${renderTime}ms`);
      }
    }
  }, [renderStartTime]);

  // 1. EXISTENCE GUARD — Prevent rendering if project is not yet hydrated
  if (!project) {
    return <BuilderPageSkeleton />;
  }

  const hasContent = Array.isArray(project.content) && project.content.length > 0;

  // 2. COMPARISON MODE — Isolated view
  if (comparisonSnapshot) {
    return (
      <RendererErrorBoundary key={`comparison-${errorBoundaryKey}`}>
        <Suspense fallback={<LoadingFallback />}>
          <LazySnapshotComparison
            activeProject={project}
            comparisonSnapshot={comparisonSnapshot}
            onClose={onCloseComparison}
          />
        </Suspense>
      </RendererErrorBoundary>
    );
  }

  // 3. PRODUCTION RENDER
  return (
    <>
      <RendererErrorBoundary key={`main-${errorBoundaryKey}`}>
        <div className={cn(
          "flex flex-col items-center",
          isDesktop && "pb-16"
        )}>
          {/* Cover Page with Animation */}
          <AnimatePresence mode="wait">
            {showCoverPage && (
              <motion.div
                key="cover-page"
                initial={{ opacity: 0, y: -24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -24, scale: 0.98 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="w-full mb-8 md:mb-12"
              >
                <Suspense fallback={<LoadingFallback />}>
                  <LazyCoverPage project={project} />
                </Suspense>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Document Body or Setup Guide */}
          <div className="w-full transition-all duration-700">
            {hasContent ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: showCoverPage ? 0.3 : 0 }}
              >
                <A4Page
                  viewMode="single"
                  showControls={isDesktop}
                  pageNumber={1}
                  totalPages={1}
                >
                  <Suspense fallback={<LoadingFallback />}>
                    <LazyBuilderDocument
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
                  </Suspense>
                </A4Page>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-[210mm] mx-auto my-8 w-full"
              >
                <ReportSteps />
              </motion.div>
            )}
          </div>
        </div>
      </RendererErrorBoundary>

      {/* Scroll to Top Button - Desktop */}
      <ScrollToTopButton />

      {/* Performance Indicator - Development */}
      {process.env.NODE_ENV === 'development' && isDesktop && (
        <div className="fixed bottom-4 left-4 z-50 text-[8px] font-mono text-muted-foreground/30 bg-background/80 backdrop-blur-sm px-2 py-1 rounded">
          Render: {Date.now() - renderStartTime}ms
        </div>
      )}
    </>
  );
};

// Optimized memo comparison
const arePropsEqual = (prevProps: DocumentRendererProps, nextProps: DocumentRendererProps) => {
  // Skip deep comparison for mutation objects
  if (prevProps.project?.id !== nextProps.project?.id) return false;
  if (prevProps.viewMode !== nextProps.viewMode) return false;
  if (prevProps.activeChapterId !== nextProps.activeChapterId) return false;
  if (prevProps.showCoverPage !== nextProps.showCoverPage) return false;
  if (prevProps.comparisonSnapshot !== nextProps.comparisonSnapshot) return false;
  if (prevProps.selectedSectionIds.length !== nextProps.selectedSectionIds.length) return false;

  // Check if selected sections changed
  if (prevProps.selectedSectionIds.some(id => !nextProps.selectedSectionIds.includes(id))) return false;
  if (nextProps.selectedSectionIds.some(id => !prevProps.selectedSectionIds.includes(id))) return false;

  return true;
};

export const DocumentRenderer = React.memo(DocumentRendererComponent, arePropsEqual);

DocumentRenderer.displayName = 'DocumentRenderer';
