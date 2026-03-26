import GenerationLogViewer from "@/components/admin/GenerationLogViewer";
import { History } from "lucide-react";
import { getTranslator } from '@/infrastructure/i18n/i18n';

export default async function ManageGenerationsPage() {
  const t = await getTranslator();

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <History className="w-10 h-10" />
          {t('manageGenerations.pageTitle')}
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          {t('manageGenerations.pageSubtitle')}
        </p>
      </div>
      <GenerationLogViewer />
    </div>
  );
}
