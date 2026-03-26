
'use client';

import { AIImageGeneratorTool } from '@/modules/ai/adapters/components/writing-tools/AIImageGeneratorTool';
import { Image as ImageIcon } from 'lucide-react';

export default function AiImageGeneratorPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <ImageIcon className="w-10 h-10" />
          AI Image Generator
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Create unique images from text prompts using AI.
        </p>
      </div>
      <AIImageGeneratorTool />
    </div>
  );
}
