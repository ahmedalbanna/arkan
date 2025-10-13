'use client';

import { SectionName as SectionNameType } from '@/ai/schemas';
import { AnimatedContainer } from '@/components/ui/animation';
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
        <AnimatedContainer animation="fade-in-up" delay={200}>
            <div className="space-y-6">
                <AnimatedContainer animation="fade-in-up" delay={300}>
                    <div className="space-y-3">
                        <Label htmlFor={`formality-${sectionKey}`} className="font-headline">{t('builder.reportGenerator.tool_formality_label')}</Label>
                        <Slider
                            id={`formality-${sectionKey}`}
                            value={[controls.formality]}
                            onValueChange={(val) => handleControlChange(sectionKey, 'formality', val[0])}
                            max={100}
                            step={1}
                            className="hover:shadow-soft transition-all duration-200"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{t('builder.reportGenerator.tool_formality_informal')}</span>
                            <span>{t('builder.reportGenerator.tool_formality_balanced')}</span>
                            <span>{t('builder.reportGenerator.tool_formality_formal')}</span>
                        </div>
                    </div>
                </AnimatedContainer>
                <AnimatedContainer animation="fade-in-up" delay={400}>
                    <div className="space-y-2">
                        <Label htmlFor={`tone-${sectionKey}`} className="font-headline">{t('builder.reportGenerator.tool_tone_label')}</Label>
                        <Select value={controls.tone} onValueChange={(val) => handleControlChange(sectionKey, 'tone', val)}>
                            <SelectTrigger id={`tone-${sectionKey}`} className="hover:shadow-soft transition-all duration-200">
                                <SelectValue placeholder={t('reportGenerator.tool_tone_placeholder')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="professional">{t('builder.reportGenerator.tool_tone_professional')}</SelectItem>
                                <SelectItem value="academic">{t('builder.reportGenerator.tool_tone_academic')}</SelectItem>
                                <SelectItem value="casual">{t('builder.reportGenerator.tool_tone_casual')}</SelectItem>
                                <SelectItem value="persuasive">{t('builder.reportGenerator.tool_tone_persuasive')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </AnimatedContainer>
                <AnimatedContainer animation="fade-in-up" delay={500}>
                    <div className="space-y-2">
                        <Label htmlFor={`wordCount-${sectionKey}`} className="font-headline">{t('builder.reportGenerator.tool_word_count_label')}</Label>
                        <Input
                            id={`wordCount-${sectionKey}`}
                            type="number"
                            placeholder={t('reportGenerator.tool_word_count_placeholder')}
                            value={controls.wordCount}
                            onChange={(e) => handleControlChange(sectionKey, 'wordCount', e.target.value)}
                            className="hover:shadow-soft transition-all duration-200"
                        />
                    </div>
                </AnimatedContainer>
            </div>
        </AnimatedContainer>
    );
};
