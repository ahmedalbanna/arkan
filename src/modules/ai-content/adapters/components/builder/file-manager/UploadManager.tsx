'use client';

import { AtmosphericGrid } from '@/components/shared/AtmosphericGrid';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLocalization } from "@/context/LocalizationContext";
import { useBuilderStore, useToast } from '@/hooks';
import { cn } from "@/infrastructure/utils/cn";
import { generateRandomId } from '@/infrastructure/utils/randomId';
import { ExternalContextType } from '@/modules/ai-content/domain/entities/ControlTypes';
import {
    AtomIcon,
    Check,
    ChevronDown,
    ChevronUp,
    Database,
    FileArchive,
    FileCode,
    FileImage,
    FileJson,
    FileSpreadsheet,
    FileText,
    Filter,
    HardDrive,
    Layers,
    LayoutGrid,
    Plus,
    Search,
    ShieldAlert,
    Trash2,
    UploadCloud,
    X
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { SidebarContainer } from '../layout/SidebarContainer';
import { FileNodeItem } from './FileNodeItem';
import { SourceAnalyst } from './SourceAnalyst';

// File type icons and configurations
const getFileConfig = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const configs: Record<string, { icon: React.ReactNode; color: string; accept: string }> = {
        pdf: { icon: <FileText className="h-4 w-4" />, color: "text-red-500", accept: "PDF Document" },
        doc: { icon: <FileText className="h-4 w-4" />, color: "text-blue-500", accept: "Word Document" },
        docx: { icon: <FileText className="h-4 w-4" />, color: "text-blue-500", accept: "Word Document" },
        txt: { icon: <FileText className="h-4 w-4" />, color: "text-gray-500", accept: "Text File" },
        md: { icon: <FileCode className="h-4 w-4" />, color: "text-green-500", accept: "Markdown" },
        json: { icon: <FileJson className="h-4 w-4" />, color: "text-yellow-500", accept: "JSON Data" },
        csv: { icon: <FileSpreadsheet className="h-4 w-4" />, color: "text-green-500", accept: "CSV Data" },
        xls: { icon: <FileSpreadsheet className="h-4 w-4" />, color: "text-green-500", accept: "Excel Spreadsheet" },
        xlsx: { icon: <FileSpreadsheet className="h-4 w-4" />, color: "text-green-500", accept: "Excel Spreadsheet" },
        png: { icon: <FileImage className="h-4 w-4" />, color: "text-purple-500", accept: "Image" },
        jpg: { icon: <FileImage className="h-4 w-4" />, color: "text-purple-500", accept: "Image" },
        jpeg: { icon: <FileImage className="h-4 w-4" />, color: "text-purple-500", accept: "Image" },
        webp: { icon: <FileImage className="h-4 w-4" />, color: "text-purple-500", accept: "Image" },
        zip: { icon: <FileArchive className="h-4 w-4" />, color: "text-orange-500", accept: "Archive" },
    };
    return configs[extension || ''] || { icon: <FileText className="h-4 w-4" />, color: "text-gray-500", accept: "File" };
};

// Format file size
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

