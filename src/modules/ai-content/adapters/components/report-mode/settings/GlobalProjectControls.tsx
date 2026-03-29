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
        <div className="space-y-2">
            <Label className="text-xs font-semibold tracking-wider uppercase">{label}</Label>
            <div className="flex flex-wrap gap-2 rounded-lg border border-border/60 bg-muted/20 p-2 min-h-[44px]">
                {value.map((item, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1 px-2 py-1 text-[10px]">
                        {item}
                        <button onClick={() => handleRemove(index)} className="rounded-full hover:bg-muted-foreground/20">
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                ))}
                <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="flex-1 border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto text-xs"
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
        <ScrollArea className="h-full pr-4 -mr-4">
            <Card className="border-0 shadow-none bg-transparent">
                <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-lg font-headline">Global AI Settings</CardTitle>
                    <CardDescription>Adjust the overall tone, complexity, and behavioral rules for your project.</CardDescription>
                </CardHeader>
                <CardContent className="px-0 space-y-6 pb-20">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center"><Label className="text-xs font-semibold tracking-wider uppercase">Formality</Label><Badge variant="secondary">{project.formality ?? 70}%</Badge></div>
                            <Slider value={[project.formality ?? 70]} onValueChange={(val) => handleFormalityChange(val[0])} min={0} max={100} step={10} />
                            <p className="text-[10px] text-muted-foreground italic">Higher values result in more formal, academic language.</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center"><Label className="text-xs font-semibold tracking-wider uppercase">Complexity</Label><Badge variant="secondary">{project.complexity ?? 50}%</Badge></div>
                            <Slider value={[project.complexity ?? 50]} onValueChange={(val) => handleComplexityChange(val[0])} min={0} max={100} step={10} />
                            <p className="text-[10px] text-muted-foreground italic">Higher values use more sophisticated vocabulary and sentence structures.</p>
                        </div>
                    </div>
                    <Separator />
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold tracking-wider uppercase">Language</Label>
                            <Select value={project.language ?? 'default'} onValueChange={handleLanguageChange}>
                                <SelectTrigger className="w-full"><SelectValue placeholder="Select Language" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="default">Default (System Language)</SelectItem>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="ar">Arabic</SelectItem>
                                    <SelectItem value="es">Spanish</SelectItem>
                                    <SelectItem value="fr">French</SelectItem>
                                    <SelectItem value="de">German</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold tracking-wider uppercase">Tone of Voice</Label>
                            <Select value={project.tone ?? 'professional'} onValueChange={handleToneChange}>
                                <SelectTrigger className="w-full"><SelectValue placeholder="Select Tone" /></SelectTrigger>
                                <SelectContent>
                                    {ToneSchema.options.map(tone => (
                                        <SelectItem key={tone} value={tone}>{tone.charAt(0).toUpperCase() + tone.slice(1)}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <Separator />
                    <div className="space-y-4">
                        <Label className="text-xs font-semibold tracking-wider uppercase">Behaviors & Personas</Label>
                        <div className="space-y-3">
                            {project.behaviors?.map((item, index) => (
                                <div key={index} className="space-y-2 p-3 rounded-lg border border-border/60 bg-muted/10 relative group">
                                    <Button variant="ghost" size="icon" className="h-6 w-6 absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeBehavior(index)}><X className="h-3 w-3 text-destructive" /></Button>
                                    <Input value={item.name} onChange={(e) => handleBehaviorUpdate(index, { name: e.target.value })} placeholder="e.g., Act as an expert researcher" className="text-xs h-8 bg-background" />
                                    <ToggleGroup type="single" value={item.type} onValueChange={(value) => { if (value) handleBehaviorUpdate(index, { type: value as 'persona' | 'behavior' }) }} className="justify-start scale-90 -ml-2">
                                        <ToggleGroupItem value="persona" className="text-[10px] px-2 h-7">Persona</ToggleGroupItem>
                                        <ToggleGroupItem value="behavior" className="text-[10px] px-2 h-7">Behavior</ToggleGroupItem>
                                    </ToggleGroup>
                                </div>
                            ))}
                            <Button variant="outline" size="sm" className="w-full text-xs gap-1 h-8" onClick={addBehavior}><Plus className="h-3 w-3" /> Add Behavior</Button>
                        </div>
                    </div>
                    <Separator />
                    <div className="space-y-6">
                        <TagInput label="Mandatory Rules" placeholder="e.g., Always use metric units" value={project.rules || []} onChange={handleRulesChange} />
                        <TagInput label="Constraints / Avoid" placeholder="e.g., Avoid passive voice" value={project.constraints || []} onChange={handleConstraintsChange} />
                    </div>
                </CardContent>
            </Card>
        </ScrollArea>
    );
}
