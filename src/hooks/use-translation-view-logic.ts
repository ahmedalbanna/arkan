
// code explantion in docs/hooks/use-translation-view-logic.md

'use client';

import { SectionName } from '@/ai/schemas';
import { useLocalization } from '@/context/LocalizationContext';
import { useToast, useTranslate } from '@/hooks';
import { useBuilderStore } from './useBuilderStore';

export const useTranslationViewLogic = (sectionKey: SectionName, originalContent: string) => {
    const { t, locale } = useLocalization();
    const { project, updateProject } = useBuilderStore();
    const translateMutation = useTranslate();
    const { toast } = useToast();
    const translatedContent = project?.translatedSections?.[sectionKey];

    const handleTranslate = async () => {
        const targetLang = locale === 'en' ? 'ar' : 'en';
        translateMutation.mutate({ text: originalContent, targetLang }, {
            onSuccess: (data) => {
                updateProject(p => {
                    p.translatedSections = {
                        ...(p.translatedSections || {}),
                        [sectionKey]: data.translatedText
                    };
                });
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
