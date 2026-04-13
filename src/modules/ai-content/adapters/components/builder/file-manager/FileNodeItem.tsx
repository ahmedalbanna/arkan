'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/infrastructure/utils/cn';
import { ExternalContext } from '@/modules/ai-content/domain/entities/ExternalContext';
import {
    AlertCircle,
    Check,
    Clock,
    Database,
    Eye,
    FileArchive,
    FileCode,
    FileImage,
    FileJson,
    FileSpreadsheet,
    FileText,
    HardDrive,
    Link,
    MoreVertical,
    Pencil,
    Trash2,
    User
} from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';

interface FileNodeItemProps {
    item: ExternalContext | null;
    onEdit?: () => void;
    onDelete?: () => void;
    onView?: () => void;
    onDuplicate?: () => void;
    onRename?: () => void;
    className?: string;
    showMetadata?: boolean;
    compact?: boolean;
}

// File type icons mapping
const getFileIcon = (fileName: string, type: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();

    switch (extension) {
        case 'json':
            return <FileJson className="h-4 w-4" />;
        case 'js':
        case 'ts':
        case 'jsx':
        case 'tsx':
        case 'py':
        case 'java':
        case 'cpp':
            return <FileCode className="h-4 w-4" />;
        case 'csv':
        case 'xls':
        case 'xlsx':
            return <FileSpreadsheet className="h-4 w-4" />;
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'gif':
        case 'svg':
            return <FileImage className="h-4 w-4" />;
        case 'zip':
        case 'rar':
        case '7z':
            return <FileArchive className="h-4 w-4" />;
        default:
            return <FileText className="h-4 w-4" />;
    }
};

// Format file size
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

// Format date
const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
};

