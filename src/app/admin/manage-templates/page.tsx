'use client';

import { TemplateManagementConsole } from '@/modules/templates/adapters/components/admin/templates/TemplateManagementConsole';
import { useLocalization } from '@/context/LocalizationContext';
import { Palette } from 'lucide-react';

export default function ManageTemplatesPage() {
  const { t } = useLocalization();

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <Palette className="w-10 h-10" />
          {t('manageTemplates.pageTitle')}
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          {t('manageTemplates.pageSubtitle')}
        </p>
      </div>

      <TemplateManagementConsole />
    </div>
  );
}
