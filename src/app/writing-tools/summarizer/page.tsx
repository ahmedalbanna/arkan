
'use client';

import { SummarizerTool } from '@/components/writing-tools/SummarizerTool';
import { BookOpenText } from 'lucide-react';

export default function SummarizerPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <BookOpenText className="w-10 h-10" />
          AI Summarizer
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Condense long texts into concise summaries of your desired length.
        </p>
      </div>
      <SummarizerTool />
    </div>
  );
}
