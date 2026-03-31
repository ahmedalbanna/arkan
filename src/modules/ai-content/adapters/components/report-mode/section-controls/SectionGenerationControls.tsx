'use client';

import { DiagramType, DiagramTypeSchema, ToneSchema } from '@/modules/ai/domain/schemas';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore } from '@/hooks';
import { type GenerationControlState, type Tone } from '@/modules/ai-content/domain/entities/ControlTypes';
import { Section } from '@/modules/ai-content/domain/entities/Section';
import { Eye, Hash, Info, Settings2, Sparkles, LayoutList, Table2, Network } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { FullPromptPreviewDialog } from './FullPromptPreviewDialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/infrastructure/utils/cn';
import { AnimatePresence, motion } from 'framer-motion';

const diagramTypes = DiagramTypeSchema.options.map(value => {
    let label = '';
    if (value === 'er') {
        label = 'ER Diagram';
    } else if (value === 'dfd') {
        label = 'Data Flow Diagram (DFD)';
    } else {
        label = value.charAt(0).toUpperCase() + value.slice(1).replace(/([A-Z])/g, ' $1').trim();
    }
    return { value, label };
});

const toneOptions = ToneSchema.options.map(tone => ({
    value: tone,
    label: tone.charAt(0).toUpperCase() + tone.slice(1),
}));

interface SectionGenerationControlsProps {
    section: Section;
    selectedSectionIds?: string[];
}

