
'use client';

import { Button } from '@/components/ui/button';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore, usePresentationStore } from '@/hooks';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Loader2, Languages, Download, FileText } from 'lucide-react';
import { useExport } from '@/hooks';
import { usePptxStyles } from '@/hooks/use-pptx-styles';
import { useState } from 'react';
import { PptxTemplateKey } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface PresentationActionsProps {
  isGenerating: boolean;
  onTranslateAll: (targetLang: 'en' | 'ar') => void;
  isTranslating: boolean;
}

const PPTX_TEMPLATE_KEY = 'arkan-pptx-template';

export const PresentationActions = ({ isGenerating, onTranslateAll, isTranslating }: PresentationActionsProps) => {
  const { t, locale } = useLocalization();
  const { project } = useBuilderStore();
  const { activePresentationId } = usePresentationStore();
  const { templates: pptxTemplates, isLoaded: pptxLoaded } = usePptxStyles();
  const { exportPresentationPptx, isExporting } = useExport();
  const [selectedPptxTemplate, setSelectedPptxTemplate] = useState<PptxTemplateKey>('modern');

  const slides = project?.presentation?.history.find(p => p.id === activePresentationId)?.slides;
  const isBusy = isGenerating || isTranslating || isExporting;

  const handleTranslate = () => {
    const targetLang = locale === 'en' ? 'ar' : 'en';
    onTranslateAll(targetLang);
  };

  const handleExport = (format: 'pptx') => {
    if (project && slides) {
      if (format === 'pptx') {
        exportPresentationPptx(project, activePresentationId, selectedPptxTemplate);
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleTranslate}
        disabled={isBusy || !slides || slides.length === 0}
      >
        {isTranslating ? (
          <Loader2 className="me-2 h-4 w-4 animate-spin" />
        ) : (
          <Languages className="me-2 h-4 w-4" />
        )}
        {locale === 'en' ? t('builder.presentationGenerator.translateButton.ar') : t('builder.presentationGenerator.translateButton.en')}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={isBusy || !slides}>
                <Download className="me-2 h-4 w-4" />
                {t('builder.presentationGenerator.exportButton')}
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
             <div className="px-2 py-1.5">
                <Label htmlFor="pptx-template-select">{t('builder.presentationGenerator.exportStyleLabel')}</Label>
                 {pptxLoaded ? (
                <Select value={selectedPptxTemplate} onValueChange={(v) => setSelectedPptxTemplate(v as PptxTemplateKey)} disabled={isBusy}>
                    <SelectTrigger id="pptx-template-select" className="mt-1 h-8">
                        <SelectValue placeholder={t('builder.presentationGenerator.exportStylePlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                        {pptxTemplates && Object.entries(pptxTemplates).map(([key, template]) => (
                            <SelectItem key={key} value={key}>{t((template as any).name)}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                ) : <Loader2 className="h-5 w-5 animate-spin" />}
             </div>
             <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleExport('pptx')} disabled={isBusy || !slides}>
                <FileText className="me-2 h-4 w-4" />
                <span>Export as PPTX</span>
            </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

    </div>
  );
};
