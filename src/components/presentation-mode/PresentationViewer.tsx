

'use client';

import type { PresentationHistoryEntry } from '@/ai/schemas';
import { AnimatedContainer } from '@/components/ui/animation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocalization } from '@/context/LocalizationContext';
import { markdownComponents } from '@/lib/markdown-styles';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { PresentationActions } from './PresentationActions';

interface PresentationViewerProps {
  activePresentation: PresentationHistoryEntry;
  isGenerating: boolean;
  isTranslating: boolean;
  onTranslateAll: (targetLang: 'en' | 'ar') => void;
}

export default function PresentationViewer({ activePresentation, isGenerating, isTranslating, onTranslateAll }: PresentationViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { t } = useLocalization();

  useEffect(() => {
    // When a new presentation is passed, reset to the first slide.
    setCurrentSlide(0);
  }, [activePresentation?.id]);

  if (!activePresentation || !activePresentation.slides || activePresentation.slides.length === 0) {
    return (
      <AnimatedContainer animation="fade-in-up" delay={100}>
        <Card variant="glass" className="backdrop-blur-md shadow-soft hover:shadow-glow">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
            <CardTitle className="font-headline">{t('builder.presentationGenerator.viewerTitle')}</CardTitle>
            <CardDescription>{t('builder.presentationGenerator.viewerDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-full">
              <AnimatedContainer animation="fade-in-up" delay={200}>
                <p className="text-muted-foreground text-center py-8">{t('builder.presentationGenerator.historyEmpty')}</p>
              </AnimatedContainer>
            </div>
          </CardContent>
        </Card>
      </AnimatedContainer>
    );
  }

  const { slides } = activePresentation;
  const slide = slides[currentSlide];

  if (!slide) {
    return (
      <AnimatedContainer animation="fade-in-up" delay={100}>
        <Card variant="glass" className="backdrop-blur-md shadow-soft hover:shadow-glow">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
            <CardTitle className="font-headline">{t('builder.presentationGenerator.viewerTitle')}</CardTitle>
            <CardDescription>{t('builder.presentationGenerator.viewerDesc')}</CardDescription>
          </CardHeader>
        </Card>
      </AnimatedContainer>
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
      <AnimatedContainer animation="fade-in-up" delay={100}>
        <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-blue-500/5 backdrop-blur-sm">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <h2 className="font-headline text-2xl text-primary">{activePresentation.name}</h2>
            <PresentationActions
              isGenerating={isGenerating}
              isTranslating={isTranslating}
              onTranslateAll={onTranslateAll}
            />
          </div>
          <CardDescription>
            {t('builder.presentationGenerator.slideLabel', { current: currentSlide + 1, total: slides.length })}
          </CardDescription>
        </CardHeader>
      </AnimatedContainer>

      <div className="flex-grow flex flex-col p-4 bg-gradient-to-br from-slate-200 via-slate-100 to-primary/5 dark:from-slate-900/50 dark:via-slate-800/30 dark:to-primary/5 overflow-y-auto">
        {/* Slide View */}
        <AnimatedContainer animation="fade-in-up" delay={200}>
          <div className="w-full aspect-video bg-gradient-to-br from-background via-background to-primary/5 backdrop-blur-sm shadow-soft hover:shadow-glow rounded-lg p-8 flex flex-col border">
            <h3 className="text-3xl font-bold mb-4 line-clamp-2 font-headline">
              {slide.title}
            </h3>
            <div className="flex-grow text-lg">
              <ul className="list-disc pl-6 space-y-3">
                {slide.content.map((item, index) => (
                  <AnimatedContainer key={index} animation="fade-in-up" delay={300 + index * 100}>
                    <li>{item}</li>
                  </AnimatedContainer>
                ))}
              </ul>
            </div>
          </div>
        </AnimatedContainer>

        {/* Speaker Notes */}
        <AnimatedContainer animation="fade-in-up" delay={400}>
          <div className="mt-4">
            <Card variant="glass" className="backdrop-blur-md shadow-soft hover:shadow-glow">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
                <CardTitle className="text-base font-headline">{t('builder.presentationGenerator.speakerNotes')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none text-muted-foreground bg-gradient-to-r from-background/50 to-primary/5 backdrop-blur-sm rounded-lg p-4 shadow-soft">
                  <ReactMarkdown components={markdownComponents}>{slide.speakerNotes}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          </div>
        </AnimatedContainer>
      </div>

      <AnimatedContainer animation="fade-in-up" delay={500}>
        <div className="flex justify-between items-center p-2 border-t bg-gradient-to-r from-background/90 to-primary/5 backdrop-blur-sm">
          <Button onClick={handlePrev} disabled={currentSlide === 0} variant="ghost" className="hover:shadow-soft">
            <ChevronLeft className="me-2 h-4 w-4" /> {t('builder.presentationGenerator.prev')}
          </Button>
          <div className="flex space-x-1">
            {slides.map((_, index) => (
              <AnimatedContainer key={index} animation="fade-in-up" delay={600 + index * 50}>
                <button
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 w-2 rounded-full transition-all duration-200 ${currentSlide === index ? 'bg-gradient-to-r from-primary to-primary-600 shadow-soft' : 'bg-muted hover:bg-muted-foreground hover:shadow-soft'}`}
                  aria-label={t('builder.presentationGenerator.goToSlide', { slideNumber: index + 1 })}
                />
              </AnimatedContainer>
            ))}
          </div>
          <Button onClick={handleNext} disabled={currentSlide === slides.length - 1} variant="ghost" className="hover:shadow-soft">
            {t('builder.presentationGenerator.next')} <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </AnimatedContainer>
    </div>
  );
}