// Context Inspector Component
function ContextInspectorHUD({ item, isOpen, onClose }: { item: { fileName: string, content: string, size?: number } | null, isOpen: boolean, onClose: () => void }) {

    if (!item) return null;

    const stats = {
        characters: item.content.length,
        words: item.content.split(/\s+/).filter(w => w.length > 0).length,
        lines: item.content.split('\n').length,
        size: item.size || item.content.length,
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className={cn(
                "p-0 border-primary/10 shadow-2xl rounded-[32px] bg-background/95 backdrop-blur-xl overflow-hidden flex flex-col",
                "max-w-5xl h-[85vh]"
            )}>
                <DialogHeader className="px-6 py-4 border-b border-primary/10 bg-primary/5 shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <DialogTitle className="text-[13px] font-black uppercase tracking-tight">{item.fileName}</DialogTitle>
                                <p className="text-[9px] uppercase tracking-widest text-muted-foreground/60 font-bold">Content Analysis</p>
                            </div>
                        </div>
                        {(
                            <div className="flex items-center gap-3 text-[8px] text-muted-foreground/40">
                                <span>{stats.characters.toLocaleString()} chars</span>
                                <span>•</span>
                                <span>{stats.words.toLocaleString()} words</span>
                                <span>•</span>
                                <span>{stats.lines} lines</span>
                            </div>
                        )}
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-hidden relative">
                    <AtmosphericGrid opacity={0.02} size={28} />
                    <ScrollArea className="h-full w-full custom-scrollbar">
                        <div className="p-6">
                            <pre className="p-6 bg-muted/30 border border-primary/10 rounded-2xl overflow-auto max-h-[60vh] text-[12px] font-mono leading-relaxed shadow-inner whitespace-pre-wrap">
                                {item.content || 'No content detected.'}
                            </pre>
                        </div>
                    </ScrollArea>
                </div>

                <div className="px-6 py-3 bg-primary/[0.02] border-t border-primary/10 flex justify-between items-center shrink-0">
                    <span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground/40">Context Analysis Pipeline</span>
                    <Button variant="ghost" onClick={onClose} className="text-[9px] font-black uppercase tracking-widest rounded-lg h-8 px-4">
                        Close Inspector
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function UploadManager() {
    const { t } = useLocalization();
    const { toast } = useToast();
    const { project, updateProject, selectedFileId } = useBuilderStore();

    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
    const [textInput, setTextInput] = useState('');
    const [textFileName, setTextFileName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [typeFilter, setTypeFilter] = useState<ExternalContextType | 'all'>('all');
    const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
    const [inspectItem, setInspectItem] = useState<{ fileName: string, content: string, size?: number } | null>(null);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const searchInputRef = useRef<HTMLInputElement>(null);

    const externalContext = project?.externalContext || [];
    // Apply filters and sorting
    const filteredContext = useMemo(() => {
        let filtered = [...externalContext];

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(item =>
                item.fileName.toLowerCase().includes(query) ||
                (item.content && item.content.toLowerCase().includes(query))
            );
        }

        // Apply type filter
        if (typeFilter !== 'all') {
            filtered = filtered.filter(item => item.type === typeFilter);
        }

        // Apply sorting
        switch (sortBy) {
            case 'name':
                filtered.sort((a, b) => a.fileName.localeCompare(b.fileName));
                break;
            case 'size':
                filtered.sort((a, b) => (b.content?.length || 0) - (a.content?.length || 0));
                break;
            case 'date':
                filtered.sort((a, b) => (b.updatedAt || b.createdAt || '').localeCompare(a.updatedAt || a.createdAt || ''));
                break;
        }

        return filtered;
    }, [externalContext, searchQuery, typeFilter, sortBy]);

    // Keyboard shortcuts
    useEffect(() => {

        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl/Cmd + F to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            // Ctrl/Cmd + A to select all
            if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                e.preventDefault();
                if (filteredContext.length > 0) {
                    setSelectedItems(new Set(filteredContext.map(item => item.id)));
                }
            }
            // Escape to clear selection
            if (e.key === 'Escape' && selectedItems.size > 0) {
                setSelectedItems(new Set());
            }
            // Delete key to delete selected
            if (e.key === 'Delete' && selectedItems.size > 0) {
                handleBatchDelete();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [filteredContext, selectedItems]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (!project || !updateProject) return;

        acceptedFiles.forEach(file => {
            const reader = new FileReader();
            const fileId = generateRandomId();

            setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

            reader.onprogress = (event) => {
                if (event.lengthComputable) {
                    const progress = (event.loaded / event.total) * 100;
                    setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
                }
            };

            reader.onerror = () => {
                console.error('[UploadManager] FileReader Error:', file.name);
                toast({ title: t('builder.files.toasts.fileReadError'), variant: 'destructive' });
                setUploadProgress(prev => {
                    const newProgress = { ...prev };
                    delete newProgress[fileId];
                    return newProgress;
                });
            };

            reader.onload = () => {
                try {
                    const content = reader.result as string;
                    updateProject(p => p.addExternalContext({
                        fileName: file.name,
                        content: content || '',
                        type: 'context'
                    }, fileId));
                    toast({
                        title: "Vector Integrated",
                        description: `${file.name} successfully mapped.`,
                        duration: 3000
                    });
                } catch (e) {
                    console.error('[UploadManager] Update Persistence Failure:', e);
                    toast({
                        title: "Sync Error",
                        description: "Failed to incorporate source vector.",
                        variant: 'destructive'
                    });
                } finally {
                    setUploadProgress(prev => {
                        const newProgress = { ...prev };
                        delete newProgress[fileId];
                        return newProgress;
                    });
                }
            };

            if (file.type.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.json')) {
                reader.readAsText(file);
            } else {
                reader.readAsDataURL(file);
            }
        });
    }, [updateProject, project, toast, t]);

    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
        onDrop,
        multiple: true,
        noClick: true,
        noKeyboard: true,
        accept: {
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'text/plain': ['.txt'],
            'text/markdown': ['.md'],
            'application/json': ['.json'],
            'text/csv': ['.csv'],
            'image/jpeg': ['.jpeg', '.jpg'],
            'image/png': ['.png'],
            'image/webp': ['.webp'],
        }
    });

    const handleAddPastedText = useCallback(() => {
        if (!textInput.trim() || !textFileName.trim() || !updateProject) return;

        try {
            updateProject(p => p.addExternalContext({
                fileName: `${textFileName.trim()}.md`,
                content: textInput,
                type: 'context',
            }, generateRandomId()));
            setTextInput('');
            setTextFileName('');
            toast({ title: "Logic Integrated", description: "Raw text node successfully synthesized." });
        } catch (error) {
            console.error('[UploadManager] Raw ingestion failure:', error);
            toast({ title: "System Error", description: "Failed to materialize raw logic node.", variant: 'destructive' });
        }
    }, [textInput, textFileName, updateProject, toast]);

    const handleBatchDelete = useCallback(() => {
        if (!updateProject || selectedItems.size === 0) return;

        if (window.confirm(`Delete ${selectedItems.size} selected source${selectedItems.size !== 1 ? 's' : ''}?`)) {
            try {
                const currentContext = project?.externalContext || [];
                const remainingContext = currentContext.filter(item => !selectedItems.has(item.id));

                updateProject(p => p.withProps({ externalContext: remainingContext }));
                setSelectedItems(new Set());
                toast({
                    title: "Batch Delete Complete",
                    description: `Removed ${selectedItems.size} source${selectedItems.size !== 1 ? 's' : ''}.`
                });
            } catch (error) {
                console.error('[UploadManager] Batch delete failed:', error);
                toast({ title: "Delete Failed", description: "Unable to remove selected sources.", variant: 'destructive' });
            }
        }
    }, [selectedItems, updateProject, project?.externalContext, toast]);

    const handleSelectAll = useCallback(() => {
        const ctx = project?.externalContext || [];
        if (selectedItems.size === ctx.length) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(ctx.map(item => item.id)));
        }
    }, [selectedItems.size, project?.externalContext]);




    const totalSize = useMemo(() => {
        return externalContext.reduce((sum, item) => sum + (item.content?.length || 0), 0);
    }, [externalContext]);

    const fileTypes: ExternalContextType[] = ['context', 'example', 'question', 'textbook', 'guidelines'];

    if (!project) {
        return (
            <SidebarContainer title="Context Dashboard" icon={<LayoutGrid className="h-3.5 w-3.5" />}>
                <div className="flex flex-col items-center justify-center h-64 text-center space-y-4 opacity-40">
                    <div className="p-5 rounded-[24px] bg-primary/5 border border-primary/10">
                        <ShieldAlert className="h-8 w-8 text-primary/40" />
                    </div>
                    <div className="space-y-1.5 px-6">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Dashboard Offline</p>
                        <p className="text-[11px] font-medium leading-relaxed italic text-muted-foreground/60 max-w-[200px]">
                            Connect a project manifest to initialize context ingestion hubs.
                        </p>
                    </div>
                </div>
            </SidebarContainer>
        );
    }

    return (
        <SidebarContainer
            title="Context Dashboard"
            icon={<LayoutGrid className="h-3.5 w-3.5" />}
        >
            <Tabs defaultValue="files" className="w-full flex flex-col gap-6 pt-2 animate-in fade-in slide-in-from-right-4 duration-500">
                <TabsList className="flex w-full h-auto rounded-xl bg-muted/20 p-1 gap-1 border border-border/40">
                    <TabsTrigger value="files" className="flex-1 text-[9px] font-black uppercase tracking-[0.15em] data-[state=active]:bg-background data-[state=active]:text-primary py-2 rounded-lg transition-all">
                        Sources
                    </TabsTrigger>
                    <TabsTrigger value="analyst" className="flex-1 gap-1.5 text-[9px] font-black uppercase tracking-[0.15em] data-[state=active]:bg-background data-[state=active]:text-primary py-2 rounded-lg transition-all">
                        <AtomIcon className="h-3 w-3" />
                        Analysis
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="files" className="m-0 focus-visible:ring-0 flex flex-col gap-6">
                    {/* Stats Bar - Desktop */}
                    {(
                        <div className="flex items-center justify-between px-2 py-2 rounded-xl bg-muted/10 border border-primary/10">
                            <div className="flex items-center gap-4 text-[8px] text-muted-foreground/60">
                                <div className="flex items-center gap-1.5">
                                    <Database className="h-3 w-3" />
                                    <span>{externalContext.length} sources</span>
                                </div>
                                <div className="h-3 w-px bg-primary/10" />
                                <div className="flex items-center gap-1.5">
                                    <HardDrive className="h-3 w-3" />
                                    <span>{formatFileSize(totalSize)} total</span>
                                </div>
                                {selectedItems.size > 0 && (
                                    <>
                                        <div className="h-3 w-px bg-primary/10" />
                                        <div className="flex items-center gap-1.5 text-primary">
                                            <span>{selectedItems.size} selected</span>
                                            <button
                                                onClick={handleBatchDelete}
                                                className="hover:text-destructive transition-colors"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={open}
                                                className="h-7 px-3 text-[8px] font-black uppercase tracking-wider"
                                            >
                                                <Plus className="h-3 w-3 mr-1" />
                                                Add Files
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom" className="text-[8px]">
                                            Browse files
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>
                    )}

                    {/* Drag & Drop Zone */}
                    <div
                        {...getRootProps()}
                        className={cn(
                            "border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 group bg-muted/5 relative",
                            isDragActive ? "border-primary bg-primary/[0.03] ring-2 ring-primary/10" : "border-primary/10 hover:border-primary/30 hover:bg-muted/8",
                            "p-8"
                        )}
                    >
                        <input {...getInputProps()} />
                        <div className="relative mx-auto mb-3">
                            <UploadCloud className={cn(
                                "h-10 w-10 mx-auto transition-all duration-300",
                                isDragActive ? "text-primary scale-110" : "text-muted-foreground/40 group-hover:text-primary/60 group-hover:scale-105"
                            )} />
                            {!isDragActive && (
                                <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-background rounded-full border border-primary/20 flex items-center justify-center shadow-lg">
                                    <Plus className="h-3 w-3 text-primary" />
                                </div>
                            )}
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em]">
                            {isDragActive ? "Drop Files Here" : "Drag & Drop Files"}
                        </p>
                        <p className="mt-1 text-[8px] text-muted-foreground/40 uppercase tracking-widest">
                            PDF, DOCX, MD, JSON, CSV, Images
                        </p>
                    </div>

                    {/* Search and Filters */}
                    <div className="space-y-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/30" />
                            <Input
                                ref={searchInputRef}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={"Search sources..."}
                                className="h-9 pl-9 pr-9 text-[10px] bg-muted/5 border-primary/10 rounded-lg focus-visible:ring-primary/20"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                >
                                    <X className="h-3.5 w-3.5 text-muted-foreground/40 hover:text-primary" />
                                </button>
                            )}
                        </div>

                        {/* Filter Bar - Desktop */}
                        {(
                            <div className="flex items-center gap-2 flex-wrap">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-wider text-muted-foreground/60 hover:text-primary transition-colors"
                                >
                                    <Filter className="h-3 w-3" />
                                    Filters
                                    {showFilters ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                </button>

                                {showFilters && (
                                    <>
                                        <div className="h-4 w-px bg-primary/10" />
                                        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
                                            <SelectTrigger className="h-7 w-32 text-[8px] font-black uppercase tracking-wider border-primary/10 rounded-lg">
                                                <SelectValue placeholder="All Types" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all" className="text-[9px]">All Types</SelectItem>
                                                {fileTypes.map(type => (
                                                    <SelectItem key={type} value={type} className="text-[9px] uppercase">
                                                        {type}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                                            <SelectTrigger className="h-7 w-28 text-[8px] font-black uppercase tracking-wider border-primary/10 rounded-lg">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="name">By Name</SelectItem>
                                                <SelectItem value="date">By Date</SelectItem>
                                                <SelectItem value="size">By Size</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        {filteredContext.length > 0 && (
                                            <button
                                                onClick={handleSelectAll}
                                                className="px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-wider text-muted-foreground/60 hover:text-primary transition-colors"
                                            >
                                                {selectedItems.size === filteredContext.length ? 'Deselect All' : 'Select All'}
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sources List */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/60 flex items-center gap-2">
                                <Layers className="h-3 w-3" />
                                Project Sources
                                <Badge variant="outline" className="h-4 text-[7px] font-black border-primary/20 bg-primary/5">
                                    {filteredContext.length} / {externalContext.length}
                                </Badge>
                            </h3>
                        </div>

                        <ScrollArea className={cn(
                            "pr-2",
                            "max-h-[500px]"
                        )}>
                            <div className="space-y-2">
                                {filteredContext.map((item, index) => (
                                    <div
                                        key={item.id}
                                        className={cn(
                                            "transition-all duration-200",
                                            selectedItems.has(item.id) && "ring-2 ring-primary/30 rounded-2xl"
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            {selectedItems.size > 0 && (
                                                <button
                                                    onClick={() => {
                                                        const newSelected = new Set(selectedItems);
                                                        if (newSelected.has(item.id)) {
                                                            newSelected.delete(item.id);
                                                        } else {
                                                            newSelected.add(item.id);
                                                        }
                                                        setSelectedItems(newSelected);
                                                    }}
                                                    className={cn(
                                                        "h-4 w-4 rounded border-2 transition-all",
                                                        selectedItems.has(item.id)
                                                            ? "bg-primary border-primary"
                                                            : "border-muted-foreground/30 hover:border-primary"
                                                    )}
                                                >
                                                    {selectedItems.has(item.id) && <Check className="h-3 w-3 text-white -mt-0.5 -ml-0.5" />}
                                                </button>
                                            )}
                                            <div className="flex-1">
                                                <FileNodeItem
                                                    item={item}
                                                    onView={() => setInspectItem({
                                                        fileName: item.fileName,
                                                        content: item.content || '',
                                                        size: item.content?.length
                                                    })}
                                                    onDelete={() => {
                                                        try {
                                                            updateProject(p => p.removeExternalContext(index));
                                                        } catch (e) {
                                                            console.error('[UploadManager] Vector removal failure:', e);
                                                        }
                                                    }}
                                                    className={selectedFileId === item.id ? 'border-primary/30 bg-primary/[0.03] ring-1 ring-primary/10' : ''}
                                                    showMetadata={true}
                                                    compact={false}
                                                />
                                            </div>
                                        </div>

                                        {/* Type Selector */}
                                        <div className="flex items-center gap-2 pl-4 mt-1 ml-6">
                                            <div className="h-px w-3 bg-primary/20" />
                                            <Select
                                                value={item.type}
                                                onValueChange={(v: ExternalContextType) => {
                                                    try {
                                                        updateProject(p => p.updateExternalContextType(index, v));
                                                    } catch (e) {
                                                        console.error('[UploadManager] Type classification failure:', e);
                                                    }
                                                }}
                                            >
                                                <SelectTrigger className="h-5 w-auto min-w-[80px] border-none bg-primary/5 hover:bg-primary/10 text-[7px] font-black uppercase tracking-widest text-primary/60 transition-all px-2 rounded-md">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-lg border-primary/10 shadow-xl">
                                                    {fileTypes.map(t => (
                                                        <SelectItem key={t} value={t} className="text-[8px] font-black uppercase tracking-widest py-1.5">
                                                            {t}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                ))}

                                {filteredContext.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 opacity-40">
                                        <div className="p-5 rounded-full bg-muted/20 border border-dashed border-muted-foreground/40">
                                            <Database className="h-10 w-10 text-muted-foreground stroke-[1]" />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] px-10 leading-relaxed">
                                            {searchQuery ? 'No matching sources found' : 'No Sources Found'}
                                        </p>
                                        {searchQuery && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setSearchQuery('')}
                                                className="text-[8px]"
                                            >
                                                Clear search
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Text Input Tab (shown inline on desktop) */}
                    {(
                        <div className="border-t border-primary/10 pt-4 mt-2">
                            <div className="flex items-center gap-2 mb-3">
                                <Plus className="h-3.5 w-3.5 text-primary/60" />
                                <span className="text-[8px] font-black uppercase tracking-wider text-muted-foreground/60">
                                    Quick Text Source
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <Input
                                    value={textFileName}
                                    onChange={(e) => setTextFileName(e.target.value)}
                                    placeholder="Source name..."
                                    className="h-8 text-[10px] bg-muted/5 border-primary/10 rounded-lg"
                                />
                                <div className="flex gap-2">
                                    <Textarea
                                        value={textInput}
                                        onChange={(e) => setTextInput(e.target.value)}
                                        placeholder="Paste content..."
                                        className="h-8 text-[10px] bg-muted/5 border-primary/10 rounded-lg resize-none overflow-hidden"
                                        rows={1}
                                    />
                                    <Button
                                        onClick={handleAddPastedText}
                                        disabled={!textInput.trim() || !textFileName.trim()}
                                        size="sm"
                                        className="h-8 px-3 text-[8px] font-black uppercase tracking-wider"
                                    >
                                        Add
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="analyst" className="m-0 focus-visible:ring-0 min-h-0">
                    <SourceAnalyst />
                </TabsContent>
            </Tabs>

            <ContextInspectorHUD
                item={inspectItem}
                isOpen={inspectItem !== null}
                onClose={() => setInspectItem(null)}
            />

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 px-5 py-2.5 border-t border-primary/10 bg-background/80 backdrop-blur-sm flex items-center justify-between text-[7px]">
                <div className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-primary/30" />
                    <span className="font-black uppercase tracking-widest text-muted-foreground/40">
                        {externalContext.length} source{externalContext.length !== 1 ? 's' : ''}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {(
                        <span className="font-mono text-muted-foreground/20">
                            ⌘F to search • Del to delete
                        </span>
                    )}
                </div>
            </div>
        </SidebarContainer>
    );
}
