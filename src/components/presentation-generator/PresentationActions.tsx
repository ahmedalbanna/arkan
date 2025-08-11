
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Languages } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';
import { usePresentationStore } from '@/hooks/usePresentationStore';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

interface PresentationActionsProps {
  isGenerating: boolean;
  onTranslateAll: (targetLang: 'en' | 'ar') => void;
  isTranslating: boolean;
}

export const PresentationActions = ({ isGenerating, onTranslateAll, isTranslating }: PresentationActionsProps) => {
  const { t, locale } = useLocalization();
  const { presentation, activePresentationId } = usePresentationStore();
  const slides = presentation?.history.find(p => p.id === activePresentationId)?.slides;

  const isBusy = isGenerating || isTranslating;

  const handleTranslate = () => {
    const targetLang = locale === 'en' ? 'ar' : 'en';
    onTranslateAll(targetLang);
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
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Languages className="mr-2 h-4 w-4" />
        )}
        {locale === 'en' ? 'Translate to Arabic' : 'Translate to English'}
      </Button>
    </div>
  );
};
