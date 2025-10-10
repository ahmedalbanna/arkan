'use client';

import { SectionName as SectionNameType } from '@/ai/schemas';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useLocalization } from '@/context/LocalizationContext';
import { useGenerationUIStore } from '@/hooks';

export const SectionGenerationControls = ({ sectionKey }: { sectionKey: SectionNameType }) => {
    const { t } = useLocalization();
    const { controlState, handleControlChange } = useGenerationUIStore();
    const controls = controlState[sectionKey];

    if (!controls) {
        return null;
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
            <div className="space-y-2">
                <Label htmlFor={`tone-${sectionKey}`}>{t('builder.reportGenerator.tool_tone_label')}</Label>
                <Select value={controls.tone} onValueChange={(val) => handleControlChange(sectionKey, 'tone', val)}>
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
                <Label htmlFor={`wordCount-${sectionKey}`}>{t('builder.reportGenerator.tool_word_count_label')}</Label>
                <Input id={`wordCount-${sectionKey}`} type="number" placeholder={t('reportGenerator.tool_word_count_placeholder')} value={controls.wordCount} onChange={(e) => handleControlChange(sectionKey, 'wordCount', e.target.value)} />
            </div>
        </div>
    );
};
