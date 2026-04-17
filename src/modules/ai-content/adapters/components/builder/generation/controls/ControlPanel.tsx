'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useBuilderStore } from '@/hooks';
import { cn } from '@/infrastructure/utils/cn';
import { DiagramTypeSchema, GenerationControlState, ToneSchema, type DiagramType } from '@/modules/ai-content/domain/entities/ControlTypes';
import { Section } from '@/modules/ai-content/domain/entities/Section';
import {
    AlertCircle,
    BarChart3,
    ChevronDown,
    ChevronUp,
    Eye,
    Layout,
    PenTool,
    RotateCcw,
    Settings2,
    SlidersHorizontal,
    Sparkles,
    Target,
    Thermometer,
    Type,
    Zap
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface ControlPanelProps {
    section: Section | null;
    selectedIds?: string[];
}

interface ControlPreset {
    name: string;
    icon: React.ReactNode;
    description: string;
    values: Partial<GenerationControlState>;
}

const diagramTypes = DiagramTypeSchema.options.map(value => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ')
}));

const toneOptions = ToneSchema.options.map(tone => ({
    value: tone,
    label: tone.charAt(0).toUpperCase() + tone.slice(1),
    description: getToneDescription(tone)
}));

function getToneDescription(tone: string): string {
    const descriptions: Record<string, string> = {
        professional: 'Formal, business-appropriate language',
        casual: 'Relaxed, conversational tone',
        enthusiastic: 'Energetic, positive language',
        informative: 'Clear, educational style',
        persuasive: 'Compelling, argumentative tone',
        analytical: 'Data-driven, logical approach'
    };
    return descriptions[tone] || 'Balanced, neutral tone';
}

const presets: ControlPreset[] = [
    {
        name: 'Professional',
        icon: <Zap className="h-3 w-3" />,
        description: 'Formal business documentation',
        values: { formality: 85, complexity: 70, tone: 'professional' as any }
    },
    {
        name: 'Academic',
        icon: <Zap className="h-3 w-3" />,
        description: 'Scholarly research writing',
        values: { formality: 90, complexity: 85, tone: 'analytical' as any }
    },
    {
        name: 'Creative',
        icon: <Sparkles className="h-3 w-3" />,
        description: 'Engaging narrative style',
        values: { formality: 40, complexity: 60, tone: 'enthusiastic' as any }
    },
    {
        name: 'Simple',
        icon: <Type className="h-3 w-3" />,
        description: 'Clear and accessible',
        values: { formality: 30, complexity: 30, tone: 'informative' as any }
    }
];

