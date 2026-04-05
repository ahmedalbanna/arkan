'use client';

import React, { useCallback } from 'react';
import { SlidersHorizontal, Zap, Target, Layout, PenTool, AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/infrastructure/utils/cn';
import { useBuilderStore } from '@/hooks';
import { Section } from '@/modules/ai-content/domain/entities/Section';
import { DiagramType, DiagramTypeSchema, ToneSchema } from '@/modules/ai/domain/schemas';
import { GenerationControlState } from '@/modules/ai-content/domain/entities/ControlTypes';

/**
 * ControlPanel — Low-level neural parameter tuning HUD.
 * Manages Tone, Complexity, Formality, and Output Formats for AI generation.
 * 
 * DEFENSIVE MEASURES:
 * 1. Prop Validation: Handles missing section gracefully with error state.
 * 2. Atomic Batching: Updates multiple target sections in a single reduce pass.
 * 3. Safe Schema Mapping: Uses schema-defined options for selects.
 * 4. Error Containment: Wraps complex heuristic logic (Auto-Sync) in try-catch.
 */

interface ControlPanelProps {
    section: Section | null;
    selectedIds?: string[];
}

const diagramTypes = DiagramTypeSchema.options.map(value => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1).replace('-', ' ')
}));

const toneOptions = ToneSchema.options.map(tone => ({
    value: tone,
    label: tone.charAt(0).toUpperCase() + tone.slice(1)
}));

