
'use client';

import { useState, useEffect } from 'react';
import type { PresentationSlide } from '@/ai/schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, FileDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-components';
import { exportPresentationAsPptx } from '@/lib/pptx-exporter';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EditableContent } from '../EditableContent';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { useLocalization } from '@/context/LocalizationContext';

interface PresentationViewerProps {
  slides: PresentationSlide[];
}

export default function PresentationViewer({ slides }: PresentationViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const updatePresentationSlide = useBuilderStore(s => s.updatePresentationSlide);
  const { t } = useLocalization();

  useEffect(() => {
    // When a new set of slides is passed, reset to the first slide.
    setCurrentSlide(0);
  }, [slides]);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev < slides.length - 1 ? prev + 1 : prev));
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleExport = () => {
    exportPresentationAsPptx(slides, 'modern');
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
        <div className="flex justify-between items-center">
            <EditableContent 
                value={slide.title} 
                onUpdate={(newTitle) => updatePresentationSlide(currentSlide, 'title', newTitle)}
                className="font-headline text-2xl text-primary"
            />
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} title={t('builder.presentationGenerator.exportTooltip')}>
              <FileDown className="mr-2 h-4 w-4" />
              {t('builder.presentationGenerator.exportButton')}
            </Button>
          </div>
        </div>
        <CardDescription>
          {t('builder.presentationGenerator.slideLabel', { current: currentSlide + 1, total: slides.length })}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto">
        <div className="md:col-span-2 prose dark:prose-invert max-w-none">
          <h3 className="font-semibold mb-2">{t('builder.presentationGenerator.content')}</h3>
          <ul className="list-disc pl-5 space-y-2 text-lg">
            {slide.content.map((item, index) => (
              <li key={index}>
                <EditableContent 
                    value={item}
                    onUpdate={(newValue) => updatePresentationSlide(currentSlide, 'content', newValue, index)}
                    multiline
                />
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
              aria-label={t('builder.presentationGenerator.goToSlide', { slideNumber: index + 1 })}
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
