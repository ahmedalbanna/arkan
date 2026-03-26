import Dashboard from '@/modules/admin/adapters/components/dashboard/Dashboard';
import { LayoutDashboard } from 'lucide-react';
import { getTranslator } from '@/infrastructure/i18n/i18n';

// This page is now a Server Component by default.
export default async function DashboardPage() {
  const t = await getTranslator();

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
      {/* The Dashboard component remains a Client Component, but the page itself is server-rendered. */}
      <Dashboard />
    </div>
  );
}
