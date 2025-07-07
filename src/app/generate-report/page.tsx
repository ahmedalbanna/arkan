'use client';

import ReportGenerator from "@/components/ReportGenerator";
import { useLocalization } from "@/context/LocalizationContext";

export default function GenerateReportPage() {
  const { t } = useLocalization();
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">
          {t('reportGenerator.pageTitle')}
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          {t('reportGenerator.pageSubtitle')}
        </p>
      </div>
      <ReportGenerator />
    </div>
  );
}
