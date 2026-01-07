
'use client';

import { AcademicPaperQualityCheckerTool } from '@/components/writing-tools/AcademicPaperQualityCheckerTool';
import { ShieldCheck } from 'lucide-react';

export default function AcademicPaperQualityCheckerPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <ShieldCheck className="w-10 h-10" />
          Academic Paper Quality Checker
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Get a comprehensive quality score and detailed feedback on your academic paper.
        </p>
      </div>
      <AcademicPaperQualityCheckerTool />
    </div>
  );
}
