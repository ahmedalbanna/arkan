

'use client';

import { DiagramTypeSchema, PresentationTypeSchema, ReportToneSchema } from '@/ai/schemas';
import { PresentationToneSchema } from '@/ai/schemas/enums';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore } from '@/hooks';
import { buildInstructionText } from '@/hooks/report-mode/use-section-generator';
import type { GenerationControlState, Section } from '@/lib/models';
import { Checkbox } from '../ui/checkbox';
import { Separator } from '../ui/separator';

export function SectionGenerationControls({ section }: { section: Section }) {
    const { t } = useLocalization();
    const { updateProject } = useBuilderStore();
    const controls = section.controls;

    if (!controls) {
        return null;
    }

    const instructionPreview = buildInstructionText(controls, section.type);

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

    function handleOutputStyleChange(style: 'heading' | 'paragraph' | 'list' | 'table' | 'code' | 'diagram', checked: boolean) {
        handleControlChange('outputStyle', {
            ...controls.outputStyle,
            [style]: checked
        });
    }

    const presentationTypeLabels: Record<z.infer<typeof PresentationTypeSchema>, string> = {
        'informative': 'Informative: Knowledge sharing',
        'persuasive': 'Persuasive: Influencing opinions',
        'demonstration': 'Demonstration: Step-by-step guide',
        'training': 'Training: Skill development',
        'sales': 'Sales: Business promotion',
        'pitch': 'Pitch: Securing support',
        'motivational': 'Motivational: Inspiring audiences',
        'status-report': 'Status Report: Project updates',
    };

    const renderDocumentControls = () => (
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
            <div className="space-y-3">
                <Label htmlFor={`academicLevel-${section.id}`}>Academic Level</Label>
                <Slider id={`academicLevel-${section.id}`} value={[controls.academicLevel]} onValueChange={(val) => handleControlChange('academicLevel', val[0])} max={100} step={1} />
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Student</span>
                    <span>Graduate</span>
                    <span>Doctorate</span>
                </div>
            </div>
            <div className="space-y-3">
                <Label htmlFor={`styleFocus-${section.id}`}>Style Focus</Label>
                <Slider id={`styleFocus-${section.id}`} value={[controls.styleFocus]} onValueChange={(val) => handleControlChange('styleFocus', val[0])} max={100} step={1} />
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Analysis</span>
                    <span>Balanced</span>
                    <span>Writer</span>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                {renderToneAndLanguageControls('document')}
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
                <div className="space-y-2 pl-6">
                    <Label htmlFor={`programming-language-${section.id}`}>Programming Language</Label>
                    <Input
                        id={`programming-language-${section.id}`}
                        placeholder="e.g., Python, JavaScript"
                        value={controls.programmingLanguage || ''}
                        onChange={(e) => handleControlChange('programmingLanguage', e.target.value)}
                    />
                </div>
            )}

            {controls.outputStyle.diagram && (
                <div className="space-y-2 pl-6">
                    <Label htmlFor={`output-diagram-type-${section.id}`}>Diagram Type</Label>
                    <Select
                        value={controls.outputDiagramType}
                        onValueChange={(val) => handleControlChange('outputDiagramType', val as any)}
                    >
                        <SelectTrigger id={`output-diagram-type-${section.id}`}>
                            <SelectValue placeholder="Select diagram type..." />
                        </SelectTrigger>
                        <SelectContent>
                            {DiagramTypeSchema.options.map((type) => (
                                <SelectItem key={type} value={type}>
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor={`wordCount-${section.id}`}>{t('builder.reportGenerator.tool_word_count_label')}</Label>
                <Input id={`wordCount-${section.id}`} type="number" placeholder={t('reportGenerator.tool_word_count_placeholder')} value={controls.wordCount} onChange={(e) => handleControlChange('wordCount', e.target.value)} />
            </div>
        </>
    );

    const renderPresentationControls = () => (
        <>
            <div className="space-y-2">
                <Label htmlFor={`presentationType-${section.id}`}>Presentation Type</Label>
                <Select value={controls.presentationType} onValueChange={(val) => handleControlChange('presentationType', val as any)}>
                    <SelectTrigger id={`presentationType-${section.id}`}><SelectValue placeholder="Select presentation type..." /></SelectTrigger>
                    <SelectContent>
                        {PresentationTypeSchema.options.map(type => (
                            <SelectItem key={type} value={type}>{presentationTypeLabels[type]}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
                {renderToneAndLanguageControls('presentation')}
            </div>
            <div className="space-y-2">
                <Label>Output Format</Label>
                <div className="flex items-center flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                        <Checkbox id={`output-heading-pres-${section.id}`} checked={controls.outputStyle.heading} onCheckedChange={(checked) => handleOutputStyleChange('heading', !!checked)} />
                        <Label htmlFor={`output-heading-pres-${section.id}`}>Heading</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox id={`output-paragraph-pres-${section.id}`} checked={controls.outputStyle.paragraph} onCheckedChange={(checked) => handleOutputStyleChange('paragraph', !!checked)} />
                        <Label htmlFor={`output-paragraph-pres-${section.id}`}>Paragraph</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox id={`output-list-pres-${section.id}`} checked={controls.outputStyle.list} onCheckedChange={(checked) => handleOutputStyleChange('list', !!checked)} />
                        <Label htmlFor={`output-list-pres-${section.id}`}>List</Label>
                    </div>
                </div>
            </div>
        </>
    );

    const renderToneAndLanguageControls = (type: 'document' | 'presentation') => {
        const toneOptions = type === 'document' ? ReportToneSchema.options : PresentationToneSchema.options;
        const toneValue = type === 'document' ? controls.tone : controls.presentationTone;

        const onToneChange = (val: string) => {
            if (type === 'document') {
                handleControlChange('tone', val as any);
            } else {
                handleControlChange('presentationTone', val as any);
            }
        };

        return (
            <>
                <div className="space-y-2">
                    <Label htmlFor={`tone-${section.id}`}>{t('builder.reportGenerator.tool_tone_label')}</Label>
                    <Select value={toneValue} onValueChange={onToneChange}>
                        <SelectTrigger id={`tone-${section.id}`}><SelectValue placeholder={t('reportGenerator.tool_tone_placeholder')} /></SelectTrigger>
                        <SelectContent>
                            {toneOptions.map(tone => (
                                <SelectItem key={tone} value={tone}>{tone.charAt(0).toUpperCase() + tone.slice(1)}</SelectItem>
                            ))}
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
        )
    };

    const renderControlsForType = () => {
        switch (section.type) {
            case 'document':
                return renderDocumentControls();
            case 'presentation':
                return renderPresentationControls();
            default:
                return <p className="text-muted-foreground text-sm">Select a section type to see available controls.</p>;
        }
    }

    return (
        <div className="space-y-6">
            {renderControlsForType()}
            <Separator />
            <div className="space-y-1">
                <Label className="text-xs font-semibold text-muted-foreground">{t('builder.reportGenerator.tool_instruction_preview')}</Label>
                <p className="text-xs text-muted-foreground italic h-16 overflow-y-auto p-2 border rounded-md bg-muted/20">{instructionPreview || t('builder.reportGenerator.tool_instruction_none')}</p>
            </div>
        </div>
    );
};
