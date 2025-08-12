
'use client';

import { PresentationOutlineTool } from '@/components/writing-tools/PresentationOutlineTool';
import { Presentation } from 'lucide-react';

export default function PresentationOutlinePage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <Presentation className="w-10 h-10" />
          Presentation Outline Generator
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Generate a structured outline for your presentation from a single topic.
        </p>
      </div>
      <PresentationOutlineTool />
    </div>
  );
}
