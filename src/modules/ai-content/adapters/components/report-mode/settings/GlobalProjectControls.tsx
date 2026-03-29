'use client';

import React, { useState } from 'react';
import { useBuilderStore } from '@/hooks';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToneSchema, type Language, type Tone } from '@/modules/ai-content/domain/entities/ControlTypes';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ScrollArea } from '@/components/ui/scroll-area';

function TagInput({ label, value, onChange, placeholder }: { label: string; value: readonly string[]; onChange: (value: string[]) => void; placeholder: string }) {
    const [inputValue, setInputValue] = useState('');
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();
            onChange([...value, inputValue.trim()]);
            setInputValue('');
        }
    };
    const handleRemove = (index: number) => {
        onChange(value.filter((_, i) => i !== index));
    };
    return (
        <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{label}</Label>
            <div className="flex flex-wrap gap-1.5 rounded-xl border border-primary/10 bg-muted/5 p-2 min-h-[40px] shadow-inner transition-all focus-within:border-primary/20">
                {value.map((item, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold bg-background/60 border-primary/5 text-muted-foreground hover:text-primary transition-colors">
                        {item}
                        <button onClick={() => handleRemove(index)} className="rounded-full hover:bg-primary/10 p-0.5">
                            <X className="h-2.5 w-2.5" />
                        </button>
                    </Badge>
                ))}
                <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="flex-1 border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 px-1 h-6 text-[11px] bg-transparent font-medium"
                />
            </div>
        </div>
    );
}

