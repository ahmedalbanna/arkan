
'use client';

import { AITextTune } from '@/modules/ai/adapters/components/writing-tools/AITextTune';
import { PenSquare } from 'lucide-react';

export default function TextStylistPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <PenSquare className="w-10 h-10" />
          TextStylist.ai
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Refine your writing by rewriting text in various styles or summarizing it to a specific length.
        </p>
      </div>
      <AITextTune />
    </div>
  );
}
