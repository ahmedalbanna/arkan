'use client';

import React from 'react';
import { useBuilderStore } from '@/hooks';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToneSchema, type Language, type Tone } from '@/modules/ai-content/domain/entities/ControlTypes';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export function GlobalProjectControls() {
    const { project, updateProject } = useBuilderStore();

    if (!project) return null;

    const handleComplexityChange = (value: number) => {
        updateProject(p => p.with({ complexity: value }));
    };

    const handleFormalityChange = (value: number) => {
        updateProject(p => p.with({ formality: value }));
    };

    const handleLanguageChange = (value: Language) => {
        updateProject(p => p.with({ language: value }));
    };

    const handleToneChange = (value: string) => {
        updateProject(p => p.with({ tone: value as Tone }));
    };

    return (
        <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
                <CardTitle className="text-lg font-headline">Global Project Controls</CardTitle>
                <CardDescription>Adjust the overall tone, complexity, and language of your project.</CardDescription>
            </CardHeader>
            <CardContent className="px-0 space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label className="text-xs font-semibold tracking-wider uppercase">Formality</Label>
                            <Badge variant="secondary">{project.formality ?? 70}%</Badge>
                        </div>
                        <Slider
                            value={[project.formality ?? 70]}
                            onValueChange={(val) => handleFormalityChange(val[0])}
                            min={0}
                            max={100}
                            step={10}
                        />
                        <p className="text-[10px] text-muted-foreground italic">Higher values result in more formal, academic language.</p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label className="text-xs font-semibold tracking-wider uppercase">Complexity</Label>
                            <Badge variant="secondary">{project.complexity ?? 50}%</Badge>
                        </div>
                        <Slider
                            value={[project.complexity ?? 50]}
                            onValueChange={(val) => handleComplexityChange(val[0])}
                            min={0}
                            max={100}
                            step={10}
                        />
                        <p className="text-[10px] text-muted-foreground italic">Higher values use more sophisticated vocabulary and sentence structures.</p>
                    </div>
                </div>

                <Separator />

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold tracking-wider uppercase">Language</Label>
                        <Select value={project.language ?? 'default'} onValueChange={handleLanguageChange}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Language" />
                            </SelectTrigger>
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
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Tone" />
                            </SelectTrigger>
                            <SelectContent>
                                {ToneSchema.options.map(tone => (
                                    <SelectItem key={tone} value={tone}>
                                        {tone.charAt(0).toUpperCase() + tone.slice(1)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
