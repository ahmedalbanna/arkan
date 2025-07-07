'use client';

import Summarizer from "@/components/Summarizer";
import { useLocalization } from "@/context/LocalizationContext";

export default function SummarizePage() {
  const { t } = useLocalization();
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">
          {t('summarizer.pageTitle')}
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          {t('summarizer.pageSubtitle')}
        </p>
      </div>
      <Summarizer />
    </div>
  );
}
