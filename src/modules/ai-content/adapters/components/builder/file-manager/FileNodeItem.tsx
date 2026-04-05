'use client';

import React, { useMemo } from 'react';
import { FileText, Pencil, Trash2, Database, Cpu, Eye, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/infrastructure/utils/cn';
import { ExternalContext } from '@/modules/ai-content/domain/entities/ExternalContext';

/**
 * FileNodeItem — A shared high-fidelity component for source context nodes.
 * Used in SourceManager and UploadManager to represent files or text blocks.
 * 
 * DEFENSIVE MEASURES:
 * 1. Existence Guards: Checks for item presence before rendering metadata.
 * 2. Safe Calculations: Handles null/undefined content for size formatting.
 * 3. Prop Validation: Standardizes labels and fallbacks for missing identifiers.
 */

interface FileNodeItemProps {
    item: ExternalContext | null;
    onEdit?: () => void;
    onDelete?: () => void;
    onView?: () => void;
    className?: string;
}

export function FileNodeItem({
    item,
    onEdit,
    onDelete,
    onView,
    className,
}: FileNodeItemProps) {
    // 1. DATA VALIDATION — Guard against missing item
    const stats = useMemo(() => {
        if (!item) return { typeLabel: 'Unknown', sizeInKb: '0.0' };
        
        try {
            const typeLabel = (item.type || 'context').charAt(0).toUpperCase() + (item.type || 'context').slice(1);
            const content = item.content || '';
            const sizeInKb = (content.length / 1024).toFixed(1);
            return { typeLabel, sizeInKb };
        } catch (e) {
            console.error('[FileNodeItem] Metadata calculation failed:', e);
            return { typeLabel: 'Error', sizeInKb: '0.0' };
        }
    }, [item]);

    if (!item) {
        return (
            <div className={cn("p-4 rounded-2xl border border-dashed border-destructive/20 bg-destructive/5 flex items-center gap-3", className)}>
                <AlertCircle className="h-4 w-4 text-destructive/60" />
                <span className="text-[10px] font-black uppercase tracking-widest text-destructive/60">Node Corrupted</span>
            </div>
        );
    }

    return (
        <div className={cn(
            "group/item relative p-3.5 rounded-2xl border border-primary/5 bg-muted/[0.03] transition-all duration-300 hover:border-primary/20 hover:bg-muted/5",
            className
        )}>
            <div className="flex flex-col gap-3">
                {/* Identity Header */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0 group-hover/item:border-primary/20 transition-colors">
                            <FileText className="h-4.5 w-4.5 text-primary/40 group-hover/item:text-primary/70 transition-all group-hover/item:scale-110" />
                        </div>
                        <div className="min-w-0">
                            <h4 className="text-[12px] font-bold text-foreground/90 truncate uppercase tracking-tight">
                                {item.fileName || 'Untitled Vector'}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                                <div className="flex items-center gap-1 opacity-40">
                                    <div className="h-1 w-1 rounded-full bg-green-500" />
                                    <span className="text-[8px] font-black uppercase tracking-widest tabular-nums">{stats.sizeInKb} KB</span>
                                </div>
                                <span className="text-[8px] text-muted-foreground/30 font-black">•</span>
                                <span className="text-[8px] font-black text-primary/40 uppercase tracking-widest">{stats.typeLabel}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 lg:opacity-0 group-hover/item:opacity-100 transition-opacity">
                        {onView && (
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all active:scale-90"
                                onClick={onView}
                                aria-label="View Vector"
                            >
                                <Eye className="h-3.5 w-3.5" />
                            </Button>
                        )}
                        {onEdit && (
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all active:scale-90"
                                onClick={onEdit}
                                aria-label="Edit Vector"
                            >
                                <Pencil className="h-3.5 w-3.5" />
                            </Button>
                        )}
                        {onDelete && (
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-600 transition-all active:scale-90"
                                onClick={onDelete}
                                aria-label="Delete Vector"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Technical Atmospheric Decoration */}
                <div className="absolute bottom-2 right-2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
                    <Database className="h-8 w-8" />
                </div>
            </div>
        </div>
    );
}
