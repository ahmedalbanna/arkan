'use client';

import { useState } from 'react';
import { useLocalization } from '@/context/LocalizationContext';
import { useTranslate } from '@/hooks/use-translation';
import { toast } from '@/hooks/use-toast';
import type { SectionName } from '@/ai/schemas';
import { useReportStore } from '@/hooks/useReportStore';

export const useReportModeGenerator = () => {
    const { t, locale } = useLocalization();
    const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
    const {
        sections,
        setSection,
        setAllTranslatedSections
    } = useReportStore();
    const translateMutation = useTranslate();
    const [isTranslatingAll, setIsTranslatingAll] = useState(false);

    const handleSectionUpdate = (key: SectionName, value: string) => {
        setSection(key, value);
    };

    const handleTranslateAll = async (targetLang: 'en' | 'ar') => {
        setIsTranslatingAll(true);
        toast({
            title: t('builder.reportGenerator.toasts.translateAllStarted'),
            description: t('builder.reportGenerator.toasts.translateAllStartedDesc'),
        });

        const sectionKeys = Object.keys(sections).filter(key => sections[key as SectionName]) as SectionName[];

        const translationPromises = sectionKeys.map(key => {
            const content = sections[key]!;
            return translateMutation.mutateAsync({ text: content, targetLang })
                .then(result => ({ key, content: result.translatedText }))
                .catch(error => ({ key, error }));
        });

        const results = await Promise.all(translationPromises);

        const translatedMap: { [key in SectionName]?: string } = {};
        results.forEach(result => {
            if ('content' in result) {
                translatedMap[result.key as SectionName] = result.content;
            } else {
                console.error(`Failed to translate section ${result.key}:`, result.error);
            }
        });
        setAllTranslatedSections(translatedMap);

        setIsTranslatingAll(false);
        toast({
            title: t('builder.reportGenerator.toasts.translateAllSuccess'),
            description: t('builder.reportGenerator.toasts.translateAllSuccessDesc'),
        });
    };

    return {
        t,
        locale,
        isPanelCollapsed,
        setIsPanelCollapsed,
        handleSectionUpdate,
        handleTranslateAll,
        isTranslatingAll,
    };
};
