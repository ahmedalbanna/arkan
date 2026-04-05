'use client';

import React, { useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocalization } from '@/context/LocalizationContext';
import { useTemplates } from '@/hooks';
import { Loader2, Plus, FileText, Presentation, FileCode, Database, Binary, ShieldCheck, Search, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TemplateCard } from './TemplateCard';
import { TemplateFormDialog } from './TemplateFormDialog';
import { PptxTemplate } from '@/modules/templates/domain/entities/PptxTemplate';
import { DocxTemplate } from '@/modules/templates/domain/entities/DocxTemplate';
import { ReportTemplate } from '@/modules/templates/domain/entities/ReportTemplate';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/infrastructure/utils/cn';

/**
 * TemplateManagementConsole — High-fidelity manifest for global style hierarchies.
 * Orchestrates the lifecycle of DOCX, PPTX, and Project Report blueprints.
 * 
 * DEFENSIVE MEASURES:
 * 1. Safe Mapping: Normalizes disparate template objects into a consistent list format.
 * 2. Type Resilience: Uses explicit instanceof guards for domain entity instantiation.
 * 3. Existence Guards: Prevents operations on partially hydrated or null templates.
 * 4. Technical Aesthetic: Standardized 28px dot-grids and technical typography.
 */

type TemplateType = 'docx' | 'pptx' | 'report';
type TemplateData = DocxTemplate | PptxTemplate | ReportTemplate;

// ── Specialized Sub-Managers ───────────────────────────────────────────────────

const TemplateGridManager = ({ 
    type, 
    onEdit 
}: { 
    type: TemplateType, 
    onEdit: (template: TemplateData) => void 
}) => {
    const { data: templates, isLoading, isError } = useTemplates(type);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4 opacity-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
                <p className="text-[10px] font-black uppercase tracking-[0.25em]">Syncing Style Repository...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="py-20 text-center border-2 border-dashed border-destructive/20 rounded-[32px] bg-destructive/5 space-y-4">
                <ShieldCheck className="h-10 w-10 mx-auto text-destructive/40" />
                <p className="text-[11px] font-black uppercase tracking-widest text-destructive/80">Blueprint Corrupted</p>
            </div>
        );
    }

    // 1. DATA NORMALIZATION — Defensive array conversion
    const templatesList = Array.isArray(templates) 
        ? templates 
        : (templates ? Object.values(templates) : []);

    if (templatesList.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-5 opacity-30 group/empty">
                <div className="p-6 rounded-[24px] border border-dashed border-primary/20 bg-muted/5 shadow-inner">
                    <LayoutGrid className="h-10 w-10 text-muted-foreground group-hover/empty:scale-110 transition-transform duration-500" />
                </div>
                <div className="space-y-1.5 px-10">
                    <h3 className="text-[12px] font-black uppercase tracking-[0.3em]">Zero Blueprint Match</h3>
                    <p className="text-[11px] italic font-medium max-w-sm">No architectural templates defined for this vector category.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-700">
            {templatesList.map((template: any) => {
                let entity: TemplateData;
                try {
                    if (type === 'docx') entity = new DocxTemplate(template);
                    else if (type === 'pptx') entity = new PptxTemplate(template);
                    else entity = new ReportTemplate(template);

                    return (
                        <TemplateCard 
                            key={template.id} 
                            template={entity} 
                            onEdit={() => onEdit(entity)} 
                            templateType={type} 
                        />
                    );
                } catch (e) {
                    console.error('[TemplateConsole] Node instantiation failure:', e);
                    return null;
                }
            })}
        </div>
    );
};

// ── Main Console Orchestrator ──────────────────────────────────────────────────

