
'use client';

import React, { useMemo } from 'react';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore } from '@/hooks';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '../ui/checkbox';
import type { Tone, Language, GenerationControlState, Section } from '@/lib/models';
import { Card, CardContent, CardDescription, CardHeader } from '../ui/card';
import { Info } from 'lucide-react';
import { DiagramType, DiagramTypeSchema } from '@/ai/schemas';

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

export function SectionGenerationControls({ section }: { section: Section }) {
    const { t } = useLocalization();
    const { updateProject } = useBuilderStore();
    const controls = section.controls;

    if (!controls) {
        return null; // Or a loading/default state
    }

    function handleControlChange<K extends keyof GenerationControlState>(
        field: K,
        value: GenerationControlState[K]
    ) {
        updateProject(p => p.updateSection(section.id, s => s.with({ controls: { ...s.controls, [field]: value } })));
    };

    function handleOutputStyleChange(style: 'heading' | 'paragraph' | 'list' | 'table' | 'code' | 'diagram', checked: boolean) {
        handleControlChange('outputStyle', {
            ...controls.outputStyle,
            [style]: checked
        });
    }

    const instructionPreview = section.buildInstructionText();

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <Label htmlFor={`formality-${section.id}`}>{t('builder.reportGenerator.tool_formality_label')}</Label>
                <Slider id={`formality-${section.id}`} value={[controls.formality]} onValueChange={(val) => handleControlChange('formality', val[0])} max={100} step={1} />
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{t('builder.reportGenerator.tool_formality_informal')}</span>
                    <span>{t('builder.reportGenerator.tool_formality_balanced')}</span>
                    <span>{t('builder.reportGenerator.tool_formality_formal')}</span>
                </div>
            </div>
            <div className="space-y-3">
                <Label htmlFor={`complexity-${section.id}`}>Complexity</Label>
                <Slider id={`complexity-${section.id}`} value={[controls.complexity]} onValueChange={(val) => handleControlChange('complexity', val[0])} max={100} step={1} />
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Simple</span>
                    <span>Balanced</span>
                    <span>Technical</span>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor={`tone-${section.id}`}>{t('builder.reportGenerator.tool_tone_label')}</Label>
                    <Select value={controls.tone} onValueChange={(val) => handleControlChange('tone', val as Tone)}>
                        <SelectTrigger id={`tone-${section.id}`}><SelectValue placeholder={t('reportGenerator.tool_tone_placeholder')} /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="professional">{t('builder.reportGenerator.tool_tone_professional')}</SelectItem>
                            <SelectItem value="academic">{t('builder.reportGenerator.tool_tone_academic')}</SelectItem>
                            <SelectItem value="casual">{t('builder.reportGenerator.tool_tone_casual')}</SelectItem>
                            <SelectItem value="persuasive">{t('builder.reportGenerator.tool_tone_persuasive')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`language-${section.id}`}>Language</Label>
                    <Select value={controls.language} onValueChange={(val) => handleControlChange('language', val as Language)}>
                        <SelectTrigger id={`language-${section.id}`}><SelectValue placeholder="Select language..." /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="default">Default</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="ar">Arabic</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="de">German</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
             <div className="space-y-2">
                <Label>Output Format</Label>
                <div className="flex items-center flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                        <Checkbox id={`output-heading-${section.id}`} checked={controls.outputStyle.heading} onCheckedChange={(checked) => handleOutputStyleChange('heading', !!checked)} />
                        <Label htmlFor={`output-heading-${section.id}`}>Heading</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox id={`output-paragraph-${section.id}`} checked={controls.outputStyle.paragraph} onCheckedChange={(checked) => handleOutputStyleChange('paragraph', !!checked)} />
                        <Label htmlFor={`output-paragraph-${section.id}`}>Paragraph</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox id={`output-list-${section.id}`} checked={controls.outputStyle.list} onCheckedChange={(checked) => handleOutputStyleChange('list', !!checked)} />
                        <Label htmlFor={`output-list-${section.id}`}>List</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox id={`output-table-${section.id}`} checked={controls.outputStyle.table} onCheckedChange={(checked) => handleOutputStyleChange('table', !!checked)} />
                        <Label htmlFor={`output-table-${section.id}`}>Table</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox id={`output-code-${section.id}`} checked={controls.outputStyle.code} onCheckedChange={(checked) => handleOutputStyleChange('code', !!checked)} />
                        <Label htmlFor={`output-code-${section.id}`}>Code</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox id={`output-diagram-${section.id}`} checked={controls.outputStyle.diagram} onCheckedChange={(checked) => handleOutputStyleChange('diagram', !!checked)} />
                        <Label htmlFor={`output-diagram-${section.id}`}>Diagram</Label>
                    </div>
                </div>
            </div>

            {controls.outputStyle.code && (
                <div className="space-y-2 pl-6 border-l-2 ml-2">
                    <Label htmlFor={`programmingLanguage-${section.id}`}>Programming Language</Label>
                    <Input 
                        id={`programmingLanguage-${section.id}`}
                        value={controls.programmingLanguage || ''}
                        onChange={(e) => handleControlChange('programmingLanguage', e.target.value)}
                        placeholder="e.g., JavaScript, Python"
                    />
                </div>
            )}

            {controls.outputStyle.diagram && (
                <div className="space-y-2 pl-6 border-l-2 ml-2">
                    <Label htmlFor={`diagramType-${section.id}`}>Diagram Type</Label>
                    <Select value={controls.diagramType} onValueChange={(val) => handleControlChange('diagramType', val as DiagramType)}>
                        <SelectTrigger id={`diagramType-${section.id}`}><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {diagramTypes.map(type => (
                                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor={`wordCount-${section.id}`}>{t('builder.reportGenerator.tool_word_count_label')}</Label>
                <Input id={`wordCount-${section.id}`} type="number" placeholder={t('reportGenerator.tool_word_count_placeholder')} value={controls.wordCount} onChange={(e) => handleControlChange('wordCount', e.target.value)} />
            </div>

            <Card className="bg-muted/50 border-dashed">
                <CardHeader className="flex flex-row items-center gap-2 p-3">
                    <Info className="w-4 h-4 text-muted-foreground"/>
                    <CardDescription className="text-xs">
                        {t('builder.reportGenerator.tool_instruction_preview')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                    <p className="text-xs italic text-muted-foreground">{instructionPreview}</p>
                </CardContent>
            </Card>
        </div>
    );
};
