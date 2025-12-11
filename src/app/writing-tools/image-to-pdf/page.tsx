'use client';

import { ImageToPdfTool } from '@/components/writing-tools/ImageToPdfTool';
import { useLocalization } from '@/context/LocalizationContext';
import { Images } from 'lucide-react';

export default function ImageToPdfPage() {
  const { t } = useLocalization();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <Images className="w-10 h-10" />
          {t('writingTools.imageToPdf.pageTitle')}
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          {t('writingTools.imageToPdf.pageSubtitle')}
        </p>
      </div>
      <ImageToPdfTool />
    </div>
  );
}
