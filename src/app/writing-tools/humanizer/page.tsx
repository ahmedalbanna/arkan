
'use client';

import { AITextManipulationTool } from '@/components/writing-tools/AITextManipulationTool';
import { UserCheck } from 'lucide-react';

export default function HumanizerPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <UserCheck className="w-10 h-10" />
          AI Humanizer
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Make AI-generated text sound more natural and less robotic.
        </p>
      </div>
      <AITextManipulationTool
        toolTitle="AI Humanizer"
        toolDescription="Paste your AI-generated text below, and the tool will rewrite it to have a more human-like tone and style."
        buttonText="Humanize Text"
        aiCommand="Rewrite the following text to sound more natural, fluent, and human-like. Avoid robotic phrasing and complex sentence structures."
        originalTextTitle="Original AI Text"
        processedTextTitle="Humanized Text"
      />
    </div>
  );
}
