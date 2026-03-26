'use client';

import { InvisibleTextDetector } from '@/modules/ai/adapters/components/writing-tools/InvisibleTextDetector';
import { EyeOff } from 'lucide-react';

export default function InvisibleTextDetectorPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <EyeOff className="w-10 h-10" />
          Invisible Text Detector & Remover
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Find and remove hidden Unicode characters in your text. LLMs like ChatGPT can inject hidden characters like Em-Dash or Zero Width Space into text.
        </p>
      </div>
      <InvisibleTextDetector />
    </div>
  );
}

