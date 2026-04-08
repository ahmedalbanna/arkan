'use client';

import React, { useMemo } from 'react';
import { Project } from '@/modules/projects/domain/entities/Project';
import { computeDiff } from '@/modules/projects/domain/utils/diff';
import { DiffView } from '@/components/shared/DiffView';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GitCompare, X, AlertCircle, ShieldAlert } from 'lucide-react';
import { type ComparisonSnapshot } from './types';

/**
 * SnapshotComparison — Visual diff interface for document version history.
 * Performs deep spectral comparison between current manifest and historical snapshots.
 * 
 * DEFENSIVE MEASURES:
 * 1. Data Validation: Verifies snapshot integrity before entity instantiation.
 * 2. Diff Containment: Wraps LCS algorithm in try-catch to prevent malformed crash.
 * 3. Existence Guards: Handles missing project content or broken snapshots gracefully.
 * 4. UX Safety: Provides explicit fallback UI for diff calculation failures.
 */

interface SnapshotComparisonProps {
    activeProject: Project;
    comparisonSnapshot: ComparisonSnapshot;
    onClose: () => void;
}

const SnapshotComparisonComponent = ({ activeProject, comparisonSnapshot, onClose }: SnapshotComparisonProps) => {
    
    // 1. DATA VALIDATION — Guarded snapshot reconstruction
    const diffData = useMemo(() => {
        if (!activeProject || !comparisonSnapshot?.snapshotData) return null;

        try {
            // Validate essential fields before instantiation
            const data = comparisonSnapshot.snapshotData as any;
            if (!data.id || !Array.isArray(data.content)) {
                console.warn('[SnapshotComparison] Snapshot data integrity check failed.');
                return null;
            }

            const snapshotProject = new Project(data);
            const sourceMarkdown = snapshotProject.fullMarkdownContent || '';
            const targetMarkdown = activeProject.fullMarkdownContent || '';

            const diff = computeDiff(sourceMarkdown, targetMarkdown);
            return { diff, snapshotName: comparisonSnapshot.name || 'Historical Snapshot' };
        } catch (e) {
            console.error('[SnapshotComparison] Diff orchestration failure:', e);
            return null;
        }
    }, [activeProject, comparisonSnapshot]);

    // 2. RENDER GUARDS — System Error Fallback
    if (!diffData) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] p-12 text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
                <div className="h-20 w-20 rounded-[28px] bg-destructive/5 border border-dashed border-destructive/20 flex items-center justify-center">
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

    return (
        <div className="flex flex-col h-full min-h-0 bg-background/40 backdrop-blur-3xl border border-border/40 rounded-[32px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-700">
            {/* HUD Header — High Fidelity */}
            <div className="flex items-center justify-between px-10 py-6 border-b border-primary/10 bg-primary/[0.02] backdrop-blur-2xl relative overflow-hidden shrink-0">
                {/* Dot-grid atmosphere — Standardized Workspace Alignment (28px) */}
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(circle_at_center,_var(--primary)_1px,_transparent_1px)] bg-[size:28px_28px]" />
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner group/icon">
                        <GitCompare className="h-6 w-6 text-primary group-hover:rotate-12 transition-transform duration-500" />
                    </div>
                    <div>
                        <h2 className="text-[16px] font-black uppercase tracking-tight text-foreground/90 leading-none">
                            Version Comparison
                        </h2>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="h-1 w-1 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
                            <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.25em]">
                                Syncing current with <span className="text-primary">{diffData.snapshotName}</span>
                            </p>
                        </div>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onClose}
                    className="h-10 px-6 text-[10px] font-black uppercase tracking-[0.2em] border-primary/10 hover:bg-red-500/5 hover:text-red-600 hover:border-red-500/20 transition-all rounded-xl gap-2 shadow-sm"
                >
                    <X className="h-4 w-4" />
                    Exit Sync
                </Button>
            </div>

            {/* Diff Core */}
            <ScrollArea className="flex-1 bg-background/20 relative group">
                <div className="p-12 max-w-5xl mx-auto space-y-10 relative z-10">
                    {/* Depth architectural line */}
                    <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/5 to-transparent" />

                    <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-500">
                        <Badge
                            variant="outline"
                            className="h-6 px-3 text-[9px] font-black tracking-[0.2em] border-green-500/30 text-green-600 dark:text-green-400 bg-green-500/5 uppercase rounded-full shadow-inner ring-1 ring-inset ring-green-500/10"
                        >
                            + Neural Addition
                        </Badge>
                        <Badge
                            variant="outline"
                            className="h-6 px-3 text-[9px] font-black tracking-[0.2em] border-destructive/30 text-destructive bg-destructive/5 uppercase rounded-full shadow-inner ring-1 ring-inset ring-destructive/10"
                        >
                            − Node Removal
                        </Badge>
                    </div>
                    
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-200">
                        <DiffView diff={diffData.diff} />
                    </div>
                </div>
            </ScrollArea>

            {/* Stable Version Footer */}
            <footer className="px-10 py-4 border-t border-primary/10 bg-background/40 backdrop-blur-xl flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="h-1 w-1 rounded-full bg-primary/30 shadow-[0_0_8px_rgba(var(--primary),0.4)]" />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Diff Engine STABLE</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-[9px] font-mono text-muted-foreground/30 uppercase tracking-widest">Algorithm: Spectral LCS v2</span>
                    <span className="text-[9px] font-bold text-muted-foreground/20 tabular-nums uppercase">Build 2.4.0</span>
                </div>
            </footer>
        </div>
    );
};

export const SnapshotComparison = React.memo(SnapshotComparisonComponent);

SnapshotComparison.displayName = 'SnapshotComparison';
