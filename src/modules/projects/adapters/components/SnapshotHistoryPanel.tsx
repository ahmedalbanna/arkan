'use client';

import React, { useState } from 'react';
import { useBuilderStore } from '../state/useBuilderStore';
import { useSnapshots } from '../hooks/useSnapshots';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Camera, History, RotateCcw, Trash2, GitCompare, Search, Plus, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/infrastructure/utils/cn';
import { Project } from '../../domain/entities/Project';

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
        <div className="flex flex-col h-full bg-background/40 backdrop-blur-md">
            {/* Header Section */}
            <div className="p-6 border-b border-primary/10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                            <History className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground">Snapshot History</h3>
                            <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest mt-0.5">Manifest Version Control</p>
                        </div>
                    </div>
                    <Badge variant="outline" className="text-[9px] font-black border-primary/20 text-primary">
                        {snapshots.length} SAVED
                    </Badge>
                </div>

                <div className="space-y-3">
                    <div className="relative group">
                        <Input
                            placeholder="SNAPSHOT_LABEL..."
                            value={snapshotName}
                            onChange={(e) => setSnapshotName(e.target.value)}
                            className="bg-muted/5 border-primary/10 text-[11px] font-mono tracking-wider h-10 pr-10 focus-visible:ring-primary/20 uppercase"
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateSnapshot()}
                        />
                        <Button 
                            size="icon"
                            variant="ghost"
                            className="absolute right-1 top-1 h-8 w-8 text-primary hover:bg-primary/10"
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
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                        <Input
                            placeholder="FILTER_HISTORY..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-transparent border-primary/5 text-[10px] font-mono h-8 focus-visible:ring-0 uppercase tracking-widest"
                        />
                    </div>
                </div>
            </div>

            {/* List Section */}
            <ScrollArea className="flex-1">
                <div className="p-4 space-y-3">
                    <AnimatePresence mode="popLayout">
                        {filteredSnapshots.map((snapshot: any) => (
                            <motion.div
                                key={snapshot.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={cn(
                                    "group relative p-4 rounded-xl border transition-all duration-300",
                                    comparisonSnapshotId === snapshot.id 
                                        ? "bg-primary/5 border-primary/30 shadow-[0_0_20px_rgba(var(--primary),0.1)]" 
                                        : "bg-muted/5 border-primary/5 hover:border-primary/20 hover:bg-muted/10"
                                )}
                            >
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-start justify-between">
                                        <div className="min-w-0">
                                            <h4 className="text-[11px] font-black uppercase tracking-wider text-foreground truncate group-hover:text-primary transition-colors">
                                                {snapshot.name}
                                            </h4>
                                            <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-[0.15em] mt-1">
                                                {formatDistanceToNow(new Date(snapshot.created), { addSuffix: true })}
                                            </p>
                                        </div>
                                        {comparisonSnapshotId === snapshot.id && (
                                            <Badge variant="default" className="text-[8px] font-black h-4 px-1.5 animate-pulse">COMPARING</Badge>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-7 text-[9px] font-black uppercase tracking-widest flex-1 border-primary/10 hover:bg-primary/10 hover:text-primary transition-all"
                                            onClick={() => setComparisonSnapshotId(comparisonSnapshotId === snapshot.id ? null : snapshot.id)}
                                        >
                                            <GitCompare className="h-3 w-3 mr-1.5" />
                                            {comparisonSnapshotId === snapshot.id ? 'CANCEL' : 'COMPARE'}
                                        </Button>
                                        
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-7 text-[9px] font-black uppercase tracking-widest border-primary/10 hover:bg-primary/10 hover:text-primary px-3"
                                            onClick={() => handleRestore(snapshot)}
                                        >
                                            <RotateCcw className="h-3 w-3" />
                                        </Button>

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-7 text-[9px] font-black uppercase tracking-widest border-destructive/10 hover:bg-destructive/10 hover:text-destructive px-3"
                                            onClick={() => deleteSnapshot(snapshot.id)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                                
                                {/* Technical Decoration */}
                                <div className="absolute top-2 right-2 opacity-[0.05] group-hover:opacity-10 transition-opacity">
                                    <Camera className="h-8 w-8" />
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
            </ScrollArea>

            {/* Footer Status */}
            <div className="p-4 border-t border-primary/5 bg-muted/5">
                <div className="flex items-center justify-between opacity-40">
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        <span className="text-[8px] font-black uppercase tracking-[0.3em]">Snapshot_Node_Active</span>
                    </div>
                    <span className="text-[8px] font-mono">v1.2.0_BETA</span>
                </div>
            </div>
        </div>
    );
}
