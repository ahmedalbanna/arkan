

'use client';

import React from 'react';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore } from '@/hooks';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '../ui/checkbox';
import type { Tone, Language, GenerationControlState, Section, ManipulationType } from '@/lib/models';
import { Info } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

const styles = [
    "Informal", "Friendly", "Simple", "Formal", "Professional", "Narrative",
    "Descriptive", "Expository", "Argumentative", "Persuasive", "Creative",
    "Technical", "Academic", "Journalistic", "Poetic", "Satirical", "Humorous"
];

const manipulationTypes: { value: ManipulationType; label: string }[] = [
    { value: 'rewrite', label: 'Rewrite' },
    { value: 'summarize', label: 'Summarize' },
    { value: 'style-editor', label: 'Improve Style' },
    { value: 'readability-enhancer', label: 'Enhance Readability' },
    { value: 'conciseness-checker', label: 'Make Concise' },
    { value: 'clarity-advisor', label: 'Improve Clarity' },
];

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
        </>
    );

    const renderToneAndLanguageControls = () => (
        <>
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
        </>
    );

    const renderTextManipulationControls = () => (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor={`manipulationType-${section.id}`}>Manipulation Type</Label>
                <Select value={controls.manipulationType || 'rewrite'} onValueChange={(val) => handleControlChange('manipulationType', val as any)}>
                    <SelectTrigger id={`manipulationType-${section.id}`}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {manipulationTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Separator />

            {controls.manipulationType === 'rewrite' && (
                <div className="space-y-2">
                    <Label htmlFor={`rewriteStyle-${section.id}`}>{t('writingTools.textStylist.styleLabel')}</Label>
                    <Select value={controls.rewriteStyle || 'Formal'} onValueChange={(val) => handleControlChange('rewriteStyle', val as any)}>
                        <SelectTrigger id={`rewriteStyle-${section.id}`}><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {styles.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {controls.manipulationType === 'summarize' && (
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <Label htmlFor={`compressionRatio-${section.id}`}>{t('writingTools.textStylist.compressionRatioLabel')}</Label>
                        <Badge variant="outline">{controls.compressionRatio || 50}%</Badge>
                    </div>
                    <Slider
                        id={`compressionRatio-${section.id}`}
                        value={[controls.compressionRatio || 50]}
                        onValueChange={(val) => handleControlChange('compressionRatio', val[0])}
                        min={10} max={90} step={5}
                    />
                </div>
            )}

            {controls.manipulationType === 'style-editor' && (
                <>
                    <div className="space-y-2">
                        <Label htmlFor={`targetAudience-${section.id}`}>Target Audience (Optional)</Label>
                        <Input id={`targetAudience-${section.id}`} value={controls.targetAudience || ''} onChange={e => handleControlChange('targetAudience', e.target.value)} placeholder="e.g., general public" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`tone-${section.id}`}>Tone (Optional)</Label>
                        <Input id={`tone-${section.id}`} value={controls.tone || ''} onChange={e => handleControlChange('tone', e.target.value as Tone)} placeholder="e.g., professional" />
                    </div>
                </>
            )}

            {controls.manipulationType === 'readability-enhancer' && (
                 <div className="space-y-2">
                    <Label htmlFor={`targetLevel-${section.id}`}>Target Reading Level</Label>
                    <Select value={controls.targetLevel} onValueChange={(val) => handleControlChange('targetLevel', val as any)}>
                        <SelectTrigger id={`targetLevel-${section.id}`}><SelectValue placeholder="Select reading level" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="elementary">Elementary</SelectItem>
                            <SelectItem value="middle-school">Middle School</SelectItem>
                            <SelectItem value="high-school">High School</SelectItem>
                            <SelectItem value="college">College</SelectItem>
                            <SelectItem value="graduate">Graduate</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}
            
            {controls.manipulationType === 'conciseness-checker' && (
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <Label htmlFor={`targetReduction-${section.id}`}>Target Reduction</Label>
                        <Badge variant="outline">{controls.targetReduction || 0}%</Badge>
                    </div>
                    <Slider
                        id={`targetReduction-${section.id}`}
                        value={[controls.targetReduction || 0]}
                        onValueChange={(val) => handleControlChange('targetReduction', val[0])}
                        min={0} max={50} step={5}
                    />
                </div>
            )}

            {controls.manipulationType === 'clarity-advisor' && (
                <div className="space-y-2">
                    <Label htmlFor={`focusAreas-${section.id}`}>Focus Areas (comma-separated)</Label>
                    <Input id={`focusAreas-${section.id}`} value={controls.focusAreas?.join(', ') || ''} onChange={(e) => handleControlChange('focusAreas', e.target.value.split(',').map(s => s.trim()))} placeholder="e.g., sentence structure, word choice" />
                </div>
            )}
        </div>
    );

    const renderNoControlsMessage = () => (
        <div className="text-center text-muted-foreground p-4 border rounded-md bg-muted/50">
            <Info className="mx-auto h-6 w-6 mb-2" />
            <p className="text-sm">No specific output controls are available for this section type.</p>
        </div>
    );

    const renderControlsForType = () => {
        switch (section.type) {
            case 'generation':
                return renderFullControls();
            case 'text-manipulation':
                return renderTextManipulationControls();
            case 'analysis':
            case 'document-processing':
            case 'utilities':
            default:
                return renderNoControlsMessage();
        }
    };

    return (
        <div className="space-y-6">
            {renderControlsForType()}
        </div>
    );
};
