
'use client';

import { SentenceStructureCheckerTool } from '@/modules/ai/adapters/components/writing-tools/SentenceStructureCheckerTool';
import { Workflow } from 'lucide-react';

export default function SentenceStructureCheckerPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <Workflow className="w-10 h-10" />
          Sentence Structure Checker
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Analyze your text for sentence variety, length, and complexity to improve readability.
        </p>
      </div>
      <SentenceStructureCheckerTool />
    </div>
  );
}
