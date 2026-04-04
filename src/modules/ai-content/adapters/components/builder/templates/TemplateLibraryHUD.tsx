'use client';

import React, { useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
    AlertCircle, 
    FileText, 
    Loader2, 
    Search, 
    ArrowLeft, 
    LayoutTemplate, 
    CheckCircle2, 
    ChevronRight, 
    BookOpen,
    Layers
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { cn } from '@/infrastructure/utils/cn';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore } from '@/hooks';
import { MarkdownViewer } from '@/components/shared/MarkdownViewer';
import { useApplyReportTemplate, useReportTemplates } from '@/modules/templates/adapters/hooks/use-templates';
import { ReportTemplateProperties } from '@/modules/templates/domain/entities/ReportTemplate';
import { SidebarContainer } from '../layout/SidebarContainer';

/**
 * TemplateLibraryHUD — Immersive catalog for structural blueprints.
 * Allows rapid initialization of document hierarchies from expert-defined matrices.
 */

interface TemplateCardProps {
    template: ReportTemplateProperties;
    onSelect: () => void;
}

function TemplateCard({ template, onSelect }: TemplateCardProps) {
    const chapterCount = Array.isArray(template.content) ? template.content.length : 0;
    
    return (
        <div 
            className="group relative p-4 rounded-2xl border border-border/40 bg-card/40 hover:border-primary/30 transition-all duration-300 cursor-pointer shadow-sm hover:translate-x-0.5 hover:bg-muted/5"
            onClick={onSelect}
            onKeyDown={(e) => e.key === 'Enter' && onSelect()}
            role="button"
            tabIndex={0}
        >
            <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                    <h4 className="text-[13px] font-black uppercase tracking-tight group-hover:text-primary transition-colors truncate">
                        {template.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 opacity-40 group-hover:opacity-60 transition-opacity">
                        <Layers className="h-2.5 w-2.5" />
                        <span className="text-[8px] font-black uppercase tracking-widest">{template.id.slice(0, 8)} VECTOR</span>
                    </div>
                </div>
                <Badge variant="outline" className="h-5 text-[9px] font-black border-primary/20 bg-primary/5 text-primary tabular-nums px-2.5 rounded-full shadow-inner uppercase tracking-widest">
                    {chapterCount} CH
                </Badge>
            </div>
            
            <p className="text-[11px] text-muted-foreground/80 line-clamp-2 leading-relaxed italic mb-3">
                {template.description}
            </p>

            <div className="flex items-center text-[8px] text-primary font-black uppercase tracking-[0.25em] opacity-0 group-hover:opacity-100 transition-all translate-x-[-4px] group-hover:translate-x-0">
                Initialize Blueprint <ChevronRight className="h-3 w-3 ml-1" />
            </div>
        </div>
    );
}

// ── Template Preview Mode ──────────────────────────────────────────────────────

interface TemplatePreviewProps {
    template: ReportTemplateProperties;
    onApply: () => void;
    onBack: () => void;
    isLoading: boolean;
}

function TemplatePreview({ template, onApply, onBack, isLoading }: TemplatePreviewProps) {
    const tocMarkdown = useMemo(() => {
        if (!template.content || !Array.isArray(template.content)) return '';
        return template.content.map(chapter => 
            `# ${chapter.title}\n${(chapter.sections || []).map(section => `  - ${section.title}`).join('\n')}`
        ).join('\n\n');
    }, [template]);

    return (
        <div className="flex flex-col h-full space-y-8 pt-2 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={onBack} className="h-8 text-[9px] font-black uppercase tracking-[0.2em] gap-2 hover:bg-primary/10 -ml-2 rounded-xl transition-all">
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to Library
                </Button>
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/5 border border-primary/10">
                    <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                    <span className="text-[8px] font-black text-primary/70 uppercase tracking-widest">Preview Mode</span>
                </div>
            </div>

            <div className="space-y-6 relative flex-1 flex flex-col min-h-0">
                <div className="absolute left-[-1.25rem] top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/5 to-transparent" />
                
                <div className="space-y-2 px-1">
                    <h3 className="text-[16px] font-black uppercase tracking-tight leading-tight text-foreground/90">{template.name}</h3>
                    <p className="text-[11px] text-muted-foreground/70 leading-relaxed italic font-medium">{template.description}</p>
                </div>

                <Separator className="bg-gradient-to-r from-primary/20 via-primary/5 to-transparent h-px" />

                <div className="space-y-4 flex-1 flex flex-col min-h-0">
                    <div className="flex items-center gap-2.5 group/label">
                        <BookOpen className="h-3.5 w-3.5 text-primary/40 group-hover/label:text-primary transition-colors" />
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Architectural Matrix</Label>
                    </div>
                    
                    <ScrollArea className="flex-1 rounded-[24px] border border-primary/10 bg-muted/5 shadow-inner">
                        <div className="p-6 pb-12 relative overflow-hidden">
                            {/* Visual background atmospheric grid */}
                            <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_center,_var(--primary)_1px,_transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
                            <MarkdownViewer content={tocMarkdown} className="relative z-10 prose-sm text-[11px] leading-relaxed font-medium selection:bg-primary/20" />
                        </div>
                    </ScrollArea>
                </div>
            </div>

            <div className="pt-6 mt-auto border-t border-primary/10 bg-background/40 backdrop-blur-xl -mx-5 px-5 pb-2">
                <Button 
                    onClick={onApply} 
                    disabled={isLoading} 
                    className="w-full h-12 text-[10px] font-black uppercase tracking-[0.2em] gap-2.5 shadow-2xl shadow-primary/20 rounded-2xl transition-all hover:scale-[1.01] active:scale-[0.98] ring-1 ring-inset ring-white/20"
                >
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin"/>
                    ) : (
                        <>
                            <CheckCircle2 className="h-4 w-4" />
                            Initialize Project Hierarchy
                        </>
                    )}
                </Button>
                <div className="flex items-center justify-center gap-2 mt-4 opacity-40">
                    <div className="h-1 w-1 rounded-full bg-amber-500" />
                    <p className="text-[8px] text-muted-foreground text-center italic font-black uppercase tracking-widest">
                        Applying will reset current manifest structure.
                    </p>
                </div>
            </div>
        </div>
    );
}

