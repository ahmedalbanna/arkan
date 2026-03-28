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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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
    selectedSectionIds?: string[];
}

export function SectionGenerationControls({
    section,
    selectedSectionIds,
}: SectionGenerationControlsProps) {
    const { t } = useLocalization();
    const { updateProject } = useBuilderStore();
    const controls = section.controls;
    const [showFullPrompt, setShowFullPrompt] = useState(false);

    if (!controls) {
        return null;
    }

    const handleControlChange = <K extends keyof GenerationControlState>(field: K, value: GenerationControlState[K]) => {
        if (selectedSectionIds && selectedSectionIds.length > 0) {
            updateProject(p => {
                selectedSectionIds.forEach(id => {
                    p.updateSection(id, s => s.withProps({ controls: { ...s.controls, [field]: value } }));
                });
            });
        } else {
            updateProject(p => p.updateSection(section.id, s => s.withProps({ controls: { ...s.controls, [field]: value } })));
        }
    };

    const onOutputStyleChange = (style: keyof GenerationControlState['outputStyle'], checked: boolean) => {
        if (selectedSectionIds && selectedSectionIds.length > 0) {
            updateProject(p => {
                selectedSectionIds.forEach(id => {
                    p.updateSection(id, currentSection => currentSection.withProps({ controls: { ...currentSection.controls, outputStyle: { ...currentSection.controls.outputStyle, [style]: checked } } }));
                });
            });
        } else {
            updateProject(project => project.updateSection(section.id, currentSection => currentSection.withProps({ controls: { ...currentSection.controls, outputStyle: { ...currentSection.controls.outputStyle, [style]: checked } } })));
        }
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
        <div className="space-y-8">
            <div className="space-y-1.5">
                <h4 className="text-sm font-semibold tracking-tight">Generation Parameters</h4>
                <p className="text-[11px] text-muted-foreground italic leading-relaxed">Customize how the AI should write this specific section.</p>
            </div>

            <div className="space-y-6">
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <Label htmlFor={`formality-${section.id}`} className="text-xs font-medium">{t('builder.reportGenerator.tool_formality_label')}</Label>
                        <Badge variant="secondary" className="h-4.5 text-[10px] px-1.5">{controls.formality}%</Badge>
                    </div>
                    <Slider id={`formality-${section.id}`} value={[controls.formality]} onValueChange={(val) => handleControlChange('formality', val[0])} max={100} step={1} />
                    <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-tighter">
                        <span>{t('builder.reportGenerator.tool_formality_informal')}</span>
                        <span>{t('builder.reportGenerator.tool_formality_balanced')}</span>
                        <span>{t('builder.reportGenerator.tool_formality_formal')}</span>
                    </div>
                </div>

                <div className="space-y-2.5">
                    <Label htmlFor={`tone-${section.id}`} className="text-xs font-medium">{t('builder.reportGenerator.tool_tone_label')}</Label>
                    {isCustomTone ? (
                        <Input
                            id={`tone-${section.id}`}
                            value={controls.tone || ''}
                            onChange={(e) => handleControlChange('tone', e.target.value as Tone)}
                            onBlur={(e) => {
                                if (e.target.value.trim() === '') handleControlChange('tone', 'professional');
                            }}
                            placeholder="Enter custom tone..."
                            className="h-9 text-xs"
                        />
                    ) : (
                        <Select value={controls.tone} onValueChange={handleToneChange}>
                            <SelectTrigger id={`tone-${section.id}`} className="h-9 text-xs bg-background">
                                <SelectValue placeholder={t('reportGenerator.tool_tone_placeholder')} />
                            </SelectTrigger>
                            <SelectContent>
                                {toneOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>
                                ))}
                                <SelectItem value="custom" className="text-xs italic text-primary">Custom Tone...</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                </div>

                <div className="space-y-2.5">
                    <Label htmlFor={`wordCount-${section.id}`} className="text-xs font-medium">{t('builder.reportGenerator.tool_word_count_label')}</Label>
                    <Input
                        id={`wordCount-${section.id}`}
                        type="text"
                        placeholder={t('builder.reportGenerator.tool_word_count_placeholder')}
                        defaultValue={controls.wordCount || ''}
                        onBlur={(e) => handleControlChange('wordCount', e.target.value)}
                        className="h-9 text-xs"
                    />
                </div>
            </div>

            <Separator className="bg-border/40" />

            <div className="space-y-4">
                <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">Format & Structure</Label>
                    <p className="text-[10px] text-muted-foreground italic">Select elements to include in the output.</p>
                </div>
                
                <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                    {controls.outputStyle && (Object.keys(controls.outputStyle) as Array<keyof GenerationControlState['outputStyle']>).map(key => (
                        <label key={String(key)} className="flex items-center gap-2.5 rounded-md border bg-muted/5 px-2.5 py-2 text-xs hover:bg-muted/10 transition-colors cursor-pointer group">
                            <Checkbox id={`output-${String(key)}-${section.id}`} checked={controls.outputStyle[key]} onCheckedChange={(checked) => onOutputStyleChange(key, !!checked)} className="h-3.5 w-3.5" />
                            <span className="capitalize truncate group-hover:text-primary transition-colors">{String(key).replace(/([A-Z])/g, ' $1')}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                {controls.outputStyle?.heading && (
                    <div className="space-y-2 rounded-lg border bg-muted/10 p-3 shadow-sm">
                        <Label htmlFor={`includedHeadings-${section.id}`} className="text-[11px] font-semibold">Included Topics (one per line)</Label>
                        <Textarea
                            id={`includedHeadings-${section.id}`}
                            defaultValue={(controls.includedHeadings || []).join('\n')}
                            onBlur={(e) => handleControlChange('includedHeadings', e.target.value.split('\n').filter(s => s.trim()))}
                            placeholder="e.g., Key finding 1\nKey finding 2"
                            rows={3}
                            className="text-xs bg-background resize-none"
                        />
                    </div>
                )}

                {controls.outputStyle?.table && (
                    <div className="space-y-2 rounded-lg border bg-muted/10 p-3 shadow-sm">
                        <Label htmlFor={`tableCaption-${section.id}`} className="text-[11px] font-semibold">Table Caption (Optional)</Label>
                        <Input
                            id={`tableCaption-${section.id}`}
                            defaultValue={controls.tableCaption || ''}
                            onBlur={(e) => handleControlChange('tableCaption', e.target.value)}
                            placeholder="e.g., Q1 Financial Summary"
                            className="h-8 text-xs bg-background"
                        />
                    </div>
                )}

                {controls.outputStyle?.code && (
                    <div className="space-y-2 rounded-lg border bg-muted/10 p-3 shadow-sm">
                        <Label htmlFor={`programmingLanguage-${section.id}`} className="text-[11px] font-semibold">Programming Language</Label>
                        <Input
                            id={`programmingLanguage-${section.id}`}
                            defaultValue={controls.programmingLanguage || ''}
                            onBlur={(e) => handleControlChange('programmingLanguage', e.target.value)}
                            placeholder="e.g., JavaScript, Python"
                            className="h-8 text-xs bg-background"
                        />
                    </div>
                )}

                {controls.outputStyle?.diagram && (
                    <div className="space-y-2 rounded-lg border bg-muted/10 p-3 shadow-sm">
                        <Label htmlFor={`diagramType-${section.id}`} className="text-[11px] font-semibold">Diagram Type</Label>
                        <Select value={controls.diagramType} onValueChange={(val) => handleControlChange('diagramType', val as DiagramType)}>
                            <SelectTrigger id={`diagramType-${section.id}`} className="h-8 text-xs bg-background"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {diagramTypes.map(type => (
                                    <SelectItem key={type.value} value={type.value} className="text-xs">{type.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {controls.outputStyle?.includeCitations && (
                    <div className="space-y-2 rounded-lg border bg-muted/10 p-3 shadow-sm">
                        <Label htmlFor={`citationStyle-${section.id}`} className="text-[11px] font-semibold">Citation Style</Label>
                        <Select value={controls.citationStyle} onValueChange={(val) => handleControlChange('citationStyle', val as any)}>
                            <SelectTrigger id={`citationStyle-${section.id}`} className="h-8 text-xs bg-background"><SelectValue placeholder="Select style..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="APA7" className="text-xs">APA 7th Edition</SelectItem>
                                <SelectItem value="IEEE" className="text-xs">IEEE</SelectItem>
                                <SelectItem value="MLA" className="text-xs">MLA</SelectItem>
                                <SelectItem value="Chicago" className="text-xs">Chicago</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}
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
