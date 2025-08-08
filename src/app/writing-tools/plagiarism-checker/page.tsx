
'use client';

import { PlagiarismCheckerTool } from '@/components/writing-tools/PlagiarismCheckerTool';
import { CopyCheck } from 'lucide-react';

export default function PlagiarismCheckerPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <CopyCheck className="w-10 h-10" />
          AI Plagiarism Checker
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Check your text for potential plagiarism against online sources.
        </p>
      </div>
      <PlagiarismCheckerTool />
    </div>
  );
}
