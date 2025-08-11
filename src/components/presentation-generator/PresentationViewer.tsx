

'use client';

import { useState, useEffect } from 'react';
import type { PresentationHistoryEntry } from '@/ai/schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, FileDown, Languages, Loader2, Presentation } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-components';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePresentationStore } from '@/hooks/usePresentationStore';
import { useLocalization } from '@/context/LocalizationContext';
import { useExport } from '@/hooks/use-export';
import { PptxTemplateKey } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PresentationActions } from './PresentationActions';

interface PresentationViewerProps {
  activePresentation: PresentationHistoryEntry;
  onTranslateAll: (targetLang: 'en' | 'ar') => void;
  isTranslating: boolean;
}

export default function PresentationViewer({ activePresentation, onTranslateAll, isTranslating }: PresentationViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { t, locale } = useLocalization();
  

  // Add a guard clause to handle cases where activePresentation might be undefined.
  if (!activePresentation || !activePresentation.slides || activePresentation.slides.length === 0) {
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
  

  const handleNext = () => {
    setCurrentSlide((prev) => (prev < slides.length - 1 ? prev + 1 : prev));
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleTranslate = () => {
    const targetLang = locale === 'en' ? 'ar' : 'en';
    onTranslateAll(targetLang);
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
            <PresentationActions isGenerating={isTranslating} />
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
