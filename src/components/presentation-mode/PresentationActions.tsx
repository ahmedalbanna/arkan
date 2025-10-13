
'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Button } from '@/components/ui/button';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore, useExport, useGenerationUIStore } from '@/hooks';
import { Download, Languages, Loader2 } from 'lucide-react';

interface PresentationActionsProps {
  isGenerating: boolean;
  onTranslateAll: (targetLang: 'en' | 'ar') => void;
  isTranslating: boolean;
}

export const PresentationActions = ({ isGenerating, onTranslateAll, isTranslating }: PresentationActionsProps) => {
  const { t, locale } = useLocalization();
  const { project } = useBuilderStore();
  const { activePresentationId } = useGenerationUIStore();
  const { exportPresentationPptx, isExporting } = useExport();

  const slides = project?.presentation?.history.find(p => p.id === activePresentationId)?.slides;
  const isBusy = isGenerating || isTranslating || isExporting;

  const handleTranslate = () => {
    const targetLang = locale === 'en' ? 'ar' : 'en';
    onTranslateAll(targetLang);
  };

  const handleExport = () => {
    if (project && slides) {
      exportPresentationPptx(project, activePresentationId);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <AnimatedContainer animation="fade-in-up" delay={100}>
        <Button
          variant="outline"
          size="sm"
          onClick={handleTranslate}
          disabled={isBusy || !slides || slides.length === 0}
          className="hover:shadow-soft"
        >
          {isTranslating ? (
            <Loader2 className="me-2 h-4 w-4 animate-spin" />
          ) : (
            <Languages className="me-2 h-4 w-4" />
          )}
          {locale === 'en' ? t('builder.presentationGenerator.translateButton.ar') : t('builder.presentationGenerator.translateButton.en')}
        </Button>
      </AnimatedContainer>

      <AnimatedContainer animation="fade-in-up" delay={200}>
        <Button
          variant="outline"
          size="sm"
          disabled={isBusy || !slides}
          onClick={handleExport}
          className="hover:shadow-soft"
        >
          {isExporting ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Download className="me-2 h-4 w-4" />}
          {t('builder.presentationGenerator.exportButton')}
        </Button>
      </AnimatedContainer>
    </div>
  );
};
