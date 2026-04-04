'use client';

import React from 'react';
import { Plus, X, Cpu, UserCog, ShieldAlert, Binary } from 'lucide-react';
import { useBuilderStore } from '@/hooks';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToneSchema, type Language, type Tone } from '@/modules/ai-content/domain/entities/ControlTypes';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TagManager } from './TagManager';

/**
 * GlobalIntelligenceHUD — Strategic configuration for the AI engine.
 * Manages cognitive weight, linguistic persona, and behavioral constraints.
 */

export function GlobalIntelligenceHUD() {
    const { project, updateProject } = useBuilderStore();
    if (!project) return null;

    const handleComplexityChange = (value: number) => updateProject(p => p.withProps({ complexity: value }));
    const handleFormalityChange = (value: number) => updateProject(p => p.withProps({ formality: value }));
    const handleLanguageChange = (value: Language) => updateProject(p => p.withProps({ language: value }));
    const handleToneChange = (value: string) => updateProject(p => p.withProps({ tone: value as Tone }));

    const handleBehaviorUpdate = (index: number, updates: { name?: string; type?: 'persona' | 'behavior' }) => {
        const behaviors = project.behaviors ? [...project.behaviors] : [];
        behaviors[index] = { ...behaviors[index], ...updates };
        updateProject(p => p.withProps({ behaviors }));
    };

    const addBehavior = () => {
        const behaviors = project.behaviors ? [...project.behaviors] : [];
        behaviors.push({ name: '', type: 'behavior' });
        updateProject(p => p.withProps({ behaviors }));
    };

    const removeBehavior = (index: number) => {
        const behaviors = project.behaviors?.filter((_, i) => i !== index);
        updateProject(p => p.withProps({ behaviors }));
    };

    const handleRulesChange = (rules: string[]) => updateProject(p => p.withProps({ rules }));
    const handleConstraintsChange = (constraints: string[]) => updateProject(p => p.withProps({ constraints }));

    return (
        <div className="h-full flex flex-col pt-2 animate-in fade-in slide-in-from-right-2 duration-300">
            <div className="space-y-1 mb-6 px-1">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70 flex items-center gap-2.5">
                    <Cpu className="h-3.5 w-3.5" />
                    Intelligence Matrix
                </h4>
                <p className="text-[9px] text-muted-foreground italic font-medium opacity-60 uppercase tracking-wider">
                    Fine-tune the global neural logic and behavioral vectors.
                </p>
            </div>

            <ScrollArea className="flex-1 pr-4 -mr-4">
                <div className="space-y-8 pb-24 relative px-1">
                    {/* Depth architectural line */}
                    <div className="absolute left-[-1.25rem] top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/5 to-transparent" />
                    
                    {/* Cognitive Weight Zone */}
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center group/label">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 group-hover/label:text-primary transition-colors">Cognitive Formality</Label>
                                <Badge variant="outline" className="h-5 text-[9px] font-black border-primary/20 bg-primary/5 text-primary tabular-nums ring-1 ring-primary/10 shadow-inner rounded-full px-2.5">
                                    {project.formality ?? 70}%
                                </Badge>
                            </div>
                            <Slider value={[project.formality ?? 70]} onValueChange={(val) => handleFormalityChange(val[0])} min={0} max={100} step={5} className="py-1.5" />
                            <p className="text-[9px] text-muted-foreground italic font-medium opacity-40">Regulates the academic weight and linguistic elevation.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center group/label">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 group-hover/label:text-primary transition-colors">Syntactic Density</Label>
                                <Badge variant="outline" className="h-5 text-[9px] font-black border-primary/20 bg-primary/5 text-primary tabular-nums ring-1 ring-primary/10 shadow-inner rounded-full px-2.5">
                                    {project.complexity ?? 50}%
                                </Badge>
                            </div>
                            <Slider value={[project.complexity ?? 50]} onValueChange={(val) => handleComplexityChange(val[0])} min={0} max={100} step={5} className="py-1.5" />
                            <p className="text-[9px] text-muted-foreground italic font-medium opacity-40">Scales the depth of vocabulary and structural complexity.</p>
                        </div>
                    </div>

                    <Separator className="bg-gradient-to-r from-primary/20 via-primary/5 to-transparent h-px" />

                    {/* Linguistic Matrix */}
                    <div className="grid gap-5 grid-cols-2">
                        <div className="space-y-3">
                            <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Language Vector</Label>
                            <Select value={project.language ?? 'default'} onValueChange={handleLanguageChange}>
                                <SelectTrigger className="h-10 text-[11px] font-bold bg-muted/5 border-primary/10 focus:ring-primary/20 rounded-xl transition-all">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-primary/10 backdrop-blur-3xl shadow-2xl">
                                    <SelectItem value="default" className="text-[11px] font-medium py-2.5">System Default</SelectItem>
                                    <SelectItem value="en" className="text-[11px] font-medium py-2.5">English (Academic)</SelectItem>
                                    <SelectItem value="ar" className="text-[11px] font-medium py-2.5">Arabic (Standard)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-3">
                            <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Intelligence Tone</Label>
                            <Select value={project.tone ?? 'professional'} onValueChange={handleToneChange}>
                                <SelectTrigger className="h-10 text-[11px] font-bold bg-muted/5 border-primary/10 focus:ring-primary/20 rounded-xl transition-all">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-primary/10 backdrop-blur-3xl shadow-2xl">
                                    {ToneSchema.options.map(tone => (
                                        <SelectItem key={tone} value={tone} className="text-[11px] font-medium py-2.5">
                                            {tone.charAt(0).toUpperCase() + tone.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Separator className="bg-gradient-to-r from-primary/20 via-primary/5 to-transparent h-px" />

                    {/* Behavioral Configuration */}
                    <div className="space-y-5">
                        <div className="flex items-center gap-2.5 group/header">
                            <UserCog className="h-3.5 w-3.5 text-primary/60" />
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Behavioral Personas</Label>
                        </div>
                        <div className="space-y-3">
                            {project.behaviors?.map((item, index) => (
                                <div key={index} className="space-y-3 p-4 rounded-2xl border border-primary/10 bg-muted/5 relative group transition-all hover:border-primary/20 hover:bg-muted/8 shadow-sm">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-7 w-7 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive rounded-lg" 
                                        onClick={() => removeBehavior(index)}
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </Button>
                                    <div className="space-y-1.5">
                                        <Label className="text-[8px] font-black uppercase tracking-[0.25em] text-primary/40 px-1">Behavior Logic</Label>
                                        <Input 
                                            value={item.name} 
                                            onChange={(e) => handleBehaviorUpdate(index, { name: e.target.value })} 
                                            placeholder="e.g., Act as an expert researcher..." 
                                            className="text-[11px] h-9 bg-background/60 border-primary/5 rounded-xl focus-visible:ring-primary/10 shadow-inner font-medium" 
                                        />
                                    </div>
                                    <ToggleGroup 
                                        type="single" 
                                        value={item.type} 
                                        onValueChange={(value) => { if (value) handleBehaviorUpdate(index, { type: value as 'persona' | 'behavior' }) }} 
                                        className="justify-start gap-1"
                                    >
                                        <ToggleGroupItem value="persona" className="text-[9px] px-3 h-7 font-black uppercase tracking-wider rounded-lg data-[state=on]:bg-primary/10 data-[state=on]:text-primary border-none transition-all">Persona</ToggleGroupItem>
                                        <ToggleGroupItem value="behavior" className="text-[9px] px-3 h-7 font-black uppercase tracking-wider rounded-lg data-[state=on]:bg-primary/10 data-[state=on]:text-primary border-none transition-all">Behavior</ToggleGroupItem>
                                    </ToggleGroup>
                                </div>
                            ))}
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full text-[10px] font-black uppercase tracking-[0.2em] gap-2.5 h-10 rounded-2xl border-dashed border-primary/20 bg-primary/[0.02] hover:bg-primary/[0.05] hover:border-primary/40 transition-all active:scale-[0.98]" 
                                onClick={addBehavior}
                            >
                                <Plus className="h-3.5 w-3.5" /> 
                                Initialize Node
                            </Button>
                        </div>
                    </div>

                    <Separator className="bg-gradient-to-r from-primary/20 via-primary/5 to-transparent h-px" />

                    {/* Neural Regulation Zone */}
                    <div className="space-y-8">
                        <TagManager 
                            label="Neural Architecture Rules" 
                            description="Mandatory protocols the AI engine must enforce."
                            placeholder="e.g., Always use metric units, maintain neutral voice..." 
                            value={project.rules || []} 
                            onChange={handleRulesChange} 
                        />
                        <TagManager 
                            label="Constraint Matrix" 
                            description="Negative constraints and forbidden linguistic patterns."
                            placeholder="e.g., Avoid passive voice, skip unnecessary jargon..." 
                            value={project.constraints || []} 
                            onChange={handleConstraintsChange} 
                        />
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
