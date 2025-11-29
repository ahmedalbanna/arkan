
'use client';

import React from 'react';
import { useLocalization } from '@/context/LocalizationContext';
import { useGenerationUIStore } from '@/hooks';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '../ui/checkbox';
import { type Tone, type Language } from '@/hooks/core/useGenerationUIStore';

export const SectionGenerationControls = ({ sectionKey }: { sectionKey: string }) => {
    const { t } = useLocalization();
    const { controlState, handleControlChange } = useGenerationUIStore();
    const controls = controlState[sectionKey];

    if (!controls) {
        return null;
    }

    const handleOutputStyleChange = (style: 'heading' | 'paragraph' | 'list' | 'table' | 'code', checked: boolean) => {
        const newOutputStyle = {
            ...controls.outputStyle,
            [style]: checked
        };
        handleControlChange(sectionKey, 'outputStyle', newOutputStyle);
    }

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <Label htmlFor={`formality-${sectionKey}`}>{t('builder.reportGenerator.tool_formality_label')}</Label>
                <Slider id={`formality-${sectionKey}`} value={[controls.formality]} onValueChange={(val) => handleControlChange(sectionKey, 'formality', val[0])} max={100} step={1} />
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{t('builder.reportGenerator.tool_formality_informal')}</span>
                    <span>{t('builder.reportGenerator.tool_formality_balanced')}</span>
                    <span>{t('builder.reportGenerator.tool_formality_formal')}</span>
                </div>
            </div>
            <div className="space-y-3">
                <Label htmlFor={`complexity-${sectionKey}`}>Complexity</Label>
                <Slider id={`complexity-${sectionKey}`} value={[controls.complexity]} onValueChange={(val) => handleControlChange(sectionKey, 'complexity', val[0])} max={100} step={1} />
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Simple</span>
                    <span>Balanced</span>
                    <span>Technical</span>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor={`tone-${sectionKey}`}>{t('builder.reportGenerator.tool_tone_label')}</Label>
                    <Select value={controls.tone} onValueChange={(val) => handleControlChange(sectionKey, 'tone', val as Tone)}>
                        <SelectTrigger id={`tone-${sectionKey}`}><SelectValue placeholder={t('reportGenerator.tool_tone_placeholder')} /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="professional">{t('builder.reportGenerator.tool_tone_professional')}</SelectItem>
                            <SelectItem value="academic">{t('builder.reportGenerator.tool_tone_academic')}</SelectItem>
                            <SelectItem value="casual">{t('builder.reportGenerator.tool_tone_casual')}</SelectItem>
                            <SelectItem value="persuasive">{t('builder.reportGenerator.tool_tone_persuasive')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`language-${sectionKey}`}>Language</Label>
                    <Select value={controls.language} onValueChange={(val) => handleControlChange(sectionKey, 'language', val as Language)}>
                        <SelectTrigger id={`language-${sectionKey}`}><SelectValue placeholder="Select language..." /></SelectTrigger>
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
                        <Checkbox id={`output-heading-${sectionKey}`} checked={controls.outputStyle.heading} onCheckedChange={(checked) => handleOutputStyleChange('heading', !!checked)} />
                        <Label htmlFor={`output-heading-${sectionKey}`}>Heading</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox id={`output-paragraph-${sectionKey}`} checked={controls.outputStyle.paragraph} onCheckedChange={(checked) => handleOutputStyleChange('paragraph', !!checked)} />
                        <Label htmlFor={`output-paragraph-${sectionKey}`}>Paragraph</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox id={`output-list-${sectionKey}`} checked={controls.outputStyle.list} onCheckedChange={(checked) => handleOutputStyleChange('list', !!checked)} />
                        <Label htmlFor={`output-list-${sectionKey}`}>List</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox id={`output-table-${sectionKey}`} checked={controls.outputStyle.table} onCheckedChange={(checked) => handleOutputStyleChange('table', !!checked)} />
                        <Label htmlFor={`output-table-${sectionKey}`}>Table</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox id={`output-code-${sectionKey}`} checked={controls.outputStyle.code} onCheckedChange={(checked) => handleOutputStyleChange('code', !!checked)} />
                        <Label htmlFor={`output-code-${sectionKey}`}>Code</Label>
                    </div>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor={`wordCount-${sectionKey}`}>{t('builder.reportGenerator.tool_word_count_label')}</Label>
                <Input id={`wordCount-${sectionKey}`} type="number" placeholder={t('reportGenerator.tool_word_count_placeholder')} value={controls.wordCount} onChange={(e) => handleControlChange(sectionKey, 'wordCount', e.target.value)} />
            </div>
        </div>
    );
};
