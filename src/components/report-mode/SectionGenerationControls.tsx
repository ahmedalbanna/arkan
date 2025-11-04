'use client';

import React from 'react';
import { useLocalization } from '@/context/LocalizationContext';
import { useGenerationUIStore } from '@/hooks';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '../ui/checkbox';
import { type Tone } from '@/hooks/core/useGenerationUIStore';
export const SectionGenerationControls = ({ sectionKey }: { sectionKey: string }) => {
    const { t } = useLocalization();
    const { controlState, handleControlChange } = useGenerationUIStore();
    const controls = controlState[sectionKey];

    if (!controls) {
        return null;
    }

    const handleOutputStyleChange = (style: 'heading' | 'paragraph' | 'list', checked: boolean) => {
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
                <Label>Output Format</Label>
                <div className="flex items-center gap-4">
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
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor={`wordCount-${sectionKey}`}>{t('builder.reportGenerator.tool_word_count_label')}</Label>
                <Input id={`wordCount-${sectionKey}`} type="number" placeholder={t('reportGenerator.tool_word_count_placeholder')} value={controls.wordCount} onChange={(e) => handleControlChange(sectionKey, 'wordCount', e.target.value)} />
            </div>
        </div>
    );
};
