'use client';

import { DiffView } from '@/components/shared/DiffView';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Project } from '@/modules/projects/domain/entities/Project';
import { computeDiff } from '@/modules/projects/domain/utils/diff';
import { ArrowLeft, ArrowRight, Calendar, Check, Clock, Copy, Download, GitBranch, GitCompare, ShieldAlert, X } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { type ComparisonSnapshot } from './types';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';

interface SnapshotComparisonProps {
    activeProject: Project;
    comparisonSnapshot: ComparisonSnapshot;
    onClose: () => void;
    onNavigate?: (direction: 'prev' | 'next') => void;
    hasPrev?: boolean;
    hasNext?: boolean;
}

const SnapshotComparisonComponent = ({
    activeProject,
    comparisonSnapshot,
    onClose,
    onNavigate,
    hasPrev,
    hasNext
}: SnapshotComparisonProps) => {
    const [copied, setCopied] = useState(false);
    const [showSideBySide, setShowSideBySide] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Diff calculation
    const diffData = useMemo(() => {
        if (!activeProject || !comparisonSnapshot?.snapshotData) return null;

        try {
            const data = comparisonSnapshot.snapshotData as any;
            if (!data.id || !Array.isArray(data.content)) {
                console.warn('[SnapshotComparison] Snapshot data integrity check failed.');
                return null;
            }

            const snapshotProject = new Project(data);
            const sourceMarkdown = snapshotProject.fullMarkdownContent || '';
            const targetMarkdown = activeProject.fullMarkdownContent || '';

            const diff = computeDiff(sourceMarkdown, targetMarkdown);

            // Calculate stats
            const additions = diff.filter(part => part.type === 'added').reduce((acc, part) => acc + part.value.length, 0);
            const deletions = diff.filter(part => part.type === 'removed').reduce((acc, part) => acc + part.value.length, 0);

            return {
                diff,
                snapshotName: comparisonSnapshot.name || 'Historical Snapshot',
                snapshotDate: comparisonSnapshot.createdAt,
                additions,
                deletions,
                totalChanges: additions + deletions
            };
        } catch (e) {
            console.error('[SnapshotComparison] Diff orchestration failure:', e);
            return null;
        }
    }, [activeProject, comparisonSnapshot]);

    const handleCopyDiff = useCallback(async () => {
        if (!diffData) return;
        const fullText = diffData.diff.map(part => part.value).join('');
        await navigator.clipboard.writeText(fullText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [diffData]);

    const handleDownloadDiff = useCallback(() => {
        if (!diffData) return;
        const fullText = diffData.diff.map(part => part.value).join('');
        const blob = new Blob([fullText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `diff-${comparisonSnapshot.name || 'snapshot'}-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [diffData, comparisonSnapshot.name]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft' && hasPrev && onNavigate) {
                e.preventDefault();
                onNavigate('prev');
            } else if (e.key === 'ArrowRight' && hasNext && onNavigate) {
                e.preventDefault();
                onNavigate('next');
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [hasPrev, hasNext, onNavigate, onClose]);

    if (!diffData) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] p-12 text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
                <div className="h-20 w-20 rounded-2xl bg-destructive/5 border border-dashed border-destructive/20 flex items-center justify-center">
                    <ShieldAlert className="h-10 w-10 text-destructive/40" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-[14px] font-black uppercase tracking-[0.2em] text-destructive/80">Comparison Vector Failure</h3>
                    <p className="text-[11px] text-muted-foreground/60 italic font-medium leading-relaxed max-w-sm">
                        The diff engine was unable to synthesize a comparison between the current manifest and the selected historical node.
                    </p>
                </div>
                <Button variant="ghost" onClick={onClose} className="text-[9px] font-black uppercase tracking-widest hover:bg-destructive/5 hover:text-destructive">
                    Abort Comparison
                </Button>
            </div>
        );
    }

    const snapshotDate = diffData.snapshotDate ? new Date(diffData.snapshotDate) : null;
    const currentDate = new Date();

    return (
        <div className="flex flex-col h-full min-h-0 bg-background/95 backdrop-blur-sm border border-border/40 rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-primary/10 bg-primary/[0.02] shrink-0">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <GitCompare className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-[14px] font-black uppercase tracking-tight">
                            Version Comparison
                        </h2>
                        <div className="flex items-center gap-2 mt-0.5">
                            <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                            <p className="text-[8px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">
                                Comparing current with <span className="text-primary">{diffData.snapshotName}</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Navigation Buttons */}
                    {onNavigate && (
                        <>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onNavigate('prev')}
                                            disabled={!hasPrev}
                                            className="h-8 w-8 rounded-lg"
                                        >
                                            <ArrowLeft className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="text-[8px]">
                                        Previous snapshot • ←
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onNavigate('next')}
                                            disabled={!hasNext}
                                            className="h-8 w-8 rounded-lg"
                                        >
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="text-[8px]">
                                        Next snapshot • →
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </>
                    )}

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleDownloadDiff}
                                    className="h-8 w-8 rounded-lg"
                                >
                                    <Download className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-[8px]">
                                Download diff
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleCopyDiff}
                                    className="h-8 w-8 rounded-lg"
                                >
                                    {copied ? (
                                        <Check className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-[8px]">
                                Copy diff
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="px-6 py-3 border-b border-primary/10 bg-muted/5 flex items-center justify-between text-[8px]">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-green-600 dark:text-green-400">+{diffData.additions} additions</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                        <span className="text-red-600 dark:text-red-400">-{diffData.deletions} deletions</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <GitBranch className="h-3 w-3 text-muted-foreground/40" />
                        <span className="text-muted-foreground/40">{diffData.totalChanges} total changes</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {snapshotDate && (
                        <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground/40" />
                            <span className="font-mono">
                                Snapshot: {format(snapshotDate, 'MMM d, yyyy')}
                            </span>
                        </div>
                    )}
                    <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground/40" />
                        <span className="font-mono">
                            Current: {format(currentDate, 'MMM d, yyyy')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Diff Content */}
            <ScrollArea className="flex-1 bg-background/20">
                <div className="p-6 max-w-5xl mx-auto">
                    {/* Legend */}
                    <div className="flex items-center gap-4 mb-4 pb-3 border-b border-primary/10">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="h-5 px-2 text-[8px] font-black tracking-wider bg-green-500/5 border-green-500/20 text-green-600">
                                + Addition
                            </Badge>
                            <Badge variant="outline" className="h-5 px-2 text-[8px] font-black tracking-wider bg-red-500/5 border-red-500/20 text-red-600">
                                - Deletion
                            </Badge>
                            <span className="text-[8px] text-muted-foreground/40">
                                Hover over lines to copy
                            </span>
                        </div>
                    </div>

                    <DiffView diff={diffData.diff} showLineNumbers={true} />
                </div>
            </ScrollArea>

            {/* Footer */}
            <footer className="px-6 py-2.5 border-t border-primary/10 bg-muted/5 flex items-center justify-between text-[7px] text-muted-foreground/40 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-primary/30" />
                    <span className="font-black uppercase tracking-[0.25em]">Diff Engine • Spectral LCS v2</span>
                </div>
                <div className="flex items-center gap-3">
                    <span>← → Navigate snapshots</span>
                    <span>•</span>
                    <span>Esc to close</span>
                    <span>•</span>
                    <span>Build 2.5.0</span>
                </div>
            </footer>
        </div>
    );
};

export const SnapshotComparison = React.memo(SnapshotComparisonComponent);

SnapshotComparison.displayName = 'SnapshotComparison';