export function FileNodeItem({
    item,
    onEdit,
    onDelete,
    onView,
    onDuplicate,
    onRename,
    className,
    showMetadata = true,
    compact = false,
}: FileNodeItemProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    // Calculate file statistics
    const stats = useMemo(() => {
        if (!item) return { typeLabel: 'Unknown', sizeInKb: '0.0', sizeBytes: 0, wordCount: 0, lineCount: 0 };

        try {
            const typeLabel = (item.type || 'context').charAt(0).toUpperCase() + (item.type || 'context').slice(1);
            const content = item.content || '';
            const sizeBytes = content.length;
            const sizeInKb = (sizeBytes / 1024).toFixed(1);
            const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
            const lineCount = content.split('\n').length;

            return {
                typeLabel,
                sizeInKb,
                sizeBytes,
                wordCount,
                lineCount,
                fileIcon: getFileIcon(item.fileName || 'file.txt', item.type || 'context')
            };
        } catch (e) {
            console.error('[FileNodeItem] Metadata calculation failed:', e);
            return {
                typeLabel: 'Error',
                sizeInKb: '0.0',
                sizeBytes: 0,
                wordCount: 0,
                lineCount: 0,
                fileIcon: <FileText className="h-4 w-4" />
            };
        }
    }, [item]);

    const handleDelete = useCallback(() => {
        if (!onDelete) return;

        if (true) {
            // Desktop: Show confirmation dialog
            if (window.confirm(`Delete "${item?.fileName}"? This action cannot be undone.`)) {
                setIsDeleting(true);
                onDelete();
                setTimeout(() => setIsDeleting(false), 500);
            }
        } else {

        }
    }, [onDelete, item?.fileName]);

    const handleCopyName = useCallback(async () => {
        if (!item?.fileName) return;
        await navigator.clipboard.writeText(item.fileName);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }, [item?.fileName]);

    // Keyboard shortcut for delete (Delete key)
    React.useEffect(() => {
        if (!item) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Only handle if focused on this item (would need focus management)
            if (e.key === 'Delete' && document.activeElement?.closest(`[data-file-id="${item.id}"]`)) {
                e.preventDefault();
                handleDelete();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [item, handleDelete]);

    if (!item) {
        return (
            <div className={cn(
                "p-4 rounded-2xl border border-dashed border-destructive/20 bg-destructive/5 flex items-center gap-3",
                className
            )}>
                <AlertCircle className="h-4 w-4 text-destructive/60" />
                <span className="text-[10px] font-black uppercase tracking-widest text-destructive/60">Node Corrupted</span>
            </div>
        );
    }

    return (
        <div
            data-file-id={item.id}
            className={cn(
                "group/item relative rounded-2xl border transition-all duration-300",
                "border-primary/5 bg-muted/[0.03] hover:border-primary/20 hover:bg-muted/5",
                "hover:shadow-md",
                compact ? "p-2" : "p-3.5",
                isDeleting && "animate-pulse opacity-50",
                className
            )}
        >
            <div className="flex flex-col gap-3">
                {/* Identity Header */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* File Icon with type badge */}
                        <div className="relative shrink-0">
                            <div className={cn(
                                "rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center transition-all",
                                "group-hover/item:border-primary/20 group-hover/item:scale-105",
                                compact ? "h-8 w-8" : "h-9 w-9"
                            )}>
                                {stats.fileIcon}
                            </div>
                            {/* Type indicator dot */}
                            <div className={cn(
                                "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background",
                                item.type === 'context' && "bg-blue-500",
                                item.type === 'example' && "bg-green-500",
                                item.type === 'guidelines' && "bg-purple-500",
                                item.type === 'question' && "bg-orange-500",
                                item.type === 'textbook' && "bg-cyan-500"
                            )} />
                        </div>

                        {/* File Info */}
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h4 className={cn(
                                    "font-bold text-foreground/90 truncate",
                                    compact ? "text-[11px]" : "text-[12px]",
                                    "hover:text-primary transition-colors cursor-pointer"
                                )}
                                    onClick={onView}
                                    title={item.fileName}
                                >
                                    {item.fileName || 'Untitled Vector'}
                                </h4>
                                {(
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={handleCopyName}
                                                    className="h-5 w-5 rounded-md opacity-0 group-hover/item:opacity-100 transition-opacity"
                                                >
                                                    {isCopied ? (
                                                        <Check className="h-2.5 w-2.5 text-green-500" />
                                                    ) : (
                                                        <Link className="h-2.5 w-2.5 text-muted-foreground/40" />
                                                    )}
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="text-[8px]">
                                                Copy file name
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                            </div>

                            {/* Metadata Row */}
                            {showMetadata && (
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <div className="flex items-center gap-1">
                                        <HardDrive className="h-2.5 w-2.5 text-muted-foreground/30" />
                                        <span className="text-[8px] font-mono text-muted-foreground/40">
                                            {stats.sizeInKb} KB
                                        </span>
                                    </div>

                                    <span className="text-[7px] text-muted-foreground/20">•</span>

                                    <div className="flex items-center gap-1">
                                        <FileText className="h-2.5 w-2.5 text-muted-foreground/30" />
                                        <span className="text-[8px] font-mono text-muted-foreground/40">
                                            {stats.wordCount.toLocaleString()} words
                                        </span>
                                    </div>

                                    {stats.lineCount > 0 && (
                                        <>
                                            <span className="text-[7px] text-muted-foreground/20">•</span>
                                            <div className="flex items-center gap-1">
                                                <span className="text-[8px] font-mono text-muted-foreground/40">
                                                    {stats.lineCount} lines
                                                </span>
                                            </div>
                                        </>
                                    )}

                                    <span className="text-[7px] text-muted-foreground/20">•</span>

                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "h-4 text-[7px] font-black uppercase tracking-wider",
                                            "border-primary/20 bg-primary/5 text-primary/60"
                                        )}
                                    >
                                        {stats.typeLabel}
                                    </Badge>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons - Desktop */}
                    {!compact && (
                        <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                            <TooltipProvider>
                                {onView && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
                                                onClick={onView}
                                            >
                                                <Eye className="h-3.5 w-3.5" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="text-[8px]">
                                            View content
                                        </TooltipContent>
                                    </Tooltip>
                                )}

                                {onEdit && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
                                                onClick={onEdit}
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="text-[8px]">
                                            Edit
                                        </TooltipContent>
                                    </Tooltip>
                                )}

                                {onDelete && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                                                onClick={handleDelete}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="text-[8px]">
                                            Delete • Del
                                        </TooltipContent>
                                    </Tooltip>
                                )}
                            </TooltipProvider>
                        </div>
                    )}

                    {/* Dropdown Menu for compact or mobile */}
                    {(compact) && (onView || onEdit || onDelete || onDuplicate || onRename) && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded-lg shrink-0"
                                >
                                    <MoreVertical className="h-3.5 w-3.5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                                {onView && (
                                    <DropdownMenuItem onClick={onView} className="text-[10px] font-medium">
                                        <Eye className="h-3 w-3 mr-2" />
                                        View
                                    </DropdownMenuItem>
                                )}
                                {onEdit && (
                                    <DropdownMenuItem onClick={onEdit} className="text-[10px] font-medium">
                                        <Pencil className="h-3 w-3 mr-2" />
                                        Edit
                                    </DropdownMenuItem>
                                )}
                                {onRename && (
                                    <DropdownMenuItem onClick={onRename} className="text-[10px] font-medium">
                                        <FileText className="h-3 w-3 mr-2" />
                                        Rename
                                    </DropdownMenuItem>
                                )}
                                {onDuplicate && (
                                    <DropdownMenuItem onClick={onDuplicate} className="text-[10px] font-medium">
                                        <Copy className="h-3 w-3 mr-2" />
                                        Duplicate
                                    </DropdownMenuItem>
                                )}
                                {(onView || onEdit || onRename || onDuplicate) && onDelete && (
                                    <DropdownMenuSeparator />
                                )}
                                {onDelete && (
                                    <DropdownMenuItem
                                        onClick={handleDelete}
                                        className="text-[10px] font-medium text-destructive focus:text-destructive"
                                    >
                                        <Trash2 className="h-3 w-3 mr-2" />
                                        Delete
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                {/* Additional Metadata for Desktop */}
                {showMetadata && !compact && (
                    <div className="flex items-center gap-3 text-[7px] text-muted-foreground/30 border-t border-primary/5 pt-2 mt-1">
                        <div className="flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" />
                            <span>Added {formatDate(item.createdAt)}</span>
                        </div>
                        {item.updatedAt && item.updatedAt !== item.createdAt && (
                            <div className="flex items-center gap-1">
                                <span>•</span>
                                <User className="h-2.5 w-2.5" />
                                <span>Modified {formatDate(item.updatedAt)}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Technical Atmospheric Decoration */}
                <div className="absolute bottom-2 right-2 opacity-[0.02] group-hover/item:opacity-[0.05] transition-opacity pointer-events-none">
                    <Database className="h-8 w-8" />
                </div>
            </div>
        </div>
    );
}

// Missing Copy icon
const Copy = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
);
