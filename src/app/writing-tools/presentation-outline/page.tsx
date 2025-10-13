
'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { PresentationOutlineTool } from '@/components/writing-tools/PresentationOutlineTool';
import { useLocalization } from '@/context/LocalizationContext';
import { Presentation } from 'lucide-react';

export default function PresentationOutlinePage() {
  const { t } = useLocalization();
  return (
    <div className="relative container mx-auto max-w-4xl px-4 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
        <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-primary/10 blur-2xl animate-float" />
        <div className="absolute -bottom-10 -right-10 h-44 w-44 rounded-full bg-blue-500/10 blur-2xl animate-float" />
        <div className="absolute top-1/3 right-1/3 h-36 w-36 rounded-full bg-purple-500/10 blur-2xl animate-float" />
      </div>
      <AnimatedContainer animation="fade-in-up" delay={100}>
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
            <div className="p-2 rounded-lg shadow-soft bg-gradient-to-br from-primary to-primary-600 text-white">
              <Presentation className="w-10 h-10" />
            </div>
            {t('writingTools.presentationOutline.pageTitle')}
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            {t('writingTools.presentationOutline.pageSubtitle')}
          </p>
        </div>
      </AnimatedContainer>
      <AnimatedContainer animation="fade-in-up" delay={200}>
        <PresentationOutlineTool />
      </AnimatedContainer>
    </div>
  );
}
