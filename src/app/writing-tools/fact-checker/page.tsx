
'use client';

import { FactCheckerTool } from '@/components/writing-tools/FactCheckerTool';
import { CheckCircle } from 'lucide-react';

export default function FactCheckerPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <CheckCircle className="w-10 h-10" />
          AI Fact Checker
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Verify factual claims within your text against web sources.
        </p>
      </div>
      <FactCheckerTool />
    </div>
  );
}