export function SectionGenerationControls({
    section,
    selectedSectionIds,
}: SectionGenerationControlsProps) {
    const { t } = useLocalization();
    const { updateProject } = useBuilderStore();
    const controls = section.controls;
    const [showFullPrompt, setShowFullPrompt] = useState(false);

    if (!controls) {
        return null;
    }

    const handleControlChange = <K extends keyof GenerationControlState>(field: K, value: GenerationControlState[K]) => {
        if (selectedSectionIds && selectedSectionIds.length > 0) {
            updateProject(p => {
                selectedSectionIds.forEach(id => {
                    p.updateSection(id, s => s.withProps({ controls: { ...s.controls, [field]: value } }));
                });
            });
        } else {
            updateProject(p => p.updateSection(section.id, s => s.withProps({ controls: { ...s.controls, [field]: value } })));
        }
    };

    const onOutputStyleChange = (style: keyof GenerationControlState['outputStyle'], checked: boolean) => {
        if (selectedSectionIds && selectedSectionIds.length > 0) {
            updateProject(p => {
                selectedSectionIds.forEach(id => {
                    p.updateSection(id, currentSection => currentSection.withProps({ controls: { ...currentSection.controls, outputStyle: { ...currentSection.controls.outputStyle, [style]: checked } } }));
                });
            });
        } else {
            updateProject(project => project.updateSection(section.id, currentSection => currentSection.withProps({ controls: { ...currentSection.controls, outputStyle: { ...currentSection.controls.outputStyle, [style]: checked } } })));
        }
    };

    const handleToneChange = (value: string) => {
        if (value === 'custom') {
            handleControlChange('tone', '' as Tone);
        } else {
            handleControlChange('tone', value as Tone);
        }
    };

    const isCustomTone = !toneOptions.some(opt => opt.value === controls.tone);

    const instructionPreview = section.buildActionPrompt();

    return (
        <div className="space-y-6 pt-2">
            <div className="space-y-1">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70 flex items-center gap-2">
                    <Settings2 className="h-3 w-3" />
                    Generation Parameters
                </h4>
                <p className="text-[9px] text-muted-foreground italic font-black opacity-60 uppercase tracking-widest">
                    Optimize intelligence parameters for high-fidelity output.
                </p>
            </div>

            <div className="space-y-6 relative">
                <div className="absolute left-[-1.25rem] top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/5 to-transparent" />

                <div className="space-y-3.5">
                    <div className="flex justify-between items-center group/label">
                        <Label htmlFor={`formality-${section.id}`} className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 group-hover/label:text-primary transition-colors">
                            Cognitive Complexity
                        </Label>
                        <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
                            <Badge variant="outline" className="h-5 text-[9px] font-black border-primary/20 bg-primary/5 text-primary tabular-nums ring-1 ring-primary/10 shadow-inner">
                                {controls.formality}%
                            </Badge>
                        </div>
                    </div>
                    <Slider
                        id={`formality-${section.id}`}
                        value={[controls.formality]}
                        onValueChange={(val) => handleControlChange('formality', val[0])}
                        max={100}
                        step={1}
                        className="py-1.5"
                    />
                    <div className="flex justify-between text-[8px] font-black text-muted-foreground/50 uppercase tracking-[0.2em]">
                        <span>Informal</span>
                        <span>Analytical</span>
                        <span>Academic</span>
                    </div>
                </div>

                <div className="grid gap-4 grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor={`tone-${section.id}`} className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                            Intelligence Tone
                        </Label>
                        {isCustomTone ? (
                            <div className="relative group">
                                <Input
                                    id={`tone-${section.id}`}
                                    value={controls.tone || ''}
                                    onChange={(e) => handleControlChange('tone', e.target.value as Tone)}
                                    onBlur={(e) => {
                                        if (e.target.value.trim() === '') handleControlChange('tone', 'professional');
                                    }}
                                    placeholder="Custom..."
                                    className="h-9 text-[11px] bg-muted/5 border-primary/10 focus-visible:ring-primary/20 focus-visible:border-primary/30 transition-all pl-7"
                                />
                                <Sparkles className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-primary/40 group-focus-within:text-primary transition-colors" />
                            </div>
                        ) : (
                            <Select value={controls.tone} onValueChange={handleToneChange}>
                                <SelectTrigger id={`tone-${section.id}`} className="h-9 text-[11px] bg-muted/5 border-primary/10 hover:border-primary/20 transition-all font-medium">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="border-primary/10 backdrop-blur-xl">
                                    {toneOptions.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value} className="text-xs font-medium">{opt.label}</SelectItem>
                                    ))}
                                    <SelectItem value="custom" className="text-xs italic font-bold text-primary">Override...</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor={`wordCount-${section.id}`} className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                            Volume Target
                        </Label>
                        <div className="relative">
                            <Input
                                id={`wordCount-${section.id}`}
                                type="text"
                                placeholder="Auto"
                                defaultValue={controls.wordCount || ''}
                                onBlur={(e) => handleControlChange('wordCount', e.target.value)}
                                className="h-9 text-[11px] bg-muted/5 border-primary/10 transition-all pl-7 font-mono"
                            />
                            <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/40" />
                        </div>
                    </div>
                </div>
            </div>

            <Separator className="bg-gradient-to-r from-primary/20 via-primary/5 to-transparent h-px" />

            <div className="space-y-4">
                <div className="flex items-center gap-2 group/header">
                    <div className="h-4 w-1 bg-primary rounded-full group-hover:h-6 transition-all duration-300" />
                    <div className="space-y-0.5">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Structure Matrix</Label>
                        <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-60">Architectural Elements</p>
                    </div>
                </div>

                <div className="grid gap-2 grid-cols-2">
                    {controls.outputStyle && (Object.keys(controls.outputStyle) as Array<keyof GenerationControlState['outputStyle']>).map(key => (
                        <label
                            key={String(key)}
                            className={cn(
                                "flex items-center gap-3 rounded-xl border px-3 py-2 transition-all duration-300 cursor-pointer group shadow-sm",
                                controls.outputStyle[key]
                                    ? "bg-primary/[0.04] border-primary/30 ring-1 ring-primary/10"
                                    : "bg-muted/5 border-border/60 hover:border-primary/20 hover:bg-muted/10"
                            )}
                        >
                            <Checkbox
                                id={`output-${String(key)}-${section.id}`}
                                checked={controls.outputStyle[key]}
                                onCheckedChange={(checked) => onOutputStyleChange(key, !!checked)}
                                className="h-4 w-4 rounded-md border-primary/20 data-[state=checked]:bg-primary"
                            />
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-[0.2em] transition-colors",
                                controls.outputStyle[key] ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                            )}>
                                {String(key).replace(/([A-Z])/g, ' $1')}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <AnimatePresence>
                    {controls.outputStyle?.heading && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2.5 rounded-2xl border bg-muted/5 p-4 shadow-sm group/topics">
                            <Label htmlFor={`includedHeadings-${section.id}`} className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                                <LayoutList className="h-3 w-3" /> Topic Blueprint
                            </Label>
                            <Textarea
                                id={`includedHeadings-${section.id}`}
                                defaultValue={(controls.includedHeadings || []).join('\n')}
                                onBlur={(e) => handleControlChange('includedHeadings', e.target.value.split('\n').filter(s => s.trim()))}
                                placeholder="One topic per line..."
                                rows={3}
                                className="text-[11px] bg-background/50 border-primary/10 focus-visible:ring-primary/20 font-medium leading-relaxed resize-none p-3"
                            />
                        </motion.div>
                    )}

                    {controls.outputStyle?.table && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2.5 rounded-2xl border bg-muted/5 p-4 shadow-sm group/table">
                            <Label htmlFor={`tableCaption-${section.id}`} className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                                <Table2 className="h-3 w-3" /> Data Legend
                            </Label>
                            <Input
                                id={`tableCaption-${section.id}`}
                                defaultValue={controls.tableCaption || ''}
                                onBlur={(e) => handleControlChange('tableCaption', e.target.value)}
                                placeholder="Table caption..."
                                className="h-9 text-[11px] bg-background/50 border-primary/10 font-medium"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Additional conditional inputs following same pattern */}
                <div className="grid gap-4 grid-cols-1">
                    {controls.outputStyle?.diagram && (
                        <div className="space-y-2.5 rounded-2xl border bg-muted/5 p-4 shadow-sm">
                            <Label htmlFor={`diagramType-${section.id}`} className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                                <Network className="h-3 w-3" /> Schema Type
                            </Label>
                            <Select value={controls.diagramType} onValueChange={(val) => handleControlChange('diagramType', val as DiagramType)}>
                                <SelectTrigger id={`diagramType-${section.id}`} className="h-9 text-[11px] bg-background/50 border-primary/10 font-medium font-mono"><SelectValue /></SelectTrigger>
                                <SelectContent className="border-primary/10 backdrop-blur-xl">
                                    {diagramTypes.map(type => (
                                        <SelectItem key={type.value} value={type.value} className="text-xs font-mono">{type.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
            </div>

            <div className="relative group/manifest">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-primary/5 to-primary/20 rounded-2xl blur opacity-20 group-hover/manifest:opacity-40 transition duration-1000" />
                <Card className="relative bg-background/60 backdrop-blur-xl border-dashed border-primary/20 overflow-hidden rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-primary/10">
                                <Sparkles className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <div className="space-y-0.5">
                                <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                                    Instruction Manifest
                                </CardDescription>
                                <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Technical Preview</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowFullPrompt(true)}
                            className="h-8 rounded-xl bg-primary/5 text-primary border border-primary/10 hover:bg-primary/10 text-[10px] font-bold gap-2 px-3"
                        >
                            <Eye className="w-3.5 h-3.5" />
                            Expand
                        </Button>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="relative">
                            <p className="text-[11px] font-serif italic text-muted-foreground/80 leading-relaxed line-clamp-2 pr-6">
                                {instructionPreview}
                            </p>
                            <div className="absolute bottom-0 right-0 h-4 w-12 bg-gradient-to-l from-background/60 to-transparent" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <FullPromptPreviewDialog
                isOpen={showFullPrompt}
                onOpenChange={setShowFullPrompt}
                section={section}
            />
        </div>
    );
};
