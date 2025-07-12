
'use client';

import { useState } from 'react';
import type { PresentationSlide } from '@/ai/schemas';
import { Button } from '@/components/ui/button';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Minimize, Maximize } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-components';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface PresentationViewerProps {
  slides: PresentationSlide[];
  onOpenChange: (isOpen: boolean) => void;
  isOpen: boolean;
}

export default function PresentationViewer({ slides, isOpen, onOpenChange }: PresentationViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // When the dialog opens, reset to the first slide
  if (isOpen && currentSlide !== 0 && slides.length > 0) {
      setCurrentSlide(0);
  }

  const handleNext = () => {
    setCurrentSlide((prev) => (prev < slides.length - 1 ? prev + 1 : prev));
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const slide = slides?.[currentSlide];

  if (!slide) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>No Slides</DialogTitle>
                    <DialogDescription>
                        There are no slides to display for this presentation.
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={`transition-all duration-300 flex flex-col ${isFullScreen ? 'max-w-full h-screen p-8' : 'max-w-4xl'}`}>
        <DialogHeader>
            <div className="flex justify-between items-center">
                <DialogTitle className="font-headline text-2xl text-primary">{slide.title}</DialogTitle>
                <Button variant="ghost" size="icon" onClick={() => setIsFullScreen(!isFullScreen)}>
                    {isFullScreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                </Button>
            </div>
            <DialogDescription>
              Slide {currentSlide + 1} of {slides.length}
            </DialogDescription>
        </DialogHeader>

        <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto p-6 -mx-6">
            <div className="md:col-span-2">
              <h3 className="font-semibold mb-2">Content</h3>
              <ul className="list-disc pl-5 space-y-2 text-lg">
                {slide.content.map((item, index) => (
                  <li key={index}>
                    <ReactMarkdown components={markdownComponents}>{item}</ReactMarkdown>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Speaker Notes</h3>
              <div className="text-sm text-muted-foreground prose prose-sm max-w-none">
                <ReactMarkdown components={markdownComponents}>{slide.speakerNotes}</ReactMarkdown>
              </div>
            </div>
        </div>
        <div className="flex justify-between items-center pt-6 border-t -mx-6 -mb-6 px-6 pb-6">
            <Button onClick={handlePrev} disabled={currentSlide === 0}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            <div className="flex space-x-1">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`h-2 w-2 rounded-full ${currentSlide === index ? 'bg-primary' : 'bg-muted hover:bg-muted-foreground'}`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
            <Button onClick={handleNext} disabled={currentSlide === slides.length - 1}>
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
