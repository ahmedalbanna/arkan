
'use client';

import { PromptTemplateLibrary } from '@/components/admin/PromptTemplateLibrary';
import { Library } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';

export default function ManagePromptTemplatesPage() {
    const { t } = useLocalization();
    return (
        <div className="container mx-auto max-w-7xl px-4 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
                <Library className="w-10 h-10" />
                {t('promptLibrary.pageTitle')}
                </h1>
                <p className="text-lg text-muted-foreground mt-2">
                {t('promptLibrary.pageSubtitle')}
                </p>
            </div>
            <div className="h-[calc(100vh-300px)]">
                <PromptTemplateLibrary />
            </div>
        </div>
    );
}
