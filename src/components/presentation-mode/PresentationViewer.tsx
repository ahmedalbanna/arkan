
'use client';

import { useState, useEffect } from 'react';
import type { PresentationHistoryEntry } from '@/ai/schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-styles';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLocalization } from '@/context/LocalizationContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PresentationViewerProps {
  activePresentation: PresentationHistoryEntry;
}

export default function PresentationViewer({ activePresentation }: PresentationViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { t } = useLocalization();

  useEffect(() => {
    // When a new presentation is passed, reset to the first slide.
    setCurrentSlide(0);
  }, [activePresentation?.id]);

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

  const { slides } = activePresentation;
  const slide = slides[currentSlide];

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

  const handleNext = () => {
    setCurrentSlide((prev) => (prev < slides.length - 1 ? prev + 1 : prev));
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev));
  };


  return (
    <div className="flex flex-col h-full">
        <CardHeader className="pb-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
                <h2 className="font-headline text-2xl text-primary">{activePresentation.name}</h2>
            </div>
            <CardDescription>
            {t('builder.presentationGenerator.slideLabel', {current: currentSlide + 1, total: slides.length})}
            </CardDescription>
        </CardHeader>

        <div className="flex-grow flex flex-col p-4 bg-muted/40 overflow-y-auto">
             {/* Slide View */}
            <div className="w-full aspect-video bg-background shadow-md rounded-lg p-8 flex flex-col">
                <h3 className="text-3xl font-bold mb-4 line-clamp-2">
                    {slide.title}
                </h3>
                <div className="flex-grow text-lg">
                    <ul className="list-disc pl-6 space-y-3">
                        {slide.content.map((item, index) => (
                        <li key={index}>{item}</li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Speaker Notes */}
            <div className="mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">{t('builder.presentationGenerator.speakerNotes')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="prose prose-sm max-w-none text-muted-foreground">
                            <ReactMarkdown components={markdownComponents}>{slide.speakerNotes}</ReactMarkdown>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>

        <div className="flex justify-between items-center p-2 border-t bg-background">
            <Button onClick={handlePrev} disabled={currentSlide === 0} variant="ghost">
            <ChevronLeft className="me-2 h-4 w-4" /> {t('builder.presentationGenerator.prev')}
            </Button>
            <div className="flex space-x-1">
            {slides.map((_, index) => (
                <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 w-2 rounded-full ${currentSlide === index ? 'bg-primary' : 'bg-muted hover:bg-muted-foreground'}`}
                aria-label={t('builder.presentationGenerator.goToSlide', {slideNumber: index + 1})}
                />
            ))}
            </div>
            <Button onClick={handleNext} disabled={currentSlide === slides.length - 1} variant="ghost">
            {t('builder.presentationGenerator.next')} <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
        </div>
    </div>
  );
}
