
'use client';

import { CitationGeneratorTool } from '@/components/writing-tools/CitationGeneratorTool';
import { Quote } from 'lucide-react';

export default function CitationGeneratorPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <Quote className="w-10 h-10" />
          AI Citation Generator
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Generate accurate citations in APA, MLA, Chicago, and more styles from any source.
        </p>
      </div>
      <CitationGeneratorTool />
    </div>
  );
}
