import FeatureManager from '@/modules/admin/adapters/components/FeatureManager';
import { SlidersHorizontal } from 'lucide-react';
import { getTranslator } from '@/lib/utils/i18n';

export default async function ManageFeaturesPage() {
  const t = await getTranslator();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <SlidersHorizontal className="w-10 h-10" />
          {t('manageFeatures.pageTitle')}
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          {t('manageFeatures.pageSubtitle')}
        </p>
      </div>
      <FeatureManager />
    </div>
  );
}
