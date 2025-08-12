
'use client';

import { DocumentWriterTool } from '@/components/writing-tools/DocumentWriterTool';
import { FileEdit } from 'lucide-react';

export default function DocumentWriterPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <FileEdit className="w-10 h-10" />
          AI Document Writer
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Generate complete documents, essays, or reports from a single topic.
        </p>
      </div>
      <DocumentWriterTool />
    </div>
  );
}
