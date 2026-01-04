
'use client';

import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore } from '@/hooks';
import type { Language, OutputStyle, Section, Tone } from '@/lib/models';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';

interface SectionGenerationControlsProps {
    section: Section;
}

export function SectionGenerationControls({ section }: SectionGenerationControlsProps) {
    const { t } = useLocalization();
    const { updateProject } = useBuilderStore();
    
    // Local state for the controlled input
    const [wordCount, setWordCount] = useState(section.controls.wordCount || '');

    // Sync local state if the global state changes from another source
    useEffect(() => {
        setWordCount(section.controls.wordCount || '');
    }, [section.controls.wordCount]);


    const handleControlChange = <K extends keyof Section['controls']>(
        key: K,
        value: Section['controls'][K]
    ) => {
        updateProject(p => p.updateSection(section.id, s => {
            const newControls = { ...s.controls, [key]: value };
            return s.with({ controls: newControls });
        }));
    };
    
    const handleOutputStyleChange = (styleKey: keyof OutputStyle, checked: boolean) => {
        const newOutputStyle = { ...section.controls.outputStyle, [styleKey]: checked };
        handleControlChange('outputStyle', newOutputStyle);
    }

    const tones: Tone[] = ['professional', 'academic', 'casual', 'persuasive', 'technical', 'explanatory'];
    const languages: Language[] = ['default', 'en', 'ar', 'es', 'fr', 'de'];

    return (
        <div className="space-y-4 text-sm">
            {/* Formality Slider */}
            <div className="space-y-2">
                <div className="flex justify-between">
                    <Label>{t('builder.reportGenerator.tool_formality_label')}</Label>
                    <Badge variant="outline" className="text-xs">
                        {section.controls.formality < 33 ? t('builder.reportGenerator.tool_formality_informal') :
                            section.controls.formality < 67 ? t('builder.reportGenerator.tool_formality_balanced') :
                                t('builder.reportGenerator.tool_formality_formal')}
                    </Badge>
                </div>
                <Slider
                    value={[section.controls.formality]}
                    onValueChange={(val) => handleControlChange('formality', val[0])}
                    min={0}
                    max={100}
                    step={1}
                />
            </div>
            {/* Tone Select */}
            <div className="space-y-2">
                <Label>{t('builder.reportGenerator.tool_tone_label')}</Label>
                <Select
                    value={section.controls.tone}
                    onValueChange={(val: Tone) => handleControlChange('tone', val)}
                >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {tones.map(tone => (
                            <SelectItem key={tone} value={tone} className="capitalize">{tone}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
             {/* Word Count */}
            <div className="space-y-2">
                <Label>{t('builder.reportGenerator.tool_word_count_label')}</Label>
                <Input
                    value={wordCount}
                    onChange={(e) => setWordCount(e.target.value)}
                    onBlur={() => handleControlChange('wordCount', wordCount)}
                    placeholder={t('builder.reportGenerator.tool_word_count_placeholder')}
                    type="number"
                />
            </div>
            {/* Output Styles Checkboxes */}
            <div className="space-y-2">
                 <Label>Output Elements</Label>
                 <div className="grid grid-cols-2 gap-2">
                     {Object.keys(section.controls.outputStyle).map(styleKey => (
                         <div key={styleKey} className="flex items-center gap-2">
                             <Checkbox
                                 id={`style-${section.id}-${styleKey}`}
                                 checked={section.controls.outputStyle[styleKey as keyof OutputStyle]}
                                 onCheckedChange={(checked) => handleOutputStyleChange(styleKey as keyof OutputStyle, !!checked)}
                             />
                             <Label htmlFor={`style-${section.id}-${styleKey}`} className="text-xs font-normal capitalize cursor-pointer">
                                 {styleKey.replace(/([A-Z])/g, ' $1')}
                             </Label>
                         </div>
                     ))}
                 </div>
            </div>
        </div>
    );
}
