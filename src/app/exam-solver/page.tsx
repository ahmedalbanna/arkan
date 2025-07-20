
'use client';

import ExamSolver from '@/components/exam-solver/ExamSolver';
import { useLocalization } from '@/context/LocalizationContext';
import { FileQuestion } from 'lucide-react';

export default function ExamSolverPage() {
  const { t } = useLocalization();

  return (
    <div className="container mx-auto max-w-screen-2xl px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <FileQuestion className="w-10 h-10" />
          {t('builder.examSolver.pageTitle')}
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          {t('builder.examSolver.pageSubtitle')}
        </p>
      </div>
      <ExamSolver />
    </div>
  );
}
