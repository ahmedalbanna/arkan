
'use client';

import { useState, useEffect } from 'react';
import type { PresentationHistoryEntry } from '@/ai/schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-styles';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PresentationViewerProps {
  activePresentation: PresentationHistoryEntry;
}

export function PresentationViewer({ activePresentation }: PresentationViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Add a guard clause to handle cases where activePresentation might be undefined.
  if (!activePresentation || !activePresentation.slides || activePresentation.slides.length === 0) {
    return (
        <div className="p-8 text-center text-muted-foreground">No slides to display.</div>
    );
  }
  
  useEffect(() => {
    // When a new presentation is passed, reset to the first slide.
    setCurrentSlide(0);
  }, [activePresentation.id]);

  const slides = activePresentation.slides;

  const slide = slides[currentSlide];

  if (!slide) {
    return <div className="p-8 text-center text-muted-foreground">Selected slide not found.</div>;
  }

  const handleNext = () => {
    setCurrentSlide((prev) => (prev < slides.length - 1 ? prev + 1 : prev));
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev));
  };

  return (
    <div className="flex flex-col h-full bg-white p-8">
      <h2 className="text-3xl font-bold mb-2">{slide.title}</h2>
      <div className="grow">
          <ul className="list-disc pl-5 space-y-2 text-lg">
            {slide.content.map((item, index) => (
              <li key={index}>
                {item}
              </li>
            ))}
          </ul>
      </div>
       <div className="text-center text-sm text-muted-foreground">
        Slide {currentSlide + 1} of {slides.length}
      </div>
    </div>
  );
}
