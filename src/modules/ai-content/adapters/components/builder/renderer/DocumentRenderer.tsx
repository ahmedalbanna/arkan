'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { A4Page } from '@/components/shared/A4Page';
import { Document } from '@/modules/ai-content/adapters/components/report-mode/Document';
import { SnapshotComparison } from '@/modules/ai-content/adapters/components/report-mode/SnapshotComparison';
import { CoverPage } from '@/components/shared/CoverPage';
import { ReportSteps } from '@/modules/ai-content/adapters/components/report-mode/ReportSteps';
import { Project } from '@/modules/projects/domain/entities/Project';

interface DocumentRendererProps {
    project: Project | null;
    viewMode: 'edit' | 'preview';
    activeChapterId: string | null;
    setActiveChapterId: (id: string | null) => void;
    selectedSectionIds: string[];
    handleActiveSectionChange: (id: string | null, multiSelect?: boolean) => void;
    showCoverPage: boolean;
    comparisonSnapshot: any;
    onCloseComparison: () => void;
    updateProjectFromMarkdown: (markdown: string) => void;
    summarizeMutation: any;
    expandMutation: any;
    rewriteMutation: any;
    rewriteStyles: { label: string; style: string }[];
}

export const DocumentRenderer: React.FC<DocumentRendererProps> = ({
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
    const hasContent = project?.content && project.content.length > 0;

    if (comparisonSnapshot && project) {
        return (
            <SnapshotComparison
                activeProject={project}
                comparisonSnapshot={comparisonSnapshot}
                onClose={onCloseComparison}
            />
        );
    }

    return (
        <div className="flex flex-col items-center">
            {/* Cover Page — animated entry/exit */}
            <AnimatePresence>
                {showCoverPage && project && (
                    <motion.div
                        key="cover-page"
                        initial={{ opacity: 0, y: -24, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -24, scale: 0.95 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="w-full mb-12"
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
                <div className="max-w-[210mm] mx-auto my-8 w-full transition-all duration-700">
                    <ReportSteps />
                </div>
            )}
        </div>
    );
};
