'use client';

import React from 'react';
import { Project } from '@/modules/projects/domain/entities/Project';
import { computeDiff } from '@/modules/projects/domain/utils/diff';
import { DiffView } from '@/components/shared/DiffView';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GitCompare, X } from 'lucide-react';
import { type ComparisonSnapshot } from './types';

interface SnapshotComparisonProps {
    activeProject: Project;
    comparisonSnapshot: ComparisonSnapshot;
    onClose: () => void;
}

const SnapshotComparisonComponent = ({ activeProject, comparisonSnapshot, onClose }: SnapshotComparisonProps) => {
    const snapshotProject = new Project(comparisonSnapshot.snapshotData as any);
    const diff = computeDiff(snapshotProject.fullMarkdownContent, activeProject.fullMarkdownContent);

    return (
        <div className="flex flex-col h-full min-h-0 bg-background/40 backdrop-blur-xl border border-border/40 rounded-2xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-background/60 backdrop-blur-2xl">
                <div className="flex items-center gap-4">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                        <GitCompare className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-[13px] font-black uppercase tracking-[0.18em] text-foreground">
                            Snapshot Comparison
                        </h2>
                        <p className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider mt-0.5">
                            Comparing current with <span className="text-primary font-bold">{comparisonSnapshot.name}</span>
                        </p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onClose}
                    className="h-8 px-3.5 text-[9px] font-black uppercase tracking-[0.18em] border-border/40 hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all rounded-lg gap-1.5"
                >
                    <X className="h-3.5 w-3.5" />
                    Exit
                </Button>
            </div>

            {/* Diff body */}
            <ScrollArea className="flex-1">
                <div className="p-10 max-w-5xl mx-auto">
                    <div className="mb-6 flex items-center gap-2">
                        <Badge
                            variant="outline"
                            className="text-[9px] font-black tracking-[0.18em] border-green-500/30 text-green-600 dark:text-green-400 bg-green-500/5 uppercase"
                        >
                            + Added
                        </Badge>
                        <Badge
                            variant="outline"
                            className="text-[9px] font-black tracking-[0.18em] border-destructive/30 text-destructive bg-destructive/5 uppercase"
                        >
                            − Removed
                        </Badge>
                    </div>
                    <DiffView diff={diff} />
                </div>
            </ScrollArea>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-border/40 bg-muted/5 flex items-center justify-between opacity-50">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    Arkan Diff Engine · v1.0
                </span>
                <span className="text-[9px] font-mono text-muted-foreground/60">LCS algorithm</span>
            </div>
        </div>
    );
};

export const SnapshotComparison = React.memo(SnapshotComparisonComponent);

SnapshotComparison.displayName = 'SnapshotComparison';
