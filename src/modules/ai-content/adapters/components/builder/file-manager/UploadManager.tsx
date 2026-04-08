'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import {
    AtomIcon,
    FileText,
    Loader2,
    Plus,
    UploadCloud,
    X,
    Database,
    Search,
    Filter,
    Layers,
    LayoutGrid,
    Eye,
    ShieldAlert
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { useLocalization } from "@/context/LocalizationContext";
import { useBuilderStore, useToast } from '@/hooks';
import { cn } from "@/infrastructure/utils/cn";
import { AtmosphericGrid } from '@/components/shared/AtmosphericGrid';
import { generateRandomId } from '@/infrastructure/utils/randomId';
import { ExternalContextType } from '@/modules/ai-content/domain/entities/ControlTypes';
import { SidebarContainer } from '../layout/SidebarContainer';
import { FileNodeItem } from './FileNodeItem';
import { SourceAnalyst } from './SourceAnalyst';

/**
 * UploadManager — A dashboard for project source management.
 * Consolidates file ingestion, text entry, and data analysis.
 */

// ── Context Inspector HUD ──────────────────────────────────────────────────────
function ContextInspectorHUD({ item, isOpen, onClose }: { item: { fileName: string, content: string } | null, isOpen: boolean, onClose: () => void }) {
    if (!item) return null;
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[85vh] p-0 border-primary/10 shadow-2xl rounded-[32px] bg-background/80 backdrop-blur-3xl overflow-hidden flex flex-col">
                <DialogHeader className="px-8 py-6 border-b border-primary/10 bg-primary/5 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-[14px] font-black uppercase tracking-tight">{item.fileName}</DialogTitle>
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-bold">Content Analysis</p>
                        </div>
                    </div>
                </DialogHeader>
                <div className="flex-1 overflow-hidden relative group">
                    {/* Atmospheric decoration */}
                    <AtmosphericGrid opacity={0.02} size={28} />

                    <ScrollArea className="h-full w-full custom-scrollbar">
                        <div className="p-10">
                            <div className="space-y-6">
                                <h3 className="text-[16px] font-black uppercase tracking-tight text-foreground/80">{item.fileName}</h3>
                                <pre className="p-8 bg-muted/30 border border-primary/10 rounded-3xl overflow-auto max-h-[60vh] text-[12px] font-serif leading-relaxed italic shadow-inner">
                                    {item.content || 'Zero payload detected in source vector.'}
                                </pre>
                            </div>
                        </div>
                    </ScrollArea>
                </div>
                <div className="px-8 py-4 bg-primary/[0.02] border-t border-primary/10 flex justify-between items-center shrink-0">
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">Context Analysis Pipeline</span>
                    <Button variant="ghost" onClick={onClose} className="text-[10px] font-black uppercase tracking-widest rounded-xl h-9 px-6 transition-all hover:bg-red-500/5 hover:text-red-500">Close Inspector</Button>
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
    const [textInput, setTextInput] = useState('');
    const [textFileName, setTextFileName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [inspectItem, setInspectItem] = useState<{ fileName: string, content: string } | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (!project || !updateProject) return;

        setIsLoading(true);
        try {
            acceptedFiles.forEach(file => {
                const reader = new FileReader();
                reader.onerror = () => {
                    console.error('[UploadManager] FileReader Error:', file.name);
                    toast({ title: t('builder.files.toasts.fileReadError'), variant: 'destructive' });
                };
                reader.onload = () => {
                    try {
                        const content = reader.result as string;
                        updateProject(p => p.addExternalContext({
                            fileName: file.name,
                            content: content || '',
                            type: 'context'
                        }, generateRandomId()));
                        toast({ title: "Vector Integrated", description: `${file.name} successfully mapped to source core.` });
                    } catch (e) {
                        console.error('[UploadManager] Update Persistence Failure:', e);
                        toast({ title: "Sync Error", description: "Failed to incorporate source vector into project manifest.", variant: 'destructive' });
                    }
                };

                if (file.type.startsWith('text/') || file.name.endsWith('.md')) {
                    reader.readAsText(file);
                } else {
                    reader.readAsDataURL(file);
                }
            });
        } catch (error) {
            console.error('[UploadManager] Ingestion pipeline failure:', error);
            toast({ title: "Pipeline Crash", description: "The ingestion core encountered an unrecoverable error.", variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    }, [updateProject, project, toast, t]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: true,
        accept: {
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'text/plain': ['.txt'],
            'text/markdown': ['.md'],
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

    const externalContext = project?.externalContext || [];
    const filteredContext = useMemo(() =>
        externalContext.filter(item => item.fileName.toLowerCase().includes(searchQuery.toLowerCase())),
        [externalContext, searchQuery]);

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
            <Tabs defaultValue="files" className="w-full flex flex-col gap-8 pt-2 animate-in fade-in slide-in-from-right-4 duration-500">
                <TabsList className="flex flex-wrap sm:grid sm:grid-cols-2 w-full h-auto sm:h-11 rounded-2xl bg-muted/20 p-1 gap-1 border border-border/40">
                    <TabsTrigger value="files" className="flex-1 text-[10px] font-black uppercase tracking-[0.15em] data-[state=active]:bg-background data-[state=active]:text-primary px-2 py-2 sm:py-0 transition-all rounded-xl">
                        Sources
                    </TabsTrigger>
                    <TabsTrigger value="analyst" className="flex-1 gap-2 text-[10px] font-black uppercase tracking-[0.15em] data-[state=active]:bg-background data-[state=active]:text-primary px-2 py-2 sm:py-0 transition-all rounded-xl">
                        <AtomIcon className="h-3.5 w-3.5 shrink-0" />
                        Analysis
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="files" className="m-0 focus-visible:ring-0 flex flex-col gap-8">
                    {/* Ingestion Matrix */}
                    <div className="space-y-6 relative px-1">
                        {/* Accent line */}
                        <div className="absolute left-[-1.25rem] top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/5 to-transparent" aria-hidden="true" />

                        <Tabs defaultValue="upload" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 h-9 rounded-xl bg-muted/10 p-1 gap-1 border border-primary/5">
                                <TabsTrigger value="upload" className="text-[9px] font-black uppercase tracking-widest rounded-lg">Upload Files</TabsTrigger>
                                <TabsTrigger value="text" className="text-[9px] font-black uppercase tracking-widest rounded-lg">Paste Text</TabsTrigger>
                            </TabsList>

                            <TabsContent value="upload" className="mt-5 m-0 focus-visible:ring-0">
                                <div {...getRootProps()} className={cn(
                                    "border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-500 group bg-muted/5 relative overflow-hidden",
                                    isDragActive ? "border-primary bg-primary/[0.03] ring-4 ring-primary/5" : "border-primary/10 hover:border-primary/30 hover:bg-muted/8"
                                )}>
                                    <input {...getInputProps()} />
                                    <div className="relative mx-auto h-12 w-12 mb-4">
                                        {isLoading ? (
                                            <Loader2 className="h-full w-full animate-spin text-primary/40" />
                                        ) : (
                                            <>
                                                <UploadCloud className={cn(
                                                    "h-full w-full transition-all duration-500",
                                                    isDragActive ? "text-primary scale-110" : "text-muted-foreground/40 group-hover:text-primary/60 group-hover:scale-105"
                                                )} />
                                                {!isDragActive && (
                                                    <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-background rounded-full border border-primary/20 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                                        <Plus className="h-3 w-3 text-primary" />
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">{isDragActive ? "Drop Files Here" : "Upload Content"}</p>
                                    <p className="mt-1.5 text-[9px] text-muted-foreground italic font-medium opacity-40 uppercase tracking-widest">PDF, DOCX, MD, JPG Supported</p>
                                </div>
                            </TabsContent>

                            <TabsContent value="text" className="mt-5 space-y-5 m-0 focus-visible:ring-0">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/40 px-1">Source Name</Label>
                                        <Input value={textFileName} onChange={(e) => setTextFileName(e.target.value)} placeholder="Enter name..." className="h-10 text-[11px] font-bold bg-muted/5 border-primary/10 focus-visible:ring-primary/20 rounded-xl uppercase tracking-widest" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/40 px-1">Content</Label>
                                        <Textarea value={textInput} onChange={(e) => setTextInput(e.target.value)} rows={5} placeholder="Enter content..." className="text-[11px] bg-muted/5 border-primary/10 focus-visible:ring-primary/20 rounded-2xl resize-none p-4 font-serif italic shadow-inner" />
                                    </div>
                                </div>
                                <Button onClick={handleAddPastedText} disabled={!textInput.trim() || !textFileName.trim() || isLoading} className="w-full h-11 text-[10px] font-black uppercase tracking-[0.2em] gap-2.5 shadow-xl shadow-primary/15 rounded-xl bg-primary hover:opacity-90 ring-1 ring-inset ring-white/20 transition-all">
                                    <Plus className="h-4 w-4" />
                                    Save Source
                                </Button>
                            </TabsContent>
                        </Tabs>

                        {/* Search & Filter Matrix */}
                        <div className="relative group/search pt-2">
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search sources..."
                                className="h-10 pl-10 pr-10 text-[10px] bg-muted/5 border-primary/5 focus-visible:border-primary/20 focus-visible:ring-primary/10 rounded-2xl transition-all uppercase font-bold tracking-widest placeholder:text-muted-foreground/30"
                            />
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/20 group-focus-within/search:text-primary transition-colors" />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 hover:text-primary transition-colors text-muted-foreground/40">
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        {/* Vector Stack */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/60 flex items-center gap-2">
                                    <Layers className="h-3 w-3" />
                                    Project Sources
                                </h3>
                                <Badge variant="outline" className="h-5 text-[9px] font-black border-primary/20 bg-primary/5 text-primary tabular-nums px-2.5 rounded-full shadow-inner ring-1 ring-inset ring-primary/10">
                                    {externalContext.length} Items
                                </Badge>
                            </div>

                            <div className="space-y-3">
                                {filteredContext.map((item, index) => (
                                    <div key={item.id} className="space-y-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <FileNodeItem
                                            item={item}
                                            onView={() => setInspectItem(item)}
                                            onDelete={() => {
                                                try {
                                                    updateProject(p => p.removeExternalContext(index));
                                                } catch (e) {
                                                    console.error('[UploadManager] Vector removal failure:', e);
                                                }
                                            }}
                                            className={selectedFileId === item.id ? 'border-primary/30 bg-primary/[0.03] ring-1 ring-primary/10' : ''}
                                        />
                                        <div className="flex items-center gap-2 pl-4">
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
                                                <SelectTrigger className="h-6 w-auto min-w-[100px] border-none bg-primary/5 hover:bg-primary/10 text-[8px] font-black uppercase tracking-widest text-primary/60 transition-all px-2.5 rounded-lg focus:ring-0">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-primary/10 shadow-2xl backdrop-blur-3xl">
                                                    {fileTypes.map(t => (
                                                        <SelectItem key={t} value={t} className="text-[9px] font-black uppercase tracking-widest py-2.5 cursor-pointer focus:bg-primary/5 focus:text-primary">
                                                            {t}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                ))}

                                {filteredContext.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 opacity-30">
                                        <div className="p-5 rounded-full bg-muted/20 border border-dashed border-muted-foreground/40">
                                            <Database className="h-10 w-10 text-muted-foreground stroke-[1]" />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] px-10 leading-relaxed">No Sources Found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
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

            {/* Panel Footer */}
            <div className="absolute bottom-0 left-0 right-0 px-6 py-3 border-t border-primary/10 bg-background flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-primary/30" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">Management Dashboard</span>
                </div>
                <span className="text-[8px] font-bold text-muted-foreground/20 tabular-nums">v1.0</span>
            </div>
        </SidebarContainer>
    );
}
