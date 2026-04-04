'use client';

import React, { useState } from 'react';
import { useBuilderStore } from '../state/useBuilderStore';
import { useSnapshots } from '../hooks/useSnapshots';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Camera, History, RotateCcw, Trash2, GitCompare, Search, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/infrastructure/utils/cn';
import { SidebarContainer } from '@/modules/ai-content/adapters/components/builder/layout/SidebarContainer';

export default function SnapshotHistoryPanel() {
    const { project, loadProject, setComparisonSnapshotId, comparisonSnapshotId } = useBuilderStore();
    const { snapshots, isLoading, createSnapshot, isCreating, deleteSnapshot } = useSnapshots(project?.id);
    const [snapshotName, setSnapshotName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const handleCreateSnapshot = () => {
        if (!project || !snapshotName.trim()) return;
        createSnapshot({
            name: snapshotName.trim(),
            snapshotData: project.toStateObject()
        });
        setSnapshotName('');
    };

    const handleRestore = (snapshot: any) => {
        if (window.confirm('Are you sure you want to restore this snapshot? Current unsaved changes will be lost.')) {
            loadProject(snapshot.snapshotData);
        }
    };

    const filteredSnapshots = snapshots.filter((s: any) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <SidebarContainer
            title="Snapshot History"
            icon={<History className="h-3.5 w-3.5" />}
            actions={
                <Badge variant="outline" className="h-5 text-[9px] font-black border-primary/20 bg-primary/5 text-primary tabular-nums px-2 rounded-full">
                    {snapshots.length} SAVED
                </Badge>
            }
        >
            <div className="space-y-8 relative">
                {/* Control Zone */}
                <div className="space-y-4">
                    <div className="relative group">
                        <Input
                            placeholder="SNAPSHOT_LABEL..."
                            value={snapshotName}
                            onChange={(e) => setSnapshotName(e.target.value)}
                            className="bg-muted/5 border-border/40 text-[11px] font-mono tracking-wider h-10 pr-10 focus-visible:ring-primary/20 uppercase rounded-xl shadow-inner transition-all"
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateSnapshot()}
                        />
                        <Button
                            size="icon"
                            variant="ghost"
                            className="absolute right-1 top-1 h-8 w-8 text-primary hover:bg-primary/5 rounded-lg transition-all"
                            onClick={handleCreateSnapshot}
                            disabled={!snapshotName.trim() || isCreating}
                        >
                            {isCreating ? (
                                <div className="h-3 w-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Plus className="h-4 w-4" />
                            )}
                        </Button>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/40" />
                        <Input
                            placeholder="FILTER_HISTORY..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-transparent border-border/20 text-[9px] font-mono h-8 focus-visible:ring-0 uppercase tracking-[0.2em] rounded-lg"
                        />
                    </div>
                </div>

                {/* List Zone */}
                <div className="space-y-3 relative">
                    <div className="absolute left-[-1.25rem] top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/5 to-transparent" />
                    <AnimatePresence mode="popLayout">
                        {filteredSnapshots.map((snapshot: any) => (
                            <motion.div
                                key={snapshot.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={cn(
                                    "group relative p-3 rounded-xl border transition-all duration-300 hover:translate-x-0.5 shadow-sm",
                                    comparisonSnapshotId === snapshot.id
                                        ? "bg-primary/[0.03] border-primary/30 shadow-[0_0_20px_rgba(var(--primary),0.08)] ring-1 ring-primary/10"
                                        : "bg-card/40 border-border/40 hover:border-primary/20 hover:bg-muted/5"
                                )}
                            >
                                <div className="flex flex-col gap-2.5">
                                    <div className="flex items-start justify-between">
                                        <div className="min-w-0">
                                            <h4 className="text-[12px] font-bold tracking-tight text-foreground truncate group-hover:text-primary transition-colors uppercase">
                                                {snapshot.name}
                                            </h4>
                                            <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] mt-0.5">
                                                {formatDistanceToNow(new Date(snapshot.created), { addSuffix: true })}
                                            </p>
                                        </div>
                                        {comparisonSnapshotId === snapshot.id && (
                                            <Badge variant="default" className="text-[8px] font-black h-4 px-1.5 animate-pulse bg-primary/20 text-primary border-primary/20 shadow-inner">COMPARING</Badge>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1.5 pt-1.5 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-7 text-[9px] font-black uppercase tracking-[0.2em] flex-1 border-primary/10 hover:bg-primary/10 hover:text-primary transition-all rounded-lg"
                                            onClick={() => setComparisonSnapshotId(comparisonSnapshotId === snapshot.id ? null : snapshot.id)}
                                        >
                                            <GitCompare className="h-3 w-3 mr-1.5" />
                                            {comparisonSnapshotId === snapshot.id ? 'CANCEL' : 'COMPARE'}
                                        </Button>

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-7 text-[9px] font-black uppercase tracking-[0.2em] border-primary/10 hover:bg-primary/10 hover:text-primary px-2.5 rounded-lg"
                                            onClick={() => handleRestore(snapshot)}
                                        >
                                            <RotateCcw className="h-3 w-3" />
                                        </Button>

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-7 text-[9px] font-black uppercase tracking-[0.2em] border-destructive/10 hover:bg-destructive/10 hover:text-destructive px-2.5 rounded-lg"
                                            onClick={() => deleteSnapshot(snapshot.id)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Technical Decoration */}
                                <div className="absolute top-2 right-2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                    <Camera className="h-7 w-7" />
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {filteredSnapshots.length === 0 && !isLoading && (
                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
                            <History className="h-10 w-10 mb-4 stroke-[1]" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">No Snapshots Found</p>
                            <p className="text-[9px] font-medium uppercase tracking-widest mt-1">Capture a moment in history</p>
                        </div>
                    )}
                </div>
            </div>
        </SidebarContainer>
    );
}
