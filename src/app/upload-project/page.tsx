
'use client';

import { UploadManager } from '@/components/UploadManager';
import { useLocalization } from '@/context/LocalizationContext';
import { Upload } from 'lucide-react';

export default function UploadProjectPage() {
  const { t } = useLocalization();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <Upload className="w-10 h-10" />
          Upload Context
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Upload files, paste text, or provide URLs to use as context for your generation tasks.
        </p>
      </div>
      <UploadManager />
    </div>
  );
}
