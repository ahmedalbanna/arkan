'use client';

import { MarkdownToWordTool } from '@/modules/ai/adapters/components/writing-tools/MarkdownToWordTool';
import { FileText } from 'lucide-react';

export default function MarkdownToWordPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <FileText className="w-10 h-10" />
          Markdown to Word Converter
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Convert your markdown text into a beautifully formatted Microsoft Word document.
        </p>
      </div>
      <MarkdownToWordTool />
    </div>
  );
}
