
'use client';

import React, { useMemo, useState } from 'react';
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
import { DiagramType, DiagramTypeSchema, ToneSchema } from '@/ai/schemas';
import { Textarea } from '../ui/textarea';

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


export function SectionGenerationControls({ section }: { section: Section }) {
    const { t } = useLocalization();
    const { updateProject } = useBuilderStore();
    const controls = section.controls;

    const [isCustomTone, setIsCustomTone] = useState(() => !toneOptions.some(opt => opt.value === controls.tone));
    const [isCustomLanguage, setIsCustomLanguage] = useState(() =>
        !['default', 'en', 'ar', 'es', 'fr', 'de'].includes(controls.language)
    );

    if (!controls) {
        return null;
    }

    function handleControlChange<K extends keyof GenerationControlState>(
        field: K,
        value: GenerationControlState[K]
    ) {
        updateProject(p => p.updateSection(section.id, s => s.with({ controls: { ...s.controls, [field]: value } })));
    };

    function handleOutputStyleChange(style: keyof GenerationControlState['outputStyle'], checked: boolean) {
        updateProject(p => p.updateSection(section.id, s => s.with({
            controls: {
                ...s.controls,
                outputStyle: {
                    ...s.controls.outputStyle,
                    [style]: checked
                }
            }
        })));
    }

    const instructionPreview = section.buildActionPrompt();

    const handleToneChange = (value: string) => {
        if (value === 'custom') {
            setIsCustomTone(true);
            handleControlChange('tone', '' as Tone);
        } else {
            setIsCustomTone(false);
            handleControlChange('tone', value as Tone);
        }
    };

    const handleCustomToneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const customValue = e.target.value;
        if (customValue === '') {
            setIsCustomTone(false);
            handleControlChange('tone', 'professional');
        } else {
            handleControlChange('tone', customValue as Tone);
        }
    };

    const handleLanguageChange = (value: string) => {
        if (value === 'custom') {
            setIsCustomLanguage(true);
            handleControlChange('language', '' as Language);
        } else {
            setIsCustomLanguage(false);
            handleControlChange('language', value as Language);
        }
    };

    const handleCustomLanguageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const customValue = e.target.value;
        if (customValue === '') {
            setIsCustomLanguage(false);
            handleControlChange('language', 'default');
        } else {
            handleControlChange('language', customValue as Language);
        }
    };

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
                    {isCustomTone ? (
                        <Input
                            id={`tone-${section.id}`}
                            value={controls.tone}
                            onChange={handleCustomToneChange}
                            placeholder="Enter custom tone..."
                        />
                    ) : (
                        <Select value={controls.tone} onValueChange={handleToneChange}>
                            <SelectTrigger id={`tone-${section.id}`}>
                                <SelectValue placeholder={t('reportGenerator.tool_tone_placeholder')} />
                            </SelectTrigger>
                            <SelectContent>
                                {toneOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                                <SelectItem value="custom">Custom...</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`language-${section.id}`}>Language</Label>
                    {isCustomLanguage ? (
                        <Input
                            id={`language-${section.id}`}
                            value={controls.language}
                            onChange={handleCustomLanguageChange}
                            placeholder="Enter language..."
                        />
                    ) : (
                        <Select value={controls.language} onValueChange={handleLanguageChange}>
                            <SelectTrigger id={`language-${section.id}`}><SelectValue placeholder="Select language..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="default">Default</SelectItem>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="ar">Arabic</SelectItem>
                                <SelectItem value="es">Spanish</SelectItem>
                                <SelectItem value="fr">French</SelectItem>
                                <SelectItem value="de">German</SelectItem>
                                <SelectItem value="custom">Custom...</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
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
                    <div className="flex items-center gap-2">
                        <Checkbox id={`output-math-${section.id}`} checked={controls.outputStyle.math} onCheckedChange={(checked) => handleOutputStyleChange('math', !!checked)} />
                        <Label htmlFor={`output-math-${section.id}`}>Math</Label>
                    </div>
                </div>
            </div>
            
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Checkbox id={`include-citations-${section.id}`} checked={controls.outputStyle.includeCitations} onCheckedChange={(checked) => handleOutputStyleChange('includeCitations', !!checked)} />
                    <Label htmlFor={`include-citations-${section.id}`}>Include Citations</Label>
                </div>
                {controls.outputStyle.includeCitations && (
                     <div className="space-y-2 pl-6">
                        <Label htmlFor={`citationStyle-${section.id}`}>Citation Style</Label>
                        <Select value={controls.citationStyle} onValueChange={(val) => handleControlChange('citationStyle', val as any)}>
                            <SelectTrigger id={`citationStyle-${section.id}`}><SelectValue placeholder="Select citation style..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="APA7">APA 7th Edition</SelectItem>
                                <SelectItem value="IEEE">IEEE</SelectItem>
                                <SelectItem value="MLA">MLA</SelectItem>
                                <SelectItem value="Chicago">Chicago</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>

            {controls.outputStyle.heading && (
                <div className="space-y-2 pl-6 border-l-2 ml-2">
                    <Label htmlFor={`includedHeadings-${section.id}`}>Included Topics (one per line)</Label>
                    <Textarea
                        id={`includedHeadings-${section.id}`}
                        value={(controls.includedHeadings || []).join('\n')}
                        onChange={(e) => handleControlChange('includedHeadings', e.target.value.split('\n'))}
                        placeholder="e.g., Key finding 1\nKey finding 2"
                        rows={3}
                    />
                </div>
            )}

            {controls.outputStyle.table && (
                <div className="space-y-2 pl-6 border-l-2 ml-2">
                    <Label htmlFor={`tableCaption-${section.id}`}>Table Caption (Optional)</Label>
                    <Input
                        id={`tableCaption-${section.id}`}
                        value={controls.tableCaption || ''}
                        onChange={(e) => handleControlChange('tableCaption', e.target.value)}
                        placeholder="e.g., Q1 Financial Summary"
                    />
                </div>
            )}

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
                    <p className="text-xs italic text-muted-foreground whitespace-pre-wrap">{instructionPreview}</p>
                </CardContent>
            </Card>
        </div>
    );
};
