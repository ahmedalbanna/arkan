'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogTitle
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useBuilderStore } from '@/hooks';
import { useMobile } from '@/hooks/util/use-mobile';
import { cn } from '@/infrastructure/utils/cn';
import { Chapter } from '@/modules/ai-content/domain/entities/Chapter';
import {
    AlertCircle,
    BarChart3,
    Binary,
    Building,
    ChevronDown,
    ChevronUp,
    Clock,
    Database,
    FileText,
    Layers,
    Loader2,
    ShieldAlert,
    Zap
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface BuildManifestHUDProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    chaptersToBuild: Chapter[];
    onGenerateProject: () => void;
    isLoading: boolean;
    estimatedTime?: number;
}

export function BuildManifestHUD({
    isOpen,
    onOpenChange,
    chaptersToBuild = [],
    onGenerateProject,
    isLoading,
    estimatedTime = 30,
}: BuildManifestHUDProps) {
    const isDesktop = !useMobile();
    const project = useBuilderStore(state => state.project);
    const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
    const [showDetails, setShowDetails] = useState(false);

    // Expand all chapters by default when dialog opens
    useEffect(() => {
        if (isOpen && chaptersToBuild.length > 0) {
            setExpandedChapters(new Set(chaptersToBuild.map(c => c.id)));
        }
    }, [isOpen, chaptersToBuild]);

    // Calculate statistics
    const totalSections = useMemo(() => {
        try {
            if (!Array.isArray(chaptersToBuild)) return 0;
            return chaptersToBuild.reduce((acc, chapter) => {
                const sectionsCount = Array.isArray(chapter?.sections) ? chapter.sections.length : 0;
                return acc + sectionsCount;
            }, 0);
        } catch (e) {
            console.error('[BuildManifestHUD] Section count calculation failed:', e);
            return 0;
        }
    }, [chaptersToBuild]);

    const totalWords = useMemo(() => {
        try {
            return chaptersToBuild.reduce((acc, chapter) => {
                const chapterWords = chapter.sections?.reduce((sum, section) => {
                    return sum + (section.content?.split(/\s+/).filter(w => w.length > 0).length || 0);
                }, 0) || 0;
                return acc + chapterWords;
            }, 0);
        } catch (e) {
            return 0;
        }
    }, [chaptersToBuild]);

    const isValidManifest = useMemo(() => {
        return !!project && chaptersToBuild.length > 0 && totalSections > 0;
    }, [project, chaptersToBuild, totalSections]);

    // Calculate estimated tokens
    const estimatedTokens = totalWords * 1.3; // Rough estimate: 1.3 tokens per word

    // Toggle chapter expansion
    const toggleChapter = useCallback((chapterId: string) => {
        setExpandedChapters(prev => {
            const newSet = new Set(prev);
            if (newSet.has(chapterId)) {
                newSet.delete(chapterId);
            } else {
                newSet.add(chapterId);
            }
            return newSet;
        });
    }, []);

    const expandAll = useCallback(() => {
        setExpandedChapters(new Set(chaptersToBuild.map(c => c.id)));
    }, [chaptersToBuild]);

    const collapseAll = useCallback(() => {
        setExpandedChapters(new Set());
    }, []);

    const handleOpenChange = useCallback((open: boolean) => {
        if (!isLoading) {
            onOpenChange(open);
            if (!open) {
                setShowDetails(false);
            }
        }
    }, [onOpenChange, isLoading]);

    const handleGenerateProject = useCallback(() => {
        if (!isValidManifest || isLoading) return;
        onGenerateProject();
    }, [onGenerateProject, isValidManifest, isLoading]);

    // Keyboard shortcuts
    useEffect(() => {
        if (!isOpen || !isDesktop) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                if (isValidManifest && !isLoading) {
                    handleGenerateProject();
                }
            }
            if (e.key === 'Escape' && !isLoading) {
                onOpenChange(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isDesktop, isValidManifest, isLoading, handleGenerateProject, onOpenChange]);

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className={cn(
                "p-0 overflow-hidden flex flex-col gap-0 border-primary/10 shadow-2xl rounded-2xl bg-background/95 backdrop-blur-xl",
                isDesktop ? "max-w-5xl h-[85vh]" : "max-w-[95vw] h-[90vh]"
            )}>
                {/* Header */}
                <header className="px-6 py-5 border-b border-primary/10 bg-primary/[0.02] relative overflow-hidden shrink-0">
                    <div
                        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] bg-[radial-gradient(circle_at_center,_var(--primary)_1px,_transparent_1px)] pointer-events-none"
                        style={{ backgroundSize: '28px 28px' }}
                    />

                    <div className="flex items-start justify-between relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                                <Building className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <DialogTitle className="text-[16px] font-black uppercase tracking-tight">
                                    Build Manifest
                                </DialogTitle>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className={cn(
                                        "h-1.5 w-1.5 rounded-full",
                                        isValidManifest ? "bg-primary animate-pulse" : "bg-muted-foreground/30"
                                    )} />
                                    <p className="text-[9px] font-black uppercase tracking-[0.25em] text-primary/70">
                                        {isValidManifest ? 'Production Pipeline Ready' : 'Pipeline Configuration Pending'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Stats Badges - Desktop */}
                        {isDesktop && isValidManifest && (
                            <div className="flex items-center gap-2">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-primary/5 border border-primary/10">
                                                <FileText className="h-3 w-3 text-primary/60" />
                                                <span className="text-[9px] font-black">{totalSections} sections</span>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom" className="text-[8px]">
                                            Total sections to generate
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-primary/5 border border-primary/10">
                                                <BarChart3 className="h-3 w-3 text-primary/60" />
                                                <span className="text-[9px] font-mono">~{estimatedTokens.toFixed(0)} tokens</span>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom" className="text-[8px]">
                                            Estimated token usage
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-primary/5 border border-primary/10">
                                                <Clock className="h-3 w-3 text-primary/60" />
                                                <span className="text-[9px] font-mono">~{estimatedTime}s</span>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom" className="text-[8px]">
                                            Estimated generation time
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        )}
                    </div>

                    <DialogDescription className="text-[11px] text-muted-foreground/70 leading-relaxed mt-3 font-medium pl-15">
                        Confirm the synthesized build hierarchy. The AI engine will initialize a multi-node synthesis based on the current project metadata and cognitive constraints.
                    </DialogDescription>
                </header>

                {/* Body */}
                <div className="flex-1 overflow-hidden relative min-h-0 flex flex-col">
                    <ScrollArea className="h-full custom-scrollbar">
                        <div className="p-5 space-y-6 relative">
                            {/* Depth line */}
                            <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/5 to-transparent" />

                            {!isValidManifest ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 opacity-40">
                                    <div className="p-5 rounded-xl bg-primary/5 border border-dashed border-primary/20">
                                        <ShieldAlert className="h-10 w-10 text-primary/40" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-muted-foreground">Empty Pipeline</p>
                                        <p className="text-[10px] font-medium leading-relaxed italic text-muted-foreground/60 max-w-[260px]">
                                            No nodes have been selected for synthesis. Please define the build hierarchy in the navigator first.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Project Info Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Source Matrix */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Database className="h-3 w-3 text-primary/60" />
                                                <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                                                    Source Matrix
                                                </Label>
                                            </div>
                                            <div className="p-4 rounded-xl border border-primary/10 bg-muted/5">
                                                <p className="text-[8px] font-black text-primary/40 uppercase tracking-widest">Project</p>
                                                <p className="text-[13px] font-black uppercase tracking-tight truncate mt-1">{project?.name || 'Untitled'}</p>
                                                <Separator className="my-3 bg-primary/5" />
                                                <p className="text-[8px] font-black text-primary/40 uppercase tracking-widest">Brief</p>
                                                <p className="text-[10px] text-muted-foreground/70 line-clamp-3 leading-relaxed italic mt-1">
                                                    {project?.projectDescription || "No intellectual brief provided."}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Cost Estimate */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Zap className="h-3 w-3 text-primary/60" />
                                                <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                                                    Resource Estimate
                                                </Label>
                                            </div>
                                            <div className="p-4 rounded-xl border border-primary/10 bg-primary/[0.02]">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-primary/80">Synthesis Cost</span>
                                                    <Badge variant="outline" className="h-6 text-[11px] font-black text-primary bg-primary/5 border-primary/20 px-3 rounded-lg">
                                                        {totalSections} credits
                                                    </Badge>
                                                </div>
                                                <Progress value={75} className="h-1.5 bg-primary/10" />
                                                <p className="text-[7px] text-muted-foreground/40 mt-2 text-center">
                                                    Multi-node concurrent processing
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Warning Alert */}
                                    <Alert className="bg-amber-500/5 border-amber-500/20 rounded-xl p-3">
                                        <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                                        <AlertDescription className="text-[9px] text-amber-700/80 dark:text-amber-400/80 leading-relaxed italic font-medium ml-2">
                                            Initializing build will overwrite existing content in the selected nodes. This operation cannot be reversed.
                                        </AlertDescription>
                                    </Alert>

                                    {/* Build Hierarchy */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Layers className="h-3.5 w-3.5 text-primary/60" />
                                                <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                                                    Synthesis Plan
                                                </Label>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {isDesktop && (
                                                    <>
                                                        <button
                                                            onClick={expandAll}
                                                            className="text-[7px] font-black uppercase tracking-wider text-muted-foreground/40 hover:text-primary transition-colors"
                                                        >
                                                            Expand All
                                                        </button>
                                                        <span className="text-muted-foreground/20">•</span>
                                                        <button
                                                            onClick={collapseAll}
                                                            className="text-[7px] font-black uppercase tracking-wider text-muted-foreground/40 hover:text-primary transition-colors"
                                                        >
                                                            Collapse All
                                                        </button>
                                                    </>
                                                )}
                                                <Badge variant="outline" className="h-5 text-[8px] font-mono border-primary/20">
                                                    {totalSections} sections
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="rounded-xl border border-primary/10 bg-muted/5 shadow-inner overflow-hidden">
                                            <ScrollArea className="max-h-[320px]">
                                                <div className="p-4 space-y-4">
                                                    {chaptersToBuild.map((chapter, idx) => {
                                                        const isExpanded = expandedChapters.has(chapter.id);
                                                        const sectionCount = chapter.sections?.length || 0;

                                                        return (
                                                            <div key={chapter.id} className="space-y-2">
                                                                <button
                                                                    onClick={() => toggleChapter(chapter.id)}
                                                                    className="flex items-center gap-2 w-full group"
                                                                >
                                                                    {isExpanded ? (
                                                                        <ChevronUp className="h-3 w-3 text-muted-foreground/40" />
                                                                    ) : (
                                                                        <ChevronDown className="h-3 w-3 text-muted-foreground/40" />
                                                                    )}
                                                                    <span className="text-[10px] font-black bg-primary/10 text-primary w-5 h-5 rounded-lg flex items-center justify-center shrink-0">
                                                                        {idx + 1}
                                                                    </span>
                                                                    <span className="text-[11px] font-bold uppercase tracking-tight flex-1 text-left">
                                                                        {chapter.title || 'Untitled Chapter'}
                                                                    </span>
                                                                    <span className="text-[8px] text-muted-foreground/40 font-mono">
                                                                        {sectionCount} sec
                                                                    </span>
                                                                </button>

                                                                {isExpanded && sectionCount > 0 && (
                                                                    <div className="pl-7 space-y-1.5 border-l border-primary/10 ml-2">
                                                                        {chapter.sections?.map((section) => (
                                                                            <div key={section.id} className="flex items-center gap-2 group/item">
                                                                                <div className="h-1 w-1 rounded-full bg-primary/30 group-hover/item:bg-primary group-hover/item:scale-125 transition-all" />
                                                                                <span className="text-[10px] text-muted-foreground group-hover/item:text-foreground transition-colors truncate">
                                                                                    {section.title || 'Untitled Section'}
                                                                                </span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </ScrollArea>
                                        </div>
                                    </div>

                                    {/* Details Toggle */}
                                    {isDesktop && (
                                        <button
                                            onClick={() => setShowDetails(!showDetails)}
                                            className="flex items-center justify-center gap-1 w-full text-[8px] font-black uppercase tracking-wider text-muted-foreground/40 hover:text-primary transition-colors py-1"
                                        >
                                            {showDetails ? 'Hide Details' : 'Show Details'}
                                            <ChevronDown className={cn("h-3 w-3 transition-transform", showDetails && "rotate-180")} />
                                        </button>
                                    )}

                                    {/* Detailed Stats */}
                                    {showDetails && isDesktop && (
                                        <div className="p-4 rounded-xl bg-muted/5 border border-primary/10 space-y-2">
                                            <div className="flex justify-between text-[8px]">
                                                <span className="text-muted-foreground/60">Total Chapters</span>
                                                <span className="font-mono">{chaptersToBuild.length}</span>
                                            </div>
                                            <div className="flex justify-between text-[8px]">
                                                <span className="text-muted-foreground/60">Total Sections</span>
                                                <span className="font-mono">{totalSections}</span>
                                            </div>
                                            <div className="flex justify-between text-[8px]">
                                                <span className="text-muted-foreground/60">Estimated Words</span>
                                                <span className="font-mono">{totalWords.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-[8px]">
                                                <span className="text-muted-foreground/60">Estimated Tokens</span>
                                                <span className="font-mono">{Math.ceil(estimatedTokens).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-[8px]">
                                                <span className="text-muted-foreground/60">Generation Time</span>
                                                <span className="font-mono">~{estimatedTime} seconds</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* Footer */}
                <footer className="px-5 py-3 border-t border-primary/10 bg-background/80 backdrop-blur-sm flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-primary/30" />
                        <p className="text-[7px] text-muted-foreground/40 font-black uppercase tracking-[0.25em]">
                            Build Pipeline • Stable
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <DialogClose asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={isLoading}
                                className="text-[9px] font-black uppercase tracking-[0.2em] h-8 px-4 rounded-lg hover:bg-destructive/5 hover:text-destructive transition-all"
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            onClick={handleGenerateProject}
                            disabled={isLoading || !isValidManifest}
                            className="h-8 px-5 text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 bg-primary hover:opacity-90 gap-2 rounded-lg transition-all"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    <Binary className="h-3.5 w-3.5" />
                                    <span>Initialize Build</span>
                                </>
                            )}
                        </Button>
                    </div>
                </footer>
            </DialogContent>
        </Dialog>
    );
}
