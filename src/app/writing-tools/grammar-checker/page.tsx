
'use client';

import { GrammarCheckerTool } from '@/components/writing-tools/GrammarCheckerTool';
import { SpellCheck } from 'lucide-react';

export default function GrammarCheckerPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <SpellCheck className="w-10 h-10" />
          AI Grammar Checker
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Correct spelling and grammar mistakes in your text instantly.
        </p>
      </div>
      <GrammarCheckerTool />
    </div>
  );
}
