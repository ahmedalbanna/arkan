'use client';

import { SectionName as SectionNameType } from '@/ai/schemas';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocalization } from '@/context/LocalizationContext';
import { useGenerationUIStore } from '@/hooks';
import { Hash, Palette, Sliders, Volume2 } from 'lucide-react';

interface GenerationControlsSummaryProps {
    sectionKey: SectionNameType;
}

export function SectionGenerationControlsSummary({ sectionKey }: GenerationControlsSummaryProps) {
    const { t } = useLocalization();
    const { controlState } = useGenerationUIStore();
    const controls = controlState[sectionKey];

    if (!controls) {
        return (
            <Card className="border-dashed">
                <CardContent className="p-4">
                    <div className="text-center text-sm text-muted-foreground">
                        {t('builder.reportGenerator.noGenerationControls')}
                    </div>
                </CardContent>
            </Card>
        );
    }

    const getFormalityLabel = (value: number) => {
        if (value <= 33) return t('builder.reportGenerator.tool_formality_informal');
        if (value <= 66) return t('builder.reportGenerator.tool_formality_balanced');
        return t('builder.reportGenerator.tool_formality_formal');
    };

    const getFormalityColor = (value: number) => {
        if (value <= 33) return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200';
        if (value <= 66) return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200';
        return 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200';
    };

    const getToneColor = (tone: string) => {
        switch (tone) {
            case 'professional': return 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200';
            case 'academic': return 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200';
            case 'casual': return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200';
            case 'persuasive': return 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200';
            default: return 'bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200';
        }
    };

    const controlItems = [];

    // إضافة الرسمية
    controlItems.push({
        type: 'formality',
        icon: Palette,
        label: getFormalityLabel(controls.formality),
        value: `${controls.formality}%`,
        color: getFormalityColor(controls.formality)
    });

    // إضافة النبرة
    controlItems.push({
        type: 'tone',
        icon: Volume2,
        label: t(`builder.reportGenerator.tool_tone_${controls.tone}`),
        value: controls.tone,
        color: getToneColor(controls.tone)
    });

    // إضافة عدد الكلمات (إذا كان محدد)
    if (controls.wordCount && controls.wordCount.trim() !== '') {
        controlItems.push({
            type: 'wordCount',
            icon: Hash,
            label: t('builder.reportGenerator.tool_word_count_label'),
            value: `${controls.wordCount} ${t('builder.reportGenerator.words')}`,
            color: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200'
        });
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Sliders className="h-4 w-4" />
                    {t('builder.reportGenerator.generationSettings')}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="space-y-3">
                    {controlItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">{item.label}</span>
                                </div>
                                <Badge
                                    variant="secondary"
                                    className={`${item.color} border-0`}
                                >
                                    {item.value}
                                </Badge>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
