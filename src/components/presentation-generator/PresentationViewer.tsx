

'use client';

import { useState, useEffect } from 'react';
import type { PresentationSlide, PresentationHistoryEntry } from '@/ai/schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, FileDown, Languages, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-components';
import { exportPresentationAsPptx } from '@/lib/pptx-exporter';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePresentationStore } from '@/hooks/usePresentationStore';
import { useLocalization } from '@/context/LocalizationContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

interface PresentationViewerProps {
  activePresentation: PresentationHistoryEntry;
}

async function translatePresentationApi(variables: { presentation: PresentationHistoryEntry, targetLang: string, token: string }): Promise<PresentationHistoryEntry> {
    const response = await fetch('/api/translate-presentation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${variables.token}`
        },
        body: JSON.stringify({ presentation: variables.presentation, targetLang: variables.targetLang })
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to translate presentation');
    }
    return response.json();
}

export default function PresentationViewer({ activePresentation }: PresentationViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { updatePresentationSlide, replacePresentationInHistory } = usePresentationStore();
  const { t, locale } = useLocalization();
  const { firebaseUser } = useAuth();
  const queryClient = useQueryClient();

  // Add a guard clause to handle cases where activePresentation might be undefined.
  if (!activePresentation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('builder.presentationGenerator.viewerTitle')}</CardTitle>
          <CardDescription>{t('builder.presentationGenerator.viewerDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">{t('builder.presentationGenerator.historyEmpty')}</p>
        </CardContent>
      </Card>
    );
  }

  const slides = activePresentation.slides;

  useEffect(() => {
    // When a new presentation is passed, reset to the first slide.
    setCurrentSlide(0);
  }, [activePresentation.id]);

  const translateMutation = useMutation({
    mutationFn: translatePresentationApi,
    onSuccess: (data) => {
        replacePresentationInHistory(data);
        queryClient.invalidateQueries({ queryKey: ['user'] });
        toast({
            title: t('builder.presentationGenerator.toasts.translateAllSuccess'),
            description: t('builder.presentationGenerator.toasts.translateAllSuccessDesc'),
        });
    },
    onError: (error: Error) => {
         toast({
            title: t('builder.presentationGenerator.toasts.translateAllFailed'),
            description: error.message || t('builder.presentationGenerator.toasts.translateAllFailedDesc'),
            variant: 'destructive'
        });
    }
  });

  const handleNext = () => {
    setCurrentSlide((prev) => (prev < slides.length - 1 ? prev + 1 : prev));
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleExport = () => {
    exportPresentationAsPptx(slides, 'modern');
  };

  const handleTranslate = async () => {
    if (!firebaseUser) return;
    const token = await firebaseUser.getIdToken();
    const targetLang = locale === 'en' ? 'Arabic' : 'English';
    translateMutation.mutate({ presentation: activePresentation, targetLang, token });
  };

  const slide = slides?.[currentSlide];

  if (!slide) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('builder.presentationGenerator.viewerTitle')}</CardTitle>
          <CardDescription>{t('builder.presentationGenerator.viewerDesc')}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-between items-center flex-wrap gap-2">
            <h2 className="font-headline text-2xl text-primary">{activePresentation.name}</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" type="button" size="sm" onClick={handleTranslate} disabled={translateMutation.isPending}>
                {translateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Languages className="mr-2 h-4 w-4" />}
                {locale === 'en' ? 'Translate to Arabic' : 'Translate to English'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} title={t('builder.presentationGenerator.exportTooltip')}>
              <FileDown className="mr-2 h-4 w-4" />
              {t('builder.presentationGenerator.exportButton')}
            </Button>
          </div>
        </div>
        <CardDescription>
          {t('builder.presentationGenerator.slideLabel').replace('{current}', (currentSlide + 1).toString()).replace('{total}', slides.length.toString())}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto">
        <div className="md:col-span-2 prose dark:prose-invert max-w-none">
          <h3 className="font-semibold mb-2 text-2xl">
             {slide.title}
          </h3>
          <ul className="list-disc pl-5 space-y-2 text-lg">
            {slide.content.map((item, index) => (
              <li key={index}>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-muted p-4 rounded-lg flex flex-col min-h-0">
            <h3 className="font-semibold mb-2 shrink-0">{t('builder.presentationGenerator.speakerNotes')}</h3>
            <ScrollArea className="flex-grow">
                 <div className="prose prose-sm max-w-none text-muted-foreground pr-4">
                    <ReactMarkdown components={markdownComponents}>{slide.speakerNotes}</ReactMarkdown>
                </div>
            </ScrollArea>
        </div>
      </CardContent>
      <div className="flex justify-between items-center p-4 border-t">
        <Button onClick={handlePrev} disabled={currentSlide === 0}>
          <ChevronLeft className="mr-2 h-4 w-4" /> {t('builder.presentationGenerator.prev')}
        </Button>
        <div className="flex space-x-1">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 w-2 rounded-full ${currentSlide === index ? 'bg-primary' : 'bg-muted hover:bg-muted-foreground'}`}
              aria-label={t('builder.presentationGenerator.goToSlide').replace('{slideNumber}', (index + 1).toString())}
            />
          ))}
        </div>
        <Button onClick={handleNext} disabled={currentSlide === slides.length - 1}>
          {t('builder.presentationGenerator.next')} <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
