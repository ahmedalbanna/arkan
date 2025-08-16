'use client';

import GenerationTemplateManager from '@/components/admin/GenerationTemplateManager';
import { SlidersHorizontal } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';

export default function ManageGenerationTemplatesPage() {
  const { t } = useLocalization();

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <SlidersHorizontal className="w-10 h-10" />
          {t('manageTemplates.pageTitle')}
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          {t('manageTemplates.pageSubtitle')}
        </p>
      </div>
      <GenerationTemplateManager />
    </div>
  );
}
