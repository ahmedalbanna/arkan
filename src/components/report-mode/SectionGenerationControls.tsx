
'use client';

import React from 'react';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore } from '@/hooks';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '../ui/checkbox';
import type { GenerationControlState, Section } from '@/lib/models';
import { Separator } from '../ui/separator';
import { useSectionGenerator } from '@/hooks/report-mode/use-section-generator';
import { Textarea } from '../ui/textarea';

export function SectionGenerationControls({ section }: { section: Section }) {
    const { t } = useLocalization();
    const { project, updateProject } = useBuilderStore();
    const { buildInstructionText } = useSectionGenerator();
    const controls = section.controls;

    if (!controls) {
        return null;
    }

    const instructionPreview = buildInstructionText(controls, project?.chapters);

    function handleControlChange<K extends keyof GenerationControlState>(
        field: K,
        value: GenerationControlState[K]
    ) {
        updateProject(p => {
            const s = p.getSection(section.id);
            if (s) {
                s.controls = { ...s.controls, [field]: value };
            }
        });
    };

    function handleOutputStyleChange(style: 'heading' | 'paragraph' | 'list' | 'table' | 'code', checked: boolean) {
        handleControlChange('outputStyle', {
            ...controls.outputStyle,
            [style]: checked
        });
    }

    const renderFullControls = () => (
        <>
            <div className="space-y-2">
                <Label htmlFor={`custom-instructions-${section.id}`}>{t('builder.reportGenerator.customInstructionsLabel', { defaultValue: 'Custom Instructions' })}</Label>
                <Textarea
                    id={`custom-instructions-${section.id}`}
                    placeholder={t('builder.reportGenerator.customInstructionsPlaceholder', { defaultValue: 'e.g., Focus on the financial implications...' })}
                    value={controls.instructionText || ''}
                    onChange={(e) => handleControlChange('instructionText', e.target.value)}
                    rows={3}
                />
            </div>

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
                {renderToneAndLanguageControls()}
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
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor={`wordCount-${section.id}`}>{t('builder.reportGenerator.tool_word_count_label')}</Label>
                <Input id={`wordCount-${section.id}`} type="number" placeholder={t('reportGenerator.tool_word_count_placeholder')} value={controls.wordCount} onChange={(e) => handleControlChange('wordCount', e.target.value)} />
            </div>

            <Separator />

            <div className="space-y-1">
                <Label className="text-xs font-semibold text-muted-foreground">{t('builder.reportGenerator.tool_instruction_preview')}</Label>
                <p className="text-xs text-muted-foreground italic h-16 overflow-y-auto p-2 border rounded-md bg-muted/20">{instructionPreview || t('builder.reportGenerator.tool_instruction_none')}</p>
            </div>
        </>
    );

    const renderToneAndLanguageControls = () => (
        <>
            <div className="space-y-2">
                <Label htmlFor={`tone-${section.id}`}>{t('builder.reportGenerator.tool_tone_label')}</Label>
                <Select value={controls.tone} onValueChange={(val) => handleControlChange('tone', val as any)}>
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
                <Select value={controls.language} onValueChange={(val) => handleControlChange('language', val as any)}>
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
        </>
    );

    return (
        <div className="space-y-6">
            {renderFullControls()}
        </div>
    );
};
