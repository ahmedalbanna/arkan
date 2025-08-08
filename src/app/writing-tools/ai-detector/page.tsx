
'use client';

import { AIDetectorTool } from '@/components/writing-tools/AIDetectorTool';
import { Fingerprint } from 'lucide-react';

export default function AiDetectorPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <Fingerprint className="w-10 h-10" />
          AI Content Detector
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Analyze text to determine the likelihood that it was written by AI.
        </p>
      </div>
      <AIDetectorTool />
    </div>
  );
}
