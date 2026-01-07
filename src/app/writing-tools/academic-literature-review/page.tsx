
'use client';

import { AcademicLiteratureReviewTool } from '@/components/writing-tools/AcademicLiteratureReviewTool';
import { BookCopy } from 'lucide-react';

export default function AcademicLiteratureReviewPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <BookCopy className="w-10 h-10" />
          Academic Literature Review
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Generate a comprehensive academic literature review with citation validation and quality analysis.
        </p>
      </div>
      <AcademicLiteratureReviewTool />
    </div>
  );
}
