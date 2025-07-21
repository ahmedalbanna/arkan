
'use client';

import SettingsManager from '@/components/admin/SettingsManager';
import { useLocalization } from '@/context/LocalizationContext';
import { Settings } from 'lucide-react';

export default function AdminSettingsPage() {
  const { t } = useLocalization();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <Settings className="w-10 h-10" />
          {t('header.adminSettings')}
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          {t('adminSettings.pageSubtitle')}
        </p>
      </div>
      <SettingsManager />
    </div>
  );
}
