
'use client';

import GenerationTemplateManager from '@/components/admin/GenerationTemplateManager';
import { SlidersHorizontal } from 'lucide-react';

export default function ManageGenerationTemplatesPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <SlidersHorizontal className="w-10 h-10" />
          Manage Generation Templates
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Configure the prompts and settings for proposal, report, and presentation generation.
        </p>
      </div>
      <GenerationTemplateManager />
    </div>
  );
}
