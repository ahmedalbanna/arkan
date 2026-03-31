'use client';

import React from 'react';
import { Project } from '@/modules/projects/domain/entities/Project';
import { computeDiff } from '@/modules/projects/domain/utils/diff';
import { DiffView } from '@/components/shared/DiffView';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GitCompare, X } from 'lucide-react';

interface SnapshotComparisonProps {
    activeProject: Project;
    comparisonSnapshot: {
        id: string;
        name: string;
        snapshotData: any;
    };
    onClose: () => void;
}

export const SnapshotComparison = ({ activeProject, comparisonSnapshot, onClose }: SnapshotComparisonProps) => {
    const snapshotProject = new Project(comparisonSnapshot.snapshotData);
    const diff = computeDiff(snapshotProject.fullMarkdownContent, activeProject.fullMarkdownContent);

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
                    onClick={onClose}
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
};