// ── Main Controller ────────────────────────────────────────────────────────────

export function TemplateLibraryHUD() {
    const { data: templates, isLoading, isError, error } = useReportTemplates();
    const [searchQuery, setSearchQuery] = useState('');
    const [previewTemplate, setPreviewTemplate] = useState<ReportTemplateProperties | null>(null);
    const { updateProject, project } = useBuilderStore();
    const { handleSelectTemplate, isApplyingTemplate } = useApplyReportTemplate();

    const filteredTemplates = useMemo(() => {
        if (!templates) return [];
        return templates.filter(
            (t) =>
                t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [templates, searchQuery]);
    
    if (previewTemplate) {
        return (
            <TemplatePreview 
                template={previewTemplate}
                onApply={() => {
                    const content = Array.isArray(previewTemplate.content) ? previewTemplate.content : [];
                    const tocMarkdown = content.map(chapter => 
                        `# ${chapter.title}\n${(chapter.sections || []).map(section => `  - ${section.title}`).join('\n')}`
                    ).join('\n\n');
                    if (tocMarkdown) {
                        updateProject(p => {
                            const newContent = p.parseAndSetContentFromToc(tocMarkdown, uuidv4);
                            return p.withProps({ content: [...newContent] });
                        });
                    }
                    if (project?.id) {
                        handleSelectTemplate(previewTemplate.id, project.id);
                        setPreviewTemplate(null);
                    }
                }}
                onBack={() => setPreviewTemplate(null)}
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
                <div className="space-y-1.5 mb-6 px-1">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">Structural Hub</h4>
                    <p className="text-[9px] text-muted-foreground italic font-medium opacity-60 uppercase tracking-widest">
                        Initialize expert-defined hierarchies to optimize output logic.
                    </p>
                </div>

                <div className="relative mb-6 px-1 group/search">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/30 group-focus-within/search:text-primary transition-colors" />
                    <Input
                        placeholder="SCAN LIBRARY..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-10 text-[10px] bg-muted/5 border-primary/10 focus-visible:ring-primary/20 rounded-xl shadow-inner transition-all font-bold uppercase tracking-widest placeholder:text-muted-foreground/20"
                    />
                </div>

                <div className="flex-1 relative min-h-0">
                    <ScrollArea className="h-full pr-4 -mr-4">
                        <div className="space-y-4 pb-24 relative px-1">
                            {/* Depth architectural line */}
                            <div className="absolute left-[-1.25rem] top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/5 to-transparent" />
                            
                            {isLoading ? (
                                <div className="flex flex-col justify-center items-center h-64 space-y-4 opacity-40">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
                                    <p className="text-[9px] uppercase tracking-[0.25em] font-black">Scanning Matrix...</p>
                                </div>
                            ) : isError ? (
                                <div className="text-center py-12 px-6 border border-dashed rounded-[24px] bg-destructive/5 text-destructive border-destructive/20 shadow-inner">
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
                                    />
                                ))
                            ) : (
                                <div className="text-center py-16 px-8 border border-dashed rounded-[24px] bg-muted/5 shadow-inner opacity-40">
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

                {/* Stable Version Footer */}
                <div className="absolute bottom-0 left-0 right-0 px-6 py-3 border-t border-primary/10 bg-background/40 backdrop-blur-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-primary/30" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">Blueprint System</span>
                    </div>
                    <span className="text-[8px] font-bold text-muted-foreground/20 tabular-nums">v1.4.2-STABLE</span>
                </div>
            </div>
        </SidebarContainer>
    );
}
