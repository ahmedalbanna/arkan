
'use client';

import Dashboard from '@/components/admin/Dashboard';
import { useLocalization } from '@/context/LocalizationContext';
import { LayoutDashboard } from 'lucide-react';

export default function DashboardPage() {
  const { t } = useLocalization();

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <LayoutDashboard className="w-10 h-10" />
          {t('adminDashboard.pageTitle')}
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          {t('adminDashboard.pageSubtitle')}
        </p>
      </div>
      <Dashboard />
    </div>
  );
}