const ControlPanelComponent = ({ section, selectedIds = [] }: ControlPanelProps) => {
    const { updateProject } = useBuilderStore();

    const handleUpdate = useCallback((updates: Partial<GenerationControlState>) => {
        if (!section || !updateProject) return;
        
        const targets = selectedIds.length > 1 ? selectedIds : [section.id];
        
        try {
            updateProject((project) => {
                if (!project) return project;

                // Atomic Batch Update
                return targets.reduce((currentProject, id) => {
                    const targetSection = currentProject.getSection(id);
                    if (!targetSection) return currentProject;

                    return currentProject.updateSection(id, (s) =>
                        s.withProps({
                            controls: { ...s.controls, ...updates },
                        })
                    );
                }, project);
            });
        } catch (error) {
            console.error('[ControlPanel] Failed to update neural controls:', error);
        }
    }, [selectedIds, section?.id, updateProject]);

    const handleDetectFormats = useCallback(() => {
        if (!section?.content) return;
        
        try {
            const lines = section.content.split('\n');
            const detected: GenerationControlState['outputStyle'] = {
                heading: lines.some(l => l.trim().startsWith('#')),
                paragraph: lines.some(l => l.trim() && !l.startsWith('#') && !l.startsWith('-') && !l.startsWith('|')),
                list: lines.some(l => l.trim().startsWith('- ') || l.trim().startsWith('* ') || /^\d+\./.test(l.trim())),
                table: lines.some(l => l.includes('|')),
                code: lines.some(l => l.startsWith('```')),
                diagram: lines.some(l => l.includes('mermaid')),
                math: lines.some(l => l.includes('$')),
            };
            handleUpdate({ outputStyle: detected });
        } catch (error) {
            console.error('[ControlPanel] Auto-sync heuristic failed:', error);
        }
    }, [handleUpdate, section?.content]);

    if (!section) {
        return (
            <div className="p-5 rounded-[24px] border border-dashed border-primary/10 bg-primary/[0.02] flex items-center gap-3 text-muted-foreground/40 italic">
                <AlertCircle className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Controls Offline</span>
            </div>
        );
    }

    return (
        <div className="space-y-8 pt-2 relative">
            {/* Dot-grid atmosphere — Standardized Workspace Alignment (28px) */}
            <div
                className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] bg-[radial-gradient(circle_at_center,_var(--primary)_1px,_transparent_1px)] bg-[size:28px_28px] pointer-events-none"
                style={{ backgroundSize: '28px 28px' }}
            />

            {/* HUD Header */}
            <div className="space-y-1.5 px-1 relative z-10">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70 flex items-center gap-2.5">
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    Cognitive Vectors
                </h4>
                <p className="text-[9px] text-muted-foreground italic font-medium uppercase tracking-[0.2em] opacity-60">
                    Fine-tune the neural weight and linguistic elevation.
                </p>
            </div>

            <div className="space-y-8 relative px-1 z-10">
                {/* Depth accent line */}
                <div className="absolute left-[-1.25rem] top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/5 to-transparent" />

                {/* Linguistic Weight Zone */}
                <div className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center group/label">
                            <div className="flex items-center gap-2">
                                <PenTool className="h-3.5 w-3.5 text-primary/40 group-hover/label:text-primary transition-colors" />
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Neural Formality</Label>
                            </div>
                            <Badge variant="outline" className="h-5 text-[9px] font-black border-primary/20 bg-primary/5 text-primary tabular-nums shadow-inner ring-1 ring-inset ring-primary/10 px-2 rounded-full">
                                {section.controls.formality}%
                            </Badge>
                        </div>
                        <Slider 
                            value={[section.controls.formality]} 
                            onValueChange={(v) => handleUpdate({ formality: v[0] })} 
                            min={0} max={100} step={5} 
                            className="py-2"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center group/label">
                            <div className="flex items-center gap-2">
                                <Target className="h-3.5 w-3.5 text-primary/40 group-hover/label:text-primary transition-colors" />
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Syntactic Density</Label>
                            </div>
                            <Badge variant="outline" className="h-5 text-[9px] font-black border-primary/20 bg-primary/5 text-primary tabular-nums shadow-inner ring-1 ring-inset ring-primary/10 px-2 rounded-full">
                                {section.controls.complexity}%
                            </Badge>
                        </div>
                        <Slider 
                            value={[section.controls.complexity]} 
                            onValueChange={(v) => handleUpdate({ complexity: v[0] })} 
                            min={0} max={100} step={5} 
                            className="py-2"
                        />
                    </div>
                </div>

                <div className="h-px bg-primary/5" />

                {/* Persona & Flow Zone */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Intelligence Tone</Label>
                        <Select 
                            value={section.controls.tone} 
                            onValueChange={(v) => handleUpdate({ tone: v as any })}
                        >
                            <SelectTrigger className="h-10 text-[11px] font-bold bg-muted/5 border-primary/10 rounded-xl focus:ring-primary/20 transition-all">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-primary/10 shadow-2xl backdrop-blur-3xl">
                                {toneOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value} className="text-[11px] font-medium py-2.5 focus:bg-primary/5 focus:text-primary">
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Diagram Logic</Label>
                        <Select 
                            value={section.controls.diagramType} 
                            onValueChange={(v) => handleUpdate({ diagramType: v as DiagramType })}
                        >
                            <SelectTrigger className="h-10 text-[11px] font-bold bg-muted/5 border-primary/10 rounded-xl focus:ring-primary/20 transition-all">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-primary/10 shadow-2xl backdrop-blur-3xl">
                                {diagramTypes.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value} className="text-[11px] font-medium py-2.5 focus:bg-primary/5 focus:text-primary">
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Output Style HUD */}
                <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <Layout className="h-3.5 w-3.5 text-primary/60" />
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Structural Matrix</Label>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={handleDetectFormats}
                            disabled={!section.content}
                            className="h-7 px-3 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border border-primary/10 hover:bg-primary/5 hover:text-primary transition-all gap-1.5"
                        >
                            <Zap className="h-3 w-3" />
                            Auto-Sync
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {Object.entries(section.controls.outputStyle).map(([key, enabled]) => (
                            <button
                                key={key}
                                onClick={() => handleUpdate({ 
                                    outputStyle: { ...section.controls.outputStyle, [key]: !enabled } 
                                })}
                                className={cn(
                                    "flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all duration-500 ease-[0.22,1,0.36,1] group/btn",
                                    enabled 
                                        ? "bg-primary/10 border-primary/20 text-primary shadow-sm ring-1 ring-primary/10 scale-[1.02]" 
                                        : "bg-muted/5 border-transparent text-muted-foreground hover:border-primary/10 hover:bg-muted/10 active:scale-95"
                                )}
                            >
                                <span className="text-[10px] font-bold uppercase tracking-[0.15em]">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                                <div className={cn(
                                    "h-1.5 w-1.5 rounded-full transition-all duration-500",
                                    enabled ? "bg-primary shadow-[0_0_8px_rgba(var(--primary),0.6)]" : "bg-muted-foreground/20 group-hover/btn:bg-primary/40"
                                )} />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ControlPanel = React.memo(ControlPanelComponent);

ControlPanel.displayName = 'ControlPanel';
