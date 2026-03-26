
'use client';

import { BiasCheckerTool } from '@/modules/ai/adapters/components/writing-tools/BiasCheckerTool';
import { Scale } from 'lucide-react';

export default function BiasCheckerPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <Scale className="w-10 h-10" />
          Language Bias Checker
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Ensure your writing is inclusive and free of unintentional bias.
        </p>
      </div>
      <BiasCheckerTool />
    </div>
  );
}
