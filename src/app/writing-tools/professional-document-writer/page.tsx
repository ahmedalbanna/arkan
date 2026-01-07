
'use client';

import { ProfessionalDocumentWriterTool } from '@/components/writing-tools/ProfessionalDocumentWriterTool';
import { FileText } from 'lucide-react';

export default function ProfessionalDocumentWriterPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <FileText className="w-10 h-10" />
          Professional Document Writer
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Generate high-quality professional documents like reports, proposals, and white papers.
        </p>
      </div>
      <ProfessionalDocumentWriterTool />
    </div>
  );
}