export function GlobalProjectControls() {
    const { project, updateProject } = useBuilderStore();
    if (!project) return null;

    const handleComplexityChange = (value: number) => updateProject(p => p.with({ complexity: value }));
    const handleFormalityChange = (value: number) => updateProject(p => p.with({ formality: value }));
    const handleLanguageChange = (value: Language) => updateProject(p => p.with({ language: value }));
    const handleToneChange = (value: string) => updateProject(p => p.with({ tone: value as Tone }));

    const handleBehaviorUpdate = (index: number, updates: { name?: string; type?: 'persona' | 'behavior' }) => {
        const behaviors = project.behaviors ? [...project.behaviors] : [];
        behaviors[index] = { ...behaviors[index], ...updates };
        updateProject(p => p.with({ behaviors }));
    };

    const addBehavior = () => {
        const behaviors = project.behaviors ? [...project.behaviors] : [];
        behaviors.push({ name: '', type: 'behavior' });
        updateProject(p => p.with({ behaviors }));
    };

    const removeBehavior = (index: number) => {
        const behaviors = project.behaviors?.filter((_, i) => i !== index);
        updateProject(p => p.with({ behaviors }));
    };

    const handleRulesChange = (rules: string[]) => updateProject(p => p.with({ rules }));
    const handleConstraintsChange = (constraints: string[]) => updateProject(p => p.with({ constraints }));

    return (
        <div className="h-full flex flex-col pt-2 animate-in fade-in slide-in-from-right-2 duration-300">
            <div className="space-y-1 mb-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">Cognitive Parameters</h4>
                <p className="text-[9px] text-muted-foreground italic font-medium opacity-60 uppercase tracking-wider">
                    Fine-tune the neural logic and behavioral vectors for the entire project.
                </p>
            </div>

            <ScrollArea className="flex-1 pr-4 -mr-4">
                <div className="space-y-6 pb-24 relative">
                    <div className="absolute left-[-1.25rem] top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/5 to-transparent" />
                    
                    <div className="space-y-5">
                        <div className="space-y-3.5">
                            <div className="flex justify-between items-center group/label">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 group-hover/label:text-primary transition-colors">Cognitive Formality</Label>
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
                                    <Badge variant="outline" className="h-5 text-[9px] font-black border-primary/20 bg-primary/5 text-primary tabular-nums ring-1 ring-primary/10 shadow-inner">
                                        {project.formality ?? 70}%
                                    </Badge>
                                </div>
                            </div>
                            <Slider value={[project.formality ?? 70]} onValueChange={(val) => handleFormalityChange(val[0])} min={0} max={100} step={10} className="py-1.5" />
                            <p className="text-[9px] text-muted-foreground italic font-medium opacity-60">Determines the academic weight and linguistic elevation.</p>
                        </div>

                        <div className="space-y-3.5">
                            <div className="flex justify-between items-center group/label">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 group-hover/label:text-primary transition-colors">Syntactic Complexity</Label>
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
                                    <Badge variant="outline" className="h-5 text-[9px] font-black border-primary/20 bg-primary/5 text-primary tabular-nums ring-1 ring-primary/10 shadow-inner">
                                        {project.complexity ?? 50}%
                                    </Badge>
                                </div>
                            </div>
                            <Slider value={[project.complexity ?? 50]} onValueChange={(val) => handleComplexityChange(val[0])} min={0} max={100} step={10} className="py-1.5" />
                            <p className="text-[9px] text-muted-foreground italic font-medium opacity-60">Scales the depth of vocabulary and structural density.</p>
                        </div>
                    </div>

                    <Separator className="bg-gradient-to-r from-primary/20 via-primary/5 to-transparent h-px" />

                    <div className="grid gap-4 grid-cols-2">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Language Vector</Label>
                            <Select value={project.language ?? 'default'} onValueChange={handleLanguageChange}>
                                <SelectTrigger className="h-9 text-[11px] bg-muted/5 border-primary/10 focus:ring-primary/20 rounded-xl">
                                    <SelectValue placeholder="Select Language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="default" className="text-[11px]">System Default</SelectItem>
                                    <SelectItem value="en" className="text-[11px]">English (Academic)</SelectItem>
                                    <SelectItem value="ar" className="text-[11px]">Arabic (Standard)</SelectItem>
                                    <SelectItem value="es" className="text-[11px]">Spanish</SelectItem>
                                    <SelectItem value="fr" className="text-[11px]">French</SelectItem>
                                    <SelectItem value="de" className="text-[11px]">German</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Intelligence Tone</Label>
                            <Select value={project.tone ?? 'professional'} onValueChange={handleToneChange}>
                                <SelectTrigger className="h-9 text-[11px] bg-muted/5 border-primary/10 focus:ring-primary/20 rounded-xl">
                                    <SelectValue placeholder="Select Tone" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ToneSchema.options.map(tone => (
                                        <SelectItem key={tone} value={tone} className="text-[11px]">{tone.charAt(0).toUpperCase() + tone.slice(1)}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Separator className="bg-gradient-to-r from-primary/20 via-primary/5 to-transparent h-px" />

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 group/header">
                            <div className="h-4 w-1 bg-primary/40 rounded-full group-hover:h-6 transition-all duration-300" />
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Behavioral Personas</Label>
                        </div>
                        <div className="space-y-2.5">
                            {project.behaviors?.map((item, index) => (
                                <div key={index} className="space-y-2 p-2.5 rounded-xl border border-primary/10 bg-muted/5 relative group transition-all hover:border-primary/20">
                                    <Button variant="ghost" size="icon" className="h-6 w-6 absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive" onClick={() => removeBehavior(index)}><X className="h-3 w-3" /></Button>
                                    <Input value={item.name} onChange={(e) => handleBehaviorUpdate(index, { name: e.target.value })} placeholder="e.g., Act as an expert researcher" className="text-[11px] h-8 bg-background/60 border-primary/5 rounded-lg focus-visible:ring-primary/10 shadow-inner" />
                                    <ToggleGroup type="single" value={item.type} onValueChange={(value) => { if (value) handleBehaviorUpdate(index, { type: value as 'persona' | 'behavior' }) }} className="justify-start">
                                        <ToggleGroupItem value="persona" className="text-[9px] px-2 h-6 font-black uppercase tracking-wider rounded-md">Persona</ToggleGroupItem>
                                        <ToggleGroupItem value="behavior" className="text-[9px] px-2 h-6 font-black uppercase tracking-wider rounded-md">Behavior</ToggleGroupItem>
                                    </ToggleGroup>
                                </div>
                            ))}
                            <Button variant="outline" size="sm" className="w-full text-[10px] font-black uppercase tracking-[0.2em] gap-2 h-8 rounded-xl border-dashed border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all" onClick={addBehavior}>
                                <Plus className="h-3 w-3" /> 
                                Initialize Behavior
                            </Button>
                        </div>
                    </div>

                    <Separator className="bg-gradient-to-r from-primary/20 via-primary/5 to-transparent h-px" />

                    <div className="space-y-6">
                        <TagInput label="Mandatory Neural Rules" placeholder="e.g., Always use metric units..." value={project.rules || []} onChange={handleRulesChange} />
                        <TagInput label="Constraints / Avoidance" placeholder="e.g., Avoid passive voice..." value={project.constraints || []} onChange={handleConstraintsChange} />
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
