'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useBuilderStore } from '@/hooks';
import { useFileUpload } from '@/hooks/util/useFileUpload';
import { cn } from '@/infrastructure/utils/cn';
import { generateRandomId } from '@/infrastructure/utils/randomId';
import { ExternalContextType } from '@/modules/ai-content/domain/entities/ControlTypes';
import { ExternalContext } from '@/modules/ai-content/domain/entities/ExternalContext';
import {
    AlertCircle,
    ArrowRight,
    Check,
    ChevronDown,
    ChevronUp,
    Copy,
    Database,
    FileCode,
    Plus,
    Search,
    UploadCloud,
    X
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FileNodeItem } from './FileNodeItem';

const FILE_TYPES: ExternalContextType[] = ['context', 'example', 'question', 'textbook', 'guidelines'];

// Source Editor Component with desktop enhancements
interface SourceEditorProps {
    isOpen: boolean;
    onClose: () => void;
    initialName?: string;
    initialContent?: string;
    onSave: (name: string, content: string) => void;
    mode: 'add' | 'edit';
}

function SourceEditor({ isOpen, onClose, initialName = '', initialContent = '', onSave, mode }: SourceEditorProps) {
    const [name, setName] = useState(initialName);
    const [content, setContent] = useState(initialContent);

    useEffect(() => {
        if (isOpen) {
            setName(initialName);
            setContent(initialContent);
        }
    }, [isOpen, initialName, initialContent]);

    // Desktop keyboard shortcuts
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                if (name.trim() && content.trim()) {
                    onSave(name.trim(), content.trim());
                    onClose();
                }
            }
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, name, content, onSave, onClose]);

    const handleSave = () => {
        if (name.trim() && content.trim()) {
            onSave(name.trim(), content.trim());
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className={cn(
                "border-primary/10 shadow-2xl rounded-[28px] bg-background/80 backdrop-blur-3xl p-0 overflow-hidden",
                "max-w-3xl"
            )}>
                <DialogHeader className="px-8 py-6 border-b border-primary/10 bg-primary/5">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            <FileCode className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-[14px] font-black uppercase tracking-tight">
                                {mode === 'add' ? 'Add Project Source' : 'Edit Project Source'}
                            </DialogTitle>
                            <DialogDescription className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-bold">
                                Source configuration {'• ⌘⏎ to save'}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-8 space-y-6">
                    <div className="space-y-2.5">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">
                            Source Name
                        </Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Reference_Document"
                            className="h-11 bg-muted/5 border-primary/10 focus-visible:ring-primary/20 rounded-xl font-bold uppercase tracking-widest placeholder:text-muted-foreground/20"
                            autoFocus
                        />
                    </div>
                    <div className="space-y-2.5">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">
                            Content
                        </Label>
                        <Textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Enter content..."
                            className={cn(
                                "bg-muted/5 border-primary/10 focus-visible:ring-primary/20 rounded-2xl resize-none p-4 font-serif italic text-[13px] leading-relaxed shadow-inner",
                                "min-h-[320px]"
                            )}
                        />
                    </div>
                </div>

                <DialogFooter className="px-8 py-4 bg-primary/[0.02] border-t border-primary/10">
                    <Button variant="ghost" onClick={onClose} className="text-[10px] font-black uppercase tracking-widest rounded-xl h-10 px-6">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!name.trim() || !content.trim()}
                        className="text-[10px] font-black uppercase tracking-[0.2em] rounded-xl h-10 px-8 shadow-xl shadow-primary/10 ring-1 ring-inset ring-white/20"
                    >
                        {mode === 'add' ? 'Save Source' : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Source Group Component for desktop organization
interface SourceGroupProps {
    title: string;
    type: ExternalContextType;
    sources: ExternalContext[];
    onEdit: (index: number) => void;
    onDelete: (index: number) => void;
    onTypeChange: (index: number, type: ExternalContextType) => void;
}

function SourceGroup({ title, type, sources, onEdit, onDelete, onTypeChange }: SourceGroupProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    if (sources.length === 0) return null;

    return (
        <div className="space-y-2">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 w-full group"
            >
                {isExpanded ? (
                    <ChevronDown className="h-3 w-3 text-primary/40" />
                ) : (
                    <ChevronUp className="h-3 w-3 text-primary/40" />
                )}
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/60">
                    {title} ({sources.length})
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-primary/10 to-transparent" />
            </button>

            {isExpanded && (
                <div className="space-y-3 pl-2">
                    {sources.map((item, idx) => {
                        const originalIndex = idx;
                        return (
                            <div key={item.id} className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <FileNodeItem
                                    item={item}
                                    onEdit={() => onEdit(originalIndex)}
                                    onDelete={() => onDelete(originalIndex)}
                                />
                                <div className="flex items-center gap-2 pl-3">
                                    <ArrowRight className="h-2.5 w-2.5 text-primary/20" />
                                    <Select
                                        value={item.type}
                                        onValueChange={(v) => onTypeChange(originalIndex, v as ExternalContextType)}
                                    >
                                        <SelectTrigger className="h-6 w-auto min-w-[90px] border-none bg-primary/5 hover:bg-primary/10 text-[8px] font-black uppercase tracking-widest text-primary/60 transition-all px-2 rounded-lg focus:ring-0">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-primary/10 bg-background">
                                            {FILE_TYPES.map(t => (
                                                <SelectItem key={t} value={t} className="text-[9px] font-black uppercase tracking-widest py-2">
                                                    {t}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// Main SourceManager Component
export function SourceManager() {
    const { project, updateProject } = useBuilderStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddingText, setIsAddingText] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const { getRootProps, getInputProps } = useFileUpload((_field, val) => {
        if (!project || !updateProject) return;
        if (val && typeof val === 'string') {
            try {
                updateProject(p => p.addExternalContext({
                    fileName: 'Extracted Content',
                    content: val,
                    type: 'context'
                }, generateRandomId()));
            } catch (error) {
                console.error('[SourceManager] File upload persistence failure:', error);
            }
        }
    }, { fieldName: 'text' });

    // Desktop keyboard shortcuts
    useEffect(() => {

        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                setIsAddingText(true);
            }
            if (e.key === 'Escape' && editingIndex !== null) {
                setEditingIndex(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [editingIndex]);

    // Group sources by type for desktop
    const groupedSources = useMemo(() => {
        if (!project?.externalContext) return [];

        const groups = FILE_TYPES.map(type => ({
            type,
            sources: project.externalContext.filter(s => s.type === type)
        })).filter(g => g.sources.length > 0);

        return groups;
    }, [project?.externalContext]);

    // Filtered sources based on search
    const filteredSources = useMemo(() => {
        if (!project?.externalContext) return [];
        if (!searchQuery.trim()) return project.externalContext;

        const query = searchQuery.toLowerCase();
        return project.externalContext.filter(s =>
            s.fileName.toLowerCase().includes(query) ||
            s.content.toLowerCase().includes(query)
        );
    }, [project?.externalContext, searchQuery]);

    const onAddText = useCallback((name: string, content: string) => {
        if (!project || !updateProject) return;
        try {
            updateProject(p => p.addExternalContext({
                fileName: name,
                content,
                type: 'context'
            }, generateRandomId()));
        } catch (error) {
            console.error('[SourceManager] Raw text ingestion failure:', error);
        }
    }, [project, updateProject]);

    const onUpdateText = useCallback((name: string, content: string) => {
        if (editingIndex === null || !project || !updateProject) return;

        try {
            updateProject(p => {
                if (!p) return p;
                const updated = (p.externalContext || []).map((c: ExternalContext, i: number) =>
                    i === editingIndex ? c.withProps({ fileName: name, content }) : c
                );
                return p.withProps({ externalContext: [...updated] });
            });
            setEditingIndex(null);
        } catch (error) {
            console.error('[SourceManager] Vector update failure:', error);
        }
    }, [editingIndex, project, updateProject]);

    const removeContext = useCallback((index: number) => {
        if (!project || !updateProject) return;
        try {
            updateProject(p => p.removeExternalContext(index));
        } catch (error) {
            console.error('[SourceManager] Vector removal failure:', error);
        }
    }, [project, updateProject]);

    const updateContextType = useCallback((index: number, type: ExternalContextType) => {
        if (!project || !updateProject) return;
        try {
            updateProject(p => p.updateExternalContextType(index, type));
        } catch (error) {
            console.error('[SourceManager] Context type classification failure:', error);
        }
    }, [project, updateProject]);

    // Copy source content to clipboard
    const copyToClipboard = useCallback(async (content: string, id: string) => {
        await navigator.clipboard.writeText(content);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    }, []);

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center space-y-4 opacity-40">
                <div className="p-5 rounded-[24px] bg-primary/5 border border-primary/10">
                    <Database className="h-8 w-8 text-primary/40" />
                </div>
                <div className="space-y-1.5 px-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Manager Offline</p>
                    <p className="text-[11px] font-medium leading-relaxed italic text-muted-foreground/60 max-w-[200px]">
                        Open a project to manage your content sources.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full gap-6 pt-2 animate-in fade-in slide-in-from-right-2 duration-300">
            {/* Header */}
            <div className="space-y-1.5 px-1">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70 flex items-center gap-2.5">
                    <Database className="h-3.5 w-3.5" />
                    Project Sources
                    <span className="text-[8px] text-muted-foreground/40">
                        ({project.externalContext.length})
                    </span>
                </h4>
                <p className="text-[9px] text-muted-foreground italic font-medium opacity-60 uppercase tracking-widest">
                    Manage the content and references for your project.
                </p>
            </div>

            {/* Search Bar - Desktop */}
            {(
                <div className="relative group/search px-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/30" />
                    <Input
                        placeholder="Search sources... (⌘F)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-8 pl-8 pr-8 text-[10px] bg-muted/5 border-primary/10 rounded-lg"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                            <X className="h-3 w-3 text-muted-foreground/40" />
                        </button>
                    )}
                </div>
            )}

            {/* Quick Ingestion Hub */}
            <div className="grid grid-cols-2 gap-2.5">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div {...getRootProps()} className="cursor-pointer">
                                <input {...getInputProps()} />
                                <Button
                                    variant="outline"
                                    className="h-12 w-full flex flex-col items-center justify-center gap-1 rounded-xl border-dashed border-primary/20 bg-primary/[0.02] hover:bg-primary/5 transition-all"
                                >
                                    <UploadCloud className="h-3.5 w-3.5 text-primary/40" />
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                                        Upload
                                    </span>
                                </Button>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-[10px]">
                            Upload file (PDF, TXT, MD)
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                className="h-12 flex flex-col items-center justify-center gap-1 rounded-xl border-dashed border-primary/20 bg-primary/[0.02] hover:bg-primary/5 transition-all"
                                onClick={() => setIsAddingText(true)}
                            >
                                <Plus className="h-3.5 w-3.5 text-primary/40" />
                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                                    Add Text
                                </span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-[10px]">
                            Add text source • ⌘N
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            {/* Sources List */}
            <ScrollArea className="flex-1 -mr-4 pr-4">
                <div className="space-y-4 pb-24">
                    {searchQuery ? (
                        // Search results - flat list
                        filteredSources.length > 0 ? (
                            <div className="space-y-3">
                                {filteredSources.map((item, index) => (
                                    <div key={item.id} className="space-y-2">
                                        <FileNodeItem
                                            item={item}
                                            onEdit={() => setEditingIndex(index)}
                                            onDelete={() => removeContext(index)}
                                        />
                                        <div className="flex items-center gap-2 pl-3">
                                            <ArrowRight className="h-2.5 w-2.5 text-primary/20" />
                                            <Select
                                                value={item.type}
                                                onValueChange={(v) => updateContextType(index, v as ExternalContextType)}
                                            >
                                                <SelectTrigger className="h-6 w-auto min-w-[90px] border-none bg-primary/5 text-[8px] font-black uppercase tracking-widest text-primary/60">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {FILE_TYPES.map(t => (
                                                        <SelectItem key={t} value={t} className="text-[9px] font-black uppercase">
                                                            {t}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => copyToClipboard(item.content, item.id)}
                                            >
                                                {copiedId === item.id ? (
                                                    <Check className="h-3 w-3 text-green-500" />
                                                ) : (
                                                    <Copy className="h-3 w-3 text-muted-foreground/40" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
                                <AlertCircle className="h-8 w-8 mb-2" />
                                <p className="text-[9px] font-black uppercase tracking-widest">No matching sources</p>
                            </div>
                        )
                    ) : (
                        // Desktop: Grouped by type
                        <div className="space-y-4">
                            {FILE_TYPES.map(type => {
                                const sources = project.externalContext.filter(s => s.type === type);
                                if (sources.length === 0) return null;
                                return (
                                    <SourceGroup
                                        key={type}
                                        title={type}
                                        type={type}
                                        sources={sources}
                                        onEdit={(idx) => {
                                            const originalIndex = project.externalContext.findIndex(s => s.id === sources[idx].id);
                                            setEditingIndex(originalIndex);
                                        }}
                                        onDelete={(idx) => {
                                            const originalIndex = project.externalContext.findIndex(s => s.id === sources[idx].id);
                                            removeContext(originalIndex);
                                        }}
                                        onTypeChange={(idx, newType) => {
                                            const originalIndex = project.externalContext.findIndex(s => s.id === sources[idx].id);
                                            updateContextType(originalIndex, newType);
                                        }}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        // Mobile: Flat list
                        <div className="space-y-3">
                            {project.externalContext.map((item, index) => (
                                <div key={item.id} className="space-y-2">
                                    <FileNodeItem
                                        item={item}
                                        onEdit={() => setEditingIndex(index)}
                                        onDelete={() => removeContext(index)}
                                    />
                                    <div className="flex items-center gap-2 pl-3">
                                        <ArrowRight className="h-2.5 w-2.5 text-primary/20" />
                                        <Select
                                            value={item.type}
                                            onValueChange={(v) => updateContextType(index, v as ExternalContextType)}
                                        >
                                            <SelectTrigger className="h-6 w-auto min-w-[90px] border-none bg-primary/5 text-[8px] font-black uppercase tracking-widest text-primary/60">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {FILE_TYPES.map(t => (
                                                    <SelectItem key={t} value={t} className="text-[9px] font-black uppercase">
                                                        {t}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!searchQuery && project.externalContext.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-30">
                            <div className="p-5 rounded-full bg-muted/20 border border-dashed border-muted-foreground/40">
                                <Database className="h-10 w-10 text-muted-foreground stroke-[1]" />
                            </div>
                            <div className="space-y-1.5 px-6">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em]">No Sources Found</p>
                                <p className="text-[9px] font-medium leading-relaxed italic">
                                    Add sources to provide more context for AI generations.
                                </p>
                                {(
                                    <p className="text-[8px] font-mono text-primary/40 mt-2">
                                        Press ⌘N to add a new source
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Footer Stats */}
            <div className="absolute bottom-0 left-0 right-0 px-5 py-2.5 border-t border-primary/10 bg-background/80 backdrop-blur-sm flex items-center justify-between text-[8px]">
                <div className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-primary/30" />
                    <span className="font-black uppercase tracking-widest text-muted-foreground/40">
                        {project.externalContext.length} source{project.externalContext.length !== 1 ? 's' : ''}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="font-mono text-muted-foreground/20">
                        v1.0
                    </span>
                </div>
            </div>

            {/* Dialogs */}
            <SourceEditor
                isOpen={isAddingText}
                onClose={() => setIsAddingText(false)}
                onSave={onAddText}
                mode="add"
            />
            {editingIndex !== null && project.externalContext[editingIndex] && (
                <SourceEditor
                    isOpen={editingIndex !== null}
                    onClose={() => setEditingIndex(null)}
                    initialName={project.externalContext[editingIndex].fileName}
                    initialContent={project.externalContext[editingIndex].content}
                    onSave={onUpdateText}
                    mode="edit"
                />
            )}
        </div>
    );
}
