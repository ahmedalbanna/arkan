
'use client';

import { DiagramType, DiagramTypeSchema, ToneSchema } from '@/modules/ai/domain/schemas';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore } from '@/hooks';
import { type GenerationControlState, type Tone } from '@/modules/ai-content/domain/entities/ControlTypes';
import { Section } from '@/modules/ai-content/domain/entities/Section';
import { Eye, Info } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { FullPromptPreviewDialog } from './FullPromptPreviewDialog';

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

interface SectionGenerationControlsProps {
    section: Section;
}

export function SectionGenerationControls({
    section,
}: SectionGenerationControlsProps) {
    const { t } = useLocalization();
    const { updateProject } = useBuilderStore();
    const controls = section.controls;
    const [showFullPrompt, setShowFullPrompt] = useState(false);

    if (!controls) {
        return null;
    }

    const handleControlChange = <K extends keyof GenerationControlState>(field: K, value: GenerationControlState[K]) => {
        updateProject(p => p.updateSection(section.id, s => s.withProps({ controls: { ...s.controls, [field]: value } })));
    };

    const onOutputStyleChange = (style: keyof GenerationControlState['outputStyle'], checked: boolean) => {
        updateProject(project => project.updateSection(section.id, currentSection => currentSection.withProps({ controls: { ...currentSection.controls, outputStyle: { ...currentSection.controls.outputStyle, [style]: checked } } })));
    };

    const handleToneChange = (value: string) => {
        if (value === 'custom') {
            handleControlChange('tone', '' as Tone);
        } else {
            handleControlChange('tone', value as Tone);
        }
    };

    const isCustomTone = !toneOptions.some(opt => opt.value === controls.tone);

    const instructionPreview = section.buildActionPrompt();

    return (
        <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-3">
                    <Label htmlFor={`formality-${section.id}`}>{t('builder.reportGenerator.tool_formality_label')}</Label>
                    <Slider id={`formality-${section.id}`} value={[controls.formality]} onValueChange={(val) => handleControlChange('formality', val[0])} max={100} step={1} />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{t('builder.reportGenerator.tool_formality_informal')}</span>
                        <span>{t('builder.reportGenerator.tool_formality_balanced')}</span>
                        <span>{t('builder.reportGenerator.tool_formality_formal')}</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor={`tone-${section.id}`}>{t('builder.reportGenerator.tool_tone_label')}</Label>
                    {isCustomTone ? (
                        <Input
                            id={`tone-${section.id}`}
                            value={controls.tone}
                            onChange={(e) => handleControlChange('tone', e.target.value as Tone)}
                            onBlur={(e) => {
                                if (e.target.value.trim() === '') handleControlChange('tone', 'professional');
                            }}
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
            </div>

            <div className="space-y-2">
                <Label>Output Format</Label>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {controls.outputStyle && (Object.keys(controls.outputStyle) as Array<keyof GenerationControlState['outputStyle']>).map(key => (
                        <label key={String(key)} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm min-w-0">
                            <Checkbox id={`output-${String(key)}-${section.id}`} checked={controls.outputStyle[key]} onCheckedChange={(checked) => onOutputStyleChange(key, !!checked)} />
                            <span className="capitalize truncate break-words">{String(key).replace(/([A-Z])/g, ' $1')}</span>
                        </label>
                    ))}
                </div>
            </div>

            {controls.outputStyle?.heading && (
                <div className="space-y-2 rounded-lg border bg-muted/20 p-4">
                    <Label htmlFor={`includedHeadings-${section.id}`}>Included Topics (one per line)</Label>
                    <Textarea
                        id={`includedHeadings-${section.id}`}
                        defaultValue={(controls.includedHeadings || []).join('\n')}
                        onBlur={(e) => handleControlChange('includedHeadings', e.target.value.split('\n').filter(s => s.trim()))}
                        placeholder="e.g., Key finding 1\nKey finding 2"
                        rows={3}
                    />
                </div>
            )}

            {controls.outputStyle?.table && (
                <div className="space-y-2 rounded-lg border bg-muted/20 p-4">
                    <Label htmlFor={`tableCaption-${section.id}`}>Table Caption (Optional)</Label>
                    <Input
                        id={`tableCaption-${section.id}`}
                        defaultValue={controls.tableCaption || ''}
                        onBlur={(e) => handleControlChange('tableCaption', e.target.value)}
                        placeholder="e.g., Q1 Financial Summary"
                    />
                </div>
            )}

            {controls.outputStyle?.code && (
                <div className="space-y-2 rounded-lg border bg-muted/20 p-4">
                    <Label htmlFor={`programmingLanguage-${section.id}`}>Programming Language</Label>
                    <Input
                        id={`programmingLanguage-${section.id}`}
                        defaultValue={controls.programmingLanguage || ''}
                        onBlur={(e) => handleControlChange('programmingLanguage', e.target.value)}
                        placeholder="e.g., JavaScript, Python"
                    />
                </div>
            )}

            {controls.outputStyle?.diagram && (
                <div className="space-y-2 rounded-lg border bg-muted/20 p-4">
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

            {controls.outputStyle?.includeCitations && (
                <div className="space-y-2 rounded-lg border bg-muted/20 p-4">
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

            <div className="space-y-2">
                <Label htmlFor={`wordCount-${section.id}`}>{t('builder.reportGenerator.tool_word_count_label')}</Label>
                <Input
                    id={`wordCount-${section.id}`}
                    type="text"
                    placeholder={t('builder.reportGenerator.tool_word_count_placeholder')}
                    defaultValue={controls.wordCount || ''}
                    onBlur={(e) => handleControlChange('wordCount', e.target.value)}
                />
            </div>

            <Card className="bg-muted/30 border-dashed">
                <CardHeader className="flex flex-row items-center justify-between p-3">
                    <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-muted-foreground" />
                        <CardDescription className="text-xs">
                            {t('builder.reportGenerator.tool_instruction_preview')}
                        </CardDescription>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFullPrompt(true)}
                        className="h-7 text-xs gap-1"
                    >
                        <Eye className="w-3 h-3" />
                        Full Preview
                    </Button>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                    <p className="text-xs italic text-muted-foreground whitespace-pre-wrap truncate break-words">{instructionPreview}</p>
                </CardContent>
            </Card>

            <FullPromptPreviewDialog
                isOpen={showFullPrompt}
                onOpenChange={setShowFullPrompt}
                section={section}
            />
        </div>
    );
};
