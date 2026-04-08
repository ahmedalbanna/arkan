'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    Globe,
    Search,
    Loader2,
    AlertCircle,
    FolderOpen,
    Library,
    Layers,
    Database,
    X,
    Filter,
    ArrowRight
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
    DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/infrastructure/utils/cn";
import { useBuilderStore } from '@/hooks';
import { useProjectsPage } from '@/modules/projects/adapters/hooks/useProjectsPage';
import { Project } from '@/modules/projects/domain/entities/Project';
import { ProjectNodeItem } from './ProjectNodeItem';

/**
 * LibraryHUD — Immersive session discovery and project restoration manifest.
 * Provides a tactical interface for browsing and initializing previous intelligence states.
 */

export function LibraryHUD({ disabled }: { disabled?: boolean }) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [loadingProjectId, setLoadingProjectId] = useState<string | null>(null);
    const { projects, isLoading, isError, error } = useProjectsPage();
    const { loadProject } = useBuilderStore();
    const router = useRouter();

    const filteredProjects = useMemo(() => {
        if (!projects) return [];
        if (!searchQuery) return projects;
        return projects.filter((p: Project) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.projectDescription?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [projects, searchQuery]);

    async function handleLoadProject(id: string) {
        const target = (projects || []).find((p: Project) => p.id === id);
        if (!target) return;

        setLoadingProjectId(id);
        // Artificial delay for tactile feedback
        await new Promise(resolve => setTimeout(resolve, 600));
        loadProject(target.toStateObject());
        setIsOpen(false);
        setLoadingProjectId(null);
        router.push('/builder');
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 xl:w-auto xl:px-3 gap-1.5 text-[9px] font-black uppercase tracking-[0.18em] hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-xl text-muted-foreground"
                    disabled={disabled}
                >
                    <Library className="h-4 w-4 shrink-0" />
                    <span className="hidden xl:inline">Library</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl h-[90vh] p-0 overflow-hidden flex flex-col gap-0 border-primary/10 shadow-2xl rounded-[32px] bg-background/80 backdrop-blur-3xl">

                {/* Library Manifest Header */}
                <header className="px-10 py-8 border-b border-primary/10 bg-primary/[0.02] relative overflow-hidden shrink-0">
                    {/* Dot-grid atmosphere (28px standard) */}
                    <div
                        className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_center,_var(--primary)_1px,_transparent_1px)] bg-[size:28px_28px] pointer-events-none"
                    />
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="h-14 w-14 rounded-[22px] bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner relative group/logo">
                            <div className="absolute inset-0 bg-primary/5 blur-lg group-hover:blur-xl transition-all" />
                            <Globe className="h-7 w-7 text-primary relative z-10 transition-transform duration-500 group-hover:rotate-12" />
                        </div>
                        <div className="space-y-1">
                            <DialogTitle className="text-[22px] font-black uppercase tracking-tight text-foreground/90">Library Manifest</DialogTitle>
                            <div className="flex items-center gap-2.5">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
                                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/70">Session Repository Accessible</p>
                            </div>
                        </div>
                    </div>
                    <DialogDescription className="text-[12px] text-muted-foreground/70 italic max-w-3xl leading-relaxed mt-4 font-medium pl-[72px]">
                        Scan your secure data repository for previous document vectors. Initializing a manifest will restore all neural configurations and structural nodes.
                    </DialogDescription>
                </header>

                {/* Tactical Search & Filter HUD */}
                <div className="px-10 py-5 border-b border-primary/10 bg-background/40 flex items-center gap-6 relative z-20">
                    <div className="relative flex-1 group/search">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 group-focus-within/search:text-primary transition-colors" />
                        <Input
                            placeholder="SCAN REPOSITORY BY IDENTITY OR VECTOR..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-11 h-11 text-[10px] bg-muted/5 border-primary/10 focus-visible:ring-primary/20 rounded-2xl transition-all font-bold uppercase tracking-widest placeholder:text-muted-foreground/20"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 hover:text-primary transition-colors text-muted-foreground/40">
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <Badge variant="outline" className="h-7 text-[9px] px-3 font-black border-primary/20 bg-primary/5 text-primary tabular-nums rounded-full shadow-inner ring-1 ring-inset ring-primary/10 uppercase tracking-widest">
                            {filteredProjects?.length || 0} Records Detected
                        </Badge>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/5 text-muted-foreground/40 hover:text-primary transition-all">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Library Node Matrix */}
                <div className="flex-1 overflow-hidden relative min-h-0 bg-[#f8fafc] dark:bg-black/20">
                    <ScrollArea className="h-full custom-scrollbar">
                        <div className="p-10 pb-24 relative">
                            {/* Depth architectural line */}
                            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/5 to-transparent" />

                            {isLoading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-40">
                                    {[1, 2, 3, 4, 5, 6].map(i => (
                                        <div key={i} className="h-40 rounded-[24px] border border-primary/5 bg-muted/10 animate-pulse" />
                                    ))}
                                </div>
                            ) : isError ? (
                                <div className="text-center py-20 px-8 border-2 border-dashed rounded-[32px] bg-destructive/5 text-destructive border-destructive/20 shadow-inner max-w-2xl mx-auto">
                                    <AlertCircle className="mx-auto h-10 w-10 mb-4 opacity-40" />
                                    <h3 className="text-[12px] font-black uppercase tracking-[0.2em]">Sync Corruption</h3>
                                    <p className="mt-2 text-[13px] leading-relaxed italic opacity-80 font-medium">{error?.message}</p>
                                </div>
                            ) : filteredProjects.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                                    {filteredProjects.map((p: Project) => (
                                        <ProjectNodeItem
                                            key={p.id}
                                            project={p.toProperties()}
                                            onLoad={handleLoadProject}
                                            isLoading={loadingProjectId === p.id}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-24 px-8 border-2 border-dashed rounded-[32px] bg-muted/5 shadow-inner max-w-md mx-auto relative group">
                                    <div className="absolute -inset-1 bg-gradient-to-br from-primary/5 to-transparent rounded-[32px] blur opacity-40 group-hover:opacity-100 transition duration-1000" />
                                    <div className="relative z-10">
                                        <div className="relative mx-auto h-20 w-20 mb-8 rounded-[24px] bg-background border border-primary/5 flex items-center justify-center shadow-lg">
                                            <FolderOpen className="h-10 w-10 text-muted-foreground/20 stroke-[1]" />
                                            <div className="absolute -bottom-1 -right-1 h-7 w-7 bg-primary/10 rounded-full border border-primary/20 flex items-center justify-center">
                                                <Search className="h-3.5 w-3.5 text-primary/40" />
                                            </div>
                                        </div>
                                        <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-muted-foreground">Manifest Empty</h3>
                                        <p className="mt-3 text-[11px] text-muted-foreground/60 leading-relaxed italic font-medium">
                                            {searchQuery
                                                ? `Zero records match the filter criteria "${searchQuery}".`
                                                : `No intelligence projects detected in the current session repository.`}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background/80 to-transparent pointer-events-none z-20" />
                </div>

                {/* Panel Footer */}
                <footer className="px-10 py-6 border-t border-primary/10 bg-background/40 backdrop-blur-xl flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <Database className="h-3.5 w-3.5 text-muted-foreground/30" />
                        <p className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-[0.25em]">
                            Project Repository · Version 1.0
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <DialogClose asChild>
                            <Button variant="ghost" className="text-[10px] font-black uppercase tracking-[0.2em] h-10 px-6 rounded-xl hover:bg-muted/10 transition-all">
                                Close Library
                            </Button>
                        </DialogClose>
                    </div>
                </footer>
            </DialogContent>
        </Dialog>
    )
}