export function TemplateManagementConsole() {
    const { t } = useLocalization();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<TemplateData | null>(null);
    const [templateType, setTemplateType] = useState<TemplateType>('docx');

    const handleCreate = useCallback((type: TemplateType) => {
        setEditingTemplate(null);
        setTemplateType(type);
        setIsDialogOpen(true);
    }, []);

    const handleEdit = useCallback((template: TemplateData) => {
        if (!template) return;
        setEditingTemplate(template);
        
        if (template instanceof DocxTemplate) setTemplateType('docx');
        else if (template instanceof PptxTemplate) setTemplateType('pptx');
        else if (template instanceof ReportTemplate) setTemplateType('report');
        
        setIsDialogOpen(true);
    }, []);

    return (
        <Card className="border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[40px] relative">
            {/* 28px Dot-grid Background atmospheric decoration */}
            <div 
                className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] bg-[radial-gradient(circle_at_center,_var(--primary)_1px,_transparent_1px)] bg-[size:28px_28px] pointer-events-none" 
                style={{ backgroundSize: '28px 28px' }}
            />

            <header className="px-10 py-8 border-b border-primary/10 bg-primary/[0.02] flex items-center justify-between relative z-10">
                <div className="flex items-center gap-5">
                    <div className="h-12 w-12 rounded-[22px] bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner group/logo">
                        <Database className="h-6 w-6 text-primary group-hover/logo:scale-110 transition-transform duration-500" />
                    </div>
                    <div>
                        <h3 className="text-[18px] font-black uppercase tracking-tight text-foreground/90 leading-none">
                            Structural Style Hub
                        </h3>
                        <div className="flex items-center gap-2 mt-2.5">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/70">
                                Repository Sync Active
                            </p>
                        </div>
                    </div>
                </div>
                <Button 
                    size="sm"
                    className="h-11 px-8 gap-3 font-black shadow-2xl shadow-primary/20 rounded-2xl transition-all hover:scale-[1.02] active:scale-95 ring-1 ring-inset ring-white/20 uppercase tracking-[0.2em] text-[10px]"
                    onClick={() => handleCreate(templateType)}
                >
                    <Plus className="h-4 w-4" />
                    Initialize Template
                </Button>
            </header>

            <TemplateFormDialog
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                template={editingTemplate}
                templateType={templateType}
            />

            <CardContent className="p-10 relative z-10 min-h-[500px]">
                <Tabs value={templateType} onValueChange={(v) => setTemplateType(v as TemplateType)} className="w-full">
                    <div className="flex justify-center mb-12">
                        <TabsList className="h-12 rounded-2xl bg-muted/20 p-1.5 gap-1.5 min-w-[480px] border border-border/40 backdrop-blur-md">
                            <TabsTrigger value="docx" className="flex-1 gap-2.5 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all rounded-xl">
                                <FileText className="h-3.5 w-3.5" />
                                {t('manageTemplates.docxTemplates') || 'DOCX_VECTOR'}
                            </TabsTrigger>
                            <TabsTrigger value="pptx" className="flex-1 gap-2.5 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all rounded-xl">
                                <Presentation className="h-3.5 w-3.5" />
                                {t('manageTemplates.pptxTemplates') || 'PPTX_VECTOR'}
                            </TabsTrigger>
                            <TabsTrigger value="report" className="flex-1 gap-2.5 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all rounded-xl">
                                <FileCode className="h-3.5 w-3.5" />
                                {t('manageTemplates.reportTemplates') || 'PROJECT_HUB'}
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="rounded-[32px] border border-primary/5 bg-background/40 backdrop-blur-xl overflow-hidden shadow-inner p-10 relative group">
                        {/* Architectural depth line */}
                        <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-primary/20 via-primary/5 to-transparent z-20" />
                        
                        <TabsContent value="docx" className="m-0 focus-visible:ring-0">
                            <TemplateGridManager type="docx" onEdit={handleEdit} />
                        </TabsContent>
                        <TabsContent value="pptx" className="m-0 focus-visible:ring-0">
                            <TemplateGridManager type="pptx" onEdit={handleEdit} />
                        </TabsContent>
                        <TabsContent value="report" className="m-0 focus-visible:ring-0">
                            <TemplateGridManager type="report" onEdit={handleEdit} />
                        </TabsContent>
                    </div>
                </Tabs>
            </CardContent>

            <footer className="px-10 py-6 border-t border-primary/10 bg-muted/5 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                    <div className="h-1 w-1 rounded-full bg-primary/30 shadow-[0_0_8px_rgba(var(--primary),0.4)]" />
                    <p className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-[0.25em]">
                        Arkan Asset Console • Assets Node V2.4 Stable
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary/30" />
                    <span className="text-[8px] font-bold text-muted-foreground/20 tabular-nums uppercase tracking-widest">TRANSMISSION_SECURED</span>
                </div>
            </footer>
        </Card>
    );
}
