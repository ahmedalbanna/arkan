
'use client';

import { QuizGeneratorTool } from '@/components/writing-tools/QuizGeneratorTool';
import { FileQuestion } from 'lucide-react';

export default function QuizGeneratorPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <FileQuestion className="w-10 h-10" />
          AI Quiz Generator
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Turn any text into an engaging quiz with just a few clicks.
        </p>
      </div>
      <QuizGeneratorTool />
    </div>
  );
}
