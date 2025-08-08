
'use client';

import { ParaphraserTool } from '@/components/writing-tools/ParaphraserTool';
import { Repeat } from 'lucide-react';

export default function ParaphraserPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <Repeat className="w-10 h-10" />
          AI Paraphraser
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Rewrite your text in different styles to enhance clarity, fluency, or creativity.
        </p>
      </div>
      <ParaphraserTool />
    </div>
  );
}
