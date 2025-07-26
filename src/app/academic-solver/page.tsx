
'use client';

import AcademicSolver from '@/components/academic-solver/AcademicSolver';
import { useLocalization } from '@/context/LocalizationContext';
import { BookCheck } from 'lucide-react';

export default function AcademicSolverPage() {
  const { t } = useLocalization();

  return (
    <div className="container mx-auto max-w-screen-2xl px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <BookCheck className="w-10 h-10" />
          {t('builder.academicSolver.pageTitle')}
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          {t('builder.academicSolver.pageSubtitle')}
        </p>
      </div>
      <AcademicSolver />
    </div>
  );
}
