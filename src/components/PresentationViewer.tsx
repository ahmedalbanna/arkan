
'use client';

import { useState, useEffect } from 'react';
import type { PresentationSlide } from '@/ai/schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, FileDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-components';
import { exportPresentationAsPptx } from '@/lib/pptx-exporter';
import { ScrollArea } from './ui/scroll-area';

interface PresentationViewerProps {
  slides: PresentationSlide[];
}

export default function PresentationViewer({ slides }: PresentationViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

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
          <CardTitle>No Slides</CardTitle>
          <CardDescription>There are no slides to display for this presentation.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="font-headline text-2xl text-primary">{slide.title}</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} title="Export to PPTX">
              <FileDown className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
        <CardDescription>
          Slide {currentSlide + 1} of {slides.length}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto">
        <div className="md:col-span-2 prose dark:prose-invert max-w-none">
          <h3 className="font-semibold mb-2">Content</h3>
          <ul className="list-disc pl-5 space-y-2 text-lg">
            {slide.content.map((item, index) => (
              <li key={index}>
                <ReactMarkdown components={markdownComponents}>{item}</ReactMarkdown>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-muted p-4 rounded-lg flex flex-col min-h-0">
            <h3 className="font-semibold mb-2 shrink-0">Speaker Notes</h3>
            <ScrollArea className="flex-grow">
                 <div className="prose prose-sm max-w-none text-muted-foreground pr-4">
                    <ReactMarkdown components={markdownComponents}>{slide.speakerNotes}</ReactMarkdown>
                </div>
            </ScrollArea>
        </div>
      </CardContent>
      <div className="flex justify-between items-center p-4 border-t">
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
    </Card>
  );
}
