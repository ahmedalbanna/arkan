// code explantion in docs/hooks/use-translation-view-logic.md

'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { useReportStore } from '@/hooks';
import { useTranslate } from '@/hooks';
import { useToast } from '@/hooks';
import { SectionName } from '@/ai/schemas';

export const useTranslationViewLogic = (sectionKey: SectionName, originalContent: string) => {
    const { t, locale } = useLocalization();
    const { translatedSections, setTranslatedSection } = useReportStore();
    const translateMutation = useTranslate();
    const { toast } = useToast();
    const translatedContent = translatedSections[sectionKey];

    const handleTranslate = async () => {
        const targetLang = locale === 'en' ? 'ar' : 'en';
        translateMutation.mutate({ text: originalContent, targetLang }, {
            onSuccess: (data) => {
                setTranslatedSection(sectionKey, data.translatedText);
                toast({ title: t('builder.Section.toasts.translateSuccess') });
            },
            onError: (error: Error) => {
                const isCreditError = error.message.toLowerCase().includes('credit');
                toast({
                    title: t('builder.Section.toasts.translateFailed'),
                    description: isCreditError ? t('builder.toasts.insufficientCredits') : error.message,
                    variant: 'destructive'
                });
            }
        });
    }

    return {
        t,
        locale,
        translatedContent,
        translateMutation,
        handleTranslate,
    };
};