const ControlPanelComponent = ({ section, selectedIds = [] }: ControlPanelProps) => {
    const { updateProject } = useBuilderStore();
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [activePreset, setActivePreset] = useState<string | null>(null);
    const resetTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

    // Get target count for batch updates
    const targetCount = selectedIds.length > 1 ? selectedIds.length : 1;
    const isBatchMode = targetCount > 1;

    const handleUpdate = useCallback((updates: Partial<GenerationControlState>) => {
        if (!section || !updateProject) return;

        const targets = selectedIds.length > 1 ? selectedIds : [section.id];

        try {
            updateProject((project) => {
                if (!project) return project;

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

            // Clear active preset when manually adjusting
            if (activePreset) setActivePreset(null);
        } catch (error) {
            console.error('[ControlPanel] Failed to update neural controls:', error);
        }
    }, [selectedIds, section?.id, updateProject, activePreset]);

    const handleApplyPreset = useCallback((preset: ControlPreset) => {
        handleUpdate(preset.values);
        setActivePreset(preset.name);

        // Visual feedback
        setIsResetting(true);
        if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
        resetTimeoutRef.current = setTimeout(() => setIsResetting(false), 500);
    }, [handleUpdate]);

    const handleReset = useCallback(() => {
        const defaultValues: Partial<GenerationControlState> = {
            formality: 50,
            complexity: 50,
            tone: 'professional',
            diagramType: 'activity',
            outputStyle: {
                heading: true,
                paragraph: true,
                list: true,
                table: false,
                code: false,
                diagram: false,
                math: false,
            }
        };
        handleUpdate(defaultValues);
        setActivePreset(null);

        setIsResetting(true);
        if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
        resetTimeoutRef.current = setTimeout(() => setIsResetting(false), 500);
    }, [handleUpdate]);

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

    // Desktop keyboard shortcuts
    useEffect(() => {
        if (!section) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl/Cmd + Shift + R to reset
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
                e.preventDefault();
                handleReset();
            }
            // Ctrl/Cmd + Shift + D to detect formats
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                handleDetectFormats();
            }
            // Number keys 1-4 for presets
            if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '4') {
                e.preventDefault();
                const presetIndex = parseInt(e.key, 10) - 1;
                if (presets[presetIndex]) {
                    handleApplyPreset(presets[presetIndex]);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [section, handleReset, handleDetectFormats, handleApplyPreset]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
        };
    }, []);

    if (!section) {
        return (
            <div className="p-6 rounded-2xl border border-dashed border-primary/10 bg-primary/[0.02] flex flex-col items-center gap-3 text-center">
                <AlertCircle className="h-8 w-8 text-muted-foreground/30" />
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Controls Offline</p>
                    <p className="text-[8px] text-muted-foreground/30 mt-1">Select a section to configure parameters</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pt-2 relative">
            {/* Dot-grid atmosphere */}
            <div
                className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] bg-[radial-gradient(circle_at_center,_var(--primary)_1px,_transparent_1px)] pointer-events-none"
                style={{ backgroundSize: '28px 28px' }}
            />

            {/* Header with batch indicator */}
            <div className="space-y-1.5 px-1 relative z-10">
                <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70 flex items-center gap-2.5">
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                        Cognitive Vectors
                    </h4>
                    {isBatchMode && (
                        <Badge variant="outline" className="h-5 text-[8px] font-mono border-primary/20 bg-primary/5">
                            Batch: {targetCount} sections
                        </Badge>
                    )}
                </div>
                <p className="text-[9px] text-muted-foreground italic font-medium uppercase tracking-[0.2em] opacity-60">
                    Fine-tune the neural weight and linguistic elevation.
                </p>
            </div>

            <div className="space-y-6 relative px-1 z-10">
                {/* Depth accent line */}
                <div className="absolute left-[-1.25rem] top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/5 to-transparent" />

                {/* Presets - Desktop only */}
                {(
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                                <Zap className="h-3 w-3" />
                                Quick Presets
                            </Label>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleReset}
                                            className={cn(
                                                "h-6 px-2 rounded-md text-[8px] font-black uppercase tracking-wider transition-all",
                                                isResetting && "animate-pulse"
                                            )}
                                        >
                                            <RotateCcw className="h-2.5 w-2.5 mr-1" />
                                            Reset All
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-[8px]">
                                        Reset to defaults • ⌘⇧R
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {presets.map((preset, idx) => (
                                <TooltipProvider key={preset.name}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleApplyPreset(preset)}
                                                className={cn(
                                                    "h-8 text-[9px] font-black uppercase tracking-[0.15em] rounded-lg transition-all",
                                                    activePreset === preset.name && "bg-primary/10 border-primary/20 text-primary"
                                                )}
                                            >
                                                {preset.icon}
                                                <span className="ml-1.5">{preset.name}</span>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom" className="text-[8px] space-y-0.5">
                                            <p>{preset.description}</p>
                                            <p className="text-[7px] text-muted-foreground">⌘{idx + 1}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ))}
                        </div>
                    </div>
                )}

                {/* Linguistic Weight Zone */}
                <div className="space-y-5">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center group/label">
                            <div className="flex items-center gap-2">
                                <PenTool className="h-3.5 w-3.5 text-primary/40 group-hover/label:text-primary transition-colors" />
                                <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Neural Formality</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="h-5 text-[9px] font-black border-primary/20 bg-primary/5 text-primary tabular-nums px-2 rounded-full">
                                    {section.controls.formality}%
                                </Badge>
                                {(
                                    <span className="text-[7px] text-muted-foreground/30 font-mono">
                                        {section.controls.formality < 30 ? 'Casual' : section.controls.formality < 70 ? 'Balanced' : 'Formal'}
                                    </span>
                                )}
                            </div>
                        </div>
                        <Slider
                            value={[section.controls.formality]}
                            onValueChange={(v) => handleUpdate({ formality: v[0] })}
                            min={0} max={100} step={5}
                            className="py-1"
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center group/label">
                            <div className="flex items-center gap-2">
                                <Target className="h-3.5 w-3.5 text-primary/40 group-hover/label:text-primary transition-colors" />
                                <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Syntactic Density</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="h-5 text-[9px] font-black border-primary/20 bg-primary/5 text-primary tabular-nums px-2 rounded-full">
                                    {section.controls.complexity}%
                                </Badge>
                                {(
                                    <span className="text-[7px] text-muted-foreground/30 font-mono">
                                        {section.controls.complexity < 30 ? 'Simple' : section.controls.complexity < 70 ? 'Moderate' : 'Complex'}
                                    </span>
                                )}
                            </div>
                        </div>
                        <Slider
                            value={[section.controls.complexity]}
                            onValueChange={(v) => handleUpdate({ complexity: v[0] })}
                            min={0} max={100} step={5}
                            className="py-1"
                        />
                    </div>
                </div>

                <div className="h-px bg-gradient-to-r from-primary/20 via-primary/5 to-transparent" />

                {/* Persona & Flow Zone */}
                <div className={cn(
                    "grid gap-4",
                    "grid-cols-2"
                )}>
                    <div className="space-y-2.5">
                        <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                            <Thermometer className="h-3 w-3" />
                            Intelligence Tone
                        </Label>
                        <Select
                            value={section.controls.tone}
                            onValueChange={(v) => handleUpdate({ tone: v as any })}
                        >
                            <SelectTrigger className="h-9 text-[10px] font-bold bg-muted/5 border-primary/10 rounded-xl focus:ring-primary/20 transition-all">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-primary/10 shadow-xl">
                                {toneOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value} className="text-[10px] font-medium py-2">
                                        <div className="flex flex-col">
                                            <span>{opt.label}</span>
                                            {(
                                                <span className="text-[7px] text-muted-foreground/40">{opt.description}</span>
                                            )}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2.5">
                        <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                            <BarChart3 className="h-3 w-3" />
                            Diagram Logic
                        </Label>
                        <Select
                            value={section.controls.diagramType}
                            onValueChange={(v) => handleUpdate({ diagramType: v as DiagramType })}
                        >
                            <SelectTrigger className="h-9 text-[10px] font-bold bg-muted/5 border-primary/10 rounded-xl focus:ring-primary/20 transition-all">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-primary/10 shadow-xl">
                                {diagramTypes.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value} className="text-[10px] font-medium py-2">
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Advanced Toggle - Desktop */}
                {(
                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center justify-between w-full pt-2 text-[8px] font-black uppercase tracking-wider text-muted-foreground/40 hover:text-primary transition-colors"
                    >
                        <span className="flex items-center gap-2">
                            <Settings2 className="h-3 w-3" />
                            Advanced Settings
                        </span>
                        {showAdvanced ? (
                            <ChevronUp className="h-3 w-3" />
                        ) : (
                            <ChevronDown className="h-3 w-3" />
                        )}
                    </button>
                )}

                {/* Output Style HUD */}
                <div className={cn(
                    "space-y-4 transition-all duration-300",
                    !showAdvanced && "opacity-70"
                )}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <Layout className="h-3.5 w-3.5 text-primary/60" />
                            <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Structural Matrix</Label>
                        </div>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleDetectFormats}
                                        disabled={!section.content}
                                        className="h-7 px-3 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] border border-primary/10 hover:bg-primary/5 hover:text-primary transition-all gap-1.5"
                                    >
                                        <Zap className="h-3 w-3" />
                                        Auto-Sync
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-[8px]">
                                    Detect from content • ⌘⇧D
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    <div className={cn(
                        "grid gap-2",
                        "grid-cols-4"
                    )}>
                        {Object.entries(section.controls.outputStyle).map(([key, enabled]) => (
                            <TooltipProvider key={key}>
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger asChild>
                                        <button
                                            onClick={() => handleUpdate({
                                                outputStyle: { ...section.controls.outputStyle, [key]: !enabled }
                                            })}
                                            className={cn(
                                                "flex items-center justify-between px-3 py-2 rounded-lg border transition-all duration-300 group/btn",
                                                enabled
                                                    ? "bg-primary/10 border-primary/20 text-primary shadow-sm ring-1 ring-primary/10"
                                                    : "bg-muted/5 border-transparent text-muted-foreground hover:border-primary/10 hover:bg-muted/10"
                                            )}
                                        >
                                            <span className="text-[9px] font-bold uppercase tracking-[0.15em]">
                                                {key.replace(/([A-Z])/g, ' $1').trim()}
                                            </span>
                                            <div className={cn(
                                                "h-1.5 w-1.5 rounded-full transition-all duration-300",
                                                enabled ? "bg-primary shadow-[0_0_8px_rgba(var(--primary),0.6)]" : "bg-muted-foreground/20 group-hover/btn:bg-primary/40"
                                            )} />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-[8px]">
                                        {enabled ? 'Disable' : 'Enable'} {key} output
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ))}
                    </div>
                </div>

                {/* Live Preview Indicator - Desktop */}
                {(
                    <div className="pt-2 text-center">
                        <p className="text-[7px] text-muted-foreground/30 font-mono flex items-center justify-center gap-1.5">
                            <Eye className="h-2.5 w-2.5" />
                            Changes apply in real-time
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Missing icon components
const Briefcase = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
);

const GraduationCap = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
);

export const ControlPanel = React.memo(ControlPanelComponent);

ControlPanel.displayName = 'ControlPanel';
