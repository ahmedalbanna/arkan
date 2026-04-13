'use client';

import { MarkdownViewer } from '@/components/shared/MarkdownViewer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useBuilderStore } from '@/hooks';
import { cn } from '@/infrastructure/utils/cn';
import { generateRandomId } from '@/infrastructure/utils/randomId';
import { useApplyReportTemplate, useReportTemplates } from '@/modules/templates/adapters/hooks/use-templates';
import { ReportTemplateProperties } from '@/modules/templates/domain/entities/ReportTemplate';
import {
    AlertCircle,
    ArrowLeft,
    BookOpen,
    CheckCircle2,
    ChevronRight,
    Clock,
    FileText,
    Grid3x3,
    Layers,
    LayoutTemplate,
    List,
    Loader2,
    Search,
    Star,
    StarOff
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SidebarContainer } from '../layout/SidebarContainer';

interface TemplateCardProps {
    template: ReportTemplateProperties;
    onSelect: () => void;
    isFavorite?: boolean;
    onToggleFavorite?: () => void;
}

function TemplateCard({ template, onSelect, isFavorite, onToggleFavorite }: TemplateCardProps) {
    const chapterCount = Array.isArray(template.content) ? template.content.length : 0;
    const sectionCount = Array.isArray(template.content)
        ? template.content.reduce((acc, ch) => acc + (ch.sections?.length || 0), 0)
        : 0;

    return (
        <div
            className="group relative p-4 rounded-2xl border border-primary/10 bg-card/40 hover:border-primary/30 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5"
            onClick={onSelect}
            onKeyDown={(e) => e.key === 'Enter' && onSelect()}
            role="button"
            tabIndex={0}
        >
            <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <h4 className="text-[13px] font-black uppercase tracking-tight group-hover:text-primary transition-colors truncate">
                            {template.name}
                        </h4>
                        {isFavorite && (
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 opacity-40 group-hover:opacity-60 transition-opacity">
                        <div className="flex items-center gap-1.5">
                            <Layers className="h-2.5 w-2.5" />
                            <span className="text-[8px] font-black uppercase tracking-widest">{chapterCount} ch</span>
                        </div>
                        <div className="h-1 w-1 rounded-full bg-primary/30" />
                        <div className="flex items-center gap-1.5">
                            <FileText className="h-2.5 w-2.5" />
                            <span className="text-[8px] font-black uppercase tracking-widest">{sectionCount} sec</span>
                        </div>
                    </div>
                </div>
                <Badge variant="outline" className="h-5 text-[8px] font-black border-primary/20 bg-primary/5 text-primary px-2 rounded-full uppercase tracking-wider">
                    v{template.version || '1.0'}
                </Badge>
            </div>

            <p className="text-[11px] text-muted-foreground/80 line-clamp-2 leading-relaxed italic mb-3">
                {template.description}
            </p>

            <div className="flex items-center justify-between">
                <div className="flex items-center text-[8px] text-primary font-black uppercase tracking-[0.25em] opacity-0 group-hover:opacity-100 transition-all translate-x-[-4px] group-hover:translate-x-0">
                    Initialize Blueprint <ChevronRight className="h-3 w-3 ml-1" />
                </div>
                {onToggleFavorite && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite();
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-primary/10"
                    >
                        {isFavorite ? (
                            <StarOff className="h-3 w-3 text-muted-foreground/40" />
                        ) : (
                            <Star className="h-3 w-3 text-muted-foreground/40" />
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}

// Template Preview Component
interface TemplatePreviewProps {
    template: ReportTemplateProperties;
    onApply: () => void;
    onBack: () => void;
    isLoading: boolean;
}

function TemplatePreview({ template, onApply, onBack, isLoading }: TemplatePreviewProps) {
    const chapterCount = Array.isArray(template.content) ? template.content.length : 0;
    const sectionCount = Array.isArray(template.content)
        ? template.content.reduce((acc, ch) => acc + (ch.sections?.length || 0), 0)
        : 0;

    const tocMarkdown = useMemo(() => {
        try {
            if (!template.content || !Array.isArray(template.content)) return '';
            return template.content.map(chapter =>
                `# ${chapter.title}\n${(chapter.sections || []).map(section => `  - ${section.title}`).join('\n')}`
            ).join('\n\n');
        } catch (e) {
            console.error('[TemplateLibraryHUD] Failed to generate TOC preview:', e);
            return '';
        }
    }, [template]);

    return (
        <div className="flex flex-col h-full space-y-6 pt-2 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={onBack} className="h-8 text-[9px] font-black uppercase tracking-[0.2em] gap-2 hover:bg-primary/10 -ml-2 rounded-xl">
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to Library
                </Button>
                <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-[8px] font-black text-primary/70 uppercase tracking-widest">Preview Mode</span>
                </div>
            </div>

            {/* Template Info */}
            <div className="space-y-4 relative">
                <div className="absolute left-[-1.25rem] top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/5 to-transparent" />

                <div className="space-y-2 px-1">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-[18px] font-black uppercase tracking-tight leading-tight text-foreground/90">
                            {template.name}
                        </h3>
                        <Badge variant="outline" className="h-5 text-[8px] font-mono">
                            v{template.version || '1.0'}
                        </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground/70 leading-relaxed italic font-medium">
                        {template.description}
                    </p>
                    <div className="flex items-center gap-4 text-[8px] text-muted-foreground/40 mt-2">
                        <div className="flex items-center gap-1.5">
                            <Layers className="h-3 w-3" />
                            <span>{chapterCount} chapters</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <FileText className="h-3 w-3" />
                            <span>{sectionCount} sections</span>
                        </div>
                        {template.createdAt && (
                            <>
                                <div className="h-3 w-px bg-primary/10" />
                                <div className="flex items-center gap-1.5">
                                    <Clock className="h-3 w-3" />
                                    <span>Created {new Date(template.createdAt).toLocaleDateString()}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <Separator className="bg-gradient-to-r from-primary/20 via-primary/5 to-transparent h-px" />

                {/* Preview Content */}
                <div className="space-y-4 flex-1 flex flex-col min-h-0">
                    <div className="flex items-center gap-2.5 group/label">
                        <BookOpen className="h-3.5 w-3.5 text-primary/40 group-hover/label:text-primary transition-colors" />
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
                            Architectural Matrix
                        </Label>
                    </div>

                    <ScrollArea className={cn(
                        "rounded-2xl border border-primary/10 bg-muted/5 shadow-inner",
                        "h-[400px]"
                    )}>
                        <div className="p-6 relative overflow-hidden">
                            <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_center,_var(--primary)_1px,_transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
                            <MarkdownViewer content={tocMarkdown} className="relative z-10 prose-sm text-[11px] leading-relaxed font-medium" />
                        </div>
                    </ScrollArea>
                </div>
            </div>

            {/* Action Footer */}
            <div className="pt-4 mt-auto border-t border-primary/10 bg-background/40 -mx-5 px-5 pb-2">
                <Button
                    onClick={onApply}
                    disabled={isLoading}
                    className="w-full h-11 text-[10px] font-black uppercase tracking-[0.2em] gap-2.5 shadow-2xl shadow-primary/20 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.98] ring-1 ring-inset ring-white/20"
                >
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            <CheckCircle2 className="h-4 w-4" />
                            Initialize Project Hierarchy
                        </>
                    )}
                </Button>
                <div className="flex items-center justify-center gap-2 mt-3 opacity-40">
                    <div className="h-1 w-1 rounded-full bg-amber-500" />
                    <p className="text-[7px] text-muted-foreground text-center italic font-black uppercase tracking-widest">
                        Applying will reset current document structure
                    </p>
                </div>
            </div>
        </div>
    );
}

// Main Component
export function TemplateLibraryHUD() {
    const { data: templates, isLoading, isError, error } = useReportTemplates();
    const [searchQuery, setSearchQuery] = useState('');
    const [previewTemplate, setPreviewTemplate] = useState<ReportTemplateProperties | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [localError, setLocalError] = useState<string | null>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const { updateProject, project } = useBuilderStore();
    const { handleSelectTemplate, isApplyingTemplate } = useApplyReportTemplate();

    // Load favorites from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('template-favorites');
        if (saved) {
            try {
                setFavorites(new Set(JSON.parse(saved)));
            } catch (e) {
                console.error('Failed to load favorites', e);
            }
        }
    }, []);

    // Save favorites
    const toggleFavorite = useCallback((templateId: string) => {
        setFavorites(prev => {
            const newSet = new Set(prev);
            if (newSet.has(templateId)) {
                newSet.delete(templateId);
            } else {
                newSet.add(templateId);
            }
            localStorage.setItem('template-favorites', JSON.stringify(Array.from(newSet)));
            return newSet;
        });
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        if (previewTemplate) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            if (e.key === 'Escape' && searchQuery) {
                setSearchQuery('');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [previewTemplate, searchQuery]);

    const filteredTemplates = useMemo(() => {
        if (!templates) return [];
        let filtered = templates;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (t) =>
                    t.name.toLowerCase().includes(query) ||
                    t.description.toLowerCase().includes(query)
            );
        }

        // Sort: favorites first, then by name
        return filtered.sort((a, b) => {
            const aFav = favorites.has(a.id);
            const bFav = favorites.has(b.id);
            if (aFav && !bFav) return -1;
            if (!aFav && bFav) return 1;
            return a.name.localeCompare(b.name);
        });
    }, [templates, searchQuery, favorites]);

    const handleApplyBlueprint = useCallback(() => {
        if (!previewTemplate || !updateProject) return;

        try {
            const content = Array.isArray(previewTemplate.content) ? previewTemplate.content : [];
            const tocMarkdown = content.map(chapter =>
                `# ${chapter.title}\n${(chapter.sections || []).map(section => `  - ${section.title}`).join('\n')}`
            ).join('\n\n');

            if (!tocMarkdown) {
                setLocalError('Blueprint contains no valid structural nodes.');
                return;
            }

            updateProject(p => {
                if (!p) return p;
                const newContent = p.parseAndSetContentFromToc(tocMarkdown, generateRandomId);
                return p.withProps({ content: [...newContent] });
            });

            if (project?.id) {
                handleSelectTemplate(previewTemplate.id, project.id);
                setPreviewTemplate(null);
                setLocalError(null);
            }
        } catch (e) {
            console.error('[TemplateLibraryHUD] Blueprint application failed:', e);
            setLocalError('An internal error occurred while initializing the blueprint.');
        }
    }, [previewTemplate, updateProject, project?.id, handleSelectTemplate]);

    if (previewTemplate) {
        return (
            <TemplatePreview
                template={previewTemplate}
                onApply={handleApplyBlueprint}
                onBack={() => {
                    setPreviewTemplate(null);
                    setLocalError(null);
                }}
                isLoading={isApplyingTemplate}
            />
        );
    }

    return (
        <SidebarContainer
            title="Library Blueprints"
            icon={<LayoutTemplate className="h-3.5 w-3.5" />}
        >
            <div className="flex flex-col h-full pt-2">
                {/* Header */}
                <div className="space-y-1.5 mb-5 px-1">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">Structural Hub</h4>
                    <p className="text-[9px] text-muted-foreground italic font-medium opacity-60 uppercase tracking-widest">
                        Initialize expert-defined hierarchies to optimize output logic.
                    </p>
                </div>

                {/* Search and View Controls */}
                <div className="flex items-center gap-3 mb-5 px-1">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/30" />
                        <Input
                            ref={searchInputRef}
                            placeholder={"Search templates..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-9 text-[10px] bg-muted/5 border-primary/10 rounded-lg focus-visible:ring-primary/20"
                        />
                    </div>

                    {(
                        <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/5 border border-primary/10">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={cn(
                                    "p-1.5 rounded-md transition-all",
                                    viewMode === 'grid' ? "bg-primary/10 text-primary" : "text-muted-foreground/40 hover:text-primary"
                                )}
                            >
                                <Grid3x3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={cn(
                                    "p-1.5 rounded-md transition-all",
                                    viewMode === 'list' ? "bg-primary/10 text-primary" : "text-muted-foreground/40 hover:text-primary"
                                )}
                            >
                                <List className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Templates Grid/List */}
                <div className="flex-1 relative min-h-0">
                    <ScrollArea className="h-full pr-2 -mr-2">
                        <div className={cn(
                            "pb-24 relative px-1",
                            viewMode === 'grid' ? "grid grid-cols-2 gap-3" : "space-y-3"
                        )}>
                            <div className="absolute left-[-1.25rem] top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/5 to-transparent" />

                            {localError && (
                                <div className="flex items-center gap-2 p-3.5 rounded-xl bg-destructive/5 border border-destructive/10 text-destructive text-[10px] font-bold uppercase tracking-wider mb-4 animate-in zoom-in-95 col-span-full">
                                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                    <span>{localError}</span>
                                </div>
                            )}

                            {isLoading ? (
                                <div className="flex flex-col justify-center items-center h-64 space-y-4 opacity-40 col-span-full">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
                                    <p className="text-[9px] uppercase tracking-[0.25em] font-black">Loading Blueprints...</p>
                                </div>
                            ) : isError ? (
                                <div className="text-center py-12 px-6 border border-dashed rounded-2xl bg-destructive/5 text-destructive border-destructive/20 col-span-full">
                                    <AlertCircle className="mx-auto h-8 w-8 mb-3 opacity-40" />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Matrix Corruption</h3>
                                    <p className="mt-2 text-[11px] leading-relaxed italic opacity-70 font-medium">{error?.message}</p>
                                </div>
                            ) : filteredTemplates.length > 0 ? (
                                filteredTemplates.map(t => (
                                    <TemplateCard
                                        key={t.id}
                                        template={t}
                                        onSelect={() => setPreviewTemplate(t)}
                                        isFavorite={favorites.has(t.id)}
                                        onToggleFavorite={() => toggleFavorite(t.id)}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-16 px-8 border border-dashed rounded-2xl bg-muted/5 shadow-inner opacity-40 col-span-full">
                                    <div className="relative mx-auto h-12 w-12 mb-4">
                                        <FileText className="h-12 w-12 text-muted-foreground stroke-[1]" />
                                        <Search className="absolute -bottom-1 -right-1 h-5 w-5 text-primary bg-background rounded-full p-1 border shadow-sm" />
                                    </div>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Zero Results</h3>
                                    <p className="mt-2 text-[11px] leading-relaxed italic font-medium">
                                        No blueprint matches the current search parameters.
                                    </p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* Footer Stats */}
                <div className="absolute bottom-0 left-0 right-0 px-5 py-2.5 border-t border-primary/10 bg-background/80 backdrop-blur-sm flex items-center justify-between text-[7px]">
                    <div className="flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-primary/30" />
                        <span className="font-black uppercase tracking-widest text-muted-foreground/40">
                            {filteredTemplates.length} blueprint{filteredTemplates.length !== 1 ? 's' : ''}
                        </span>
                        {favorites.size > 0 && (
                            <>
                                <span className="text-muted-foreground/20">•</span>
                                <span className="font-mono text-muted-foreground/30">
                                    {favorites.size} favorited
                                </span>
                            </>
                        )}
                    </div>
                    {(
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-muted-foreground/20">
                                ⌘F to search
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </SidebarContainer>
    );
}
