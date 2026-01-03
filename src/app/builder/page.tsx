'use client';

import ReportModeGenerator from '@/components/report-mode/ReportModeGenerator';
import { BuilderPageSkeleton } from './loading';
import { Suspense } from 'react';

export default function GeneratePage() {
  // The main page now simply wraps the ReportModeGenerator with Suspense for loading.
  // All logic has been moved into the ReportModeGenerator component itself.
  return (
    <Suspense fallback={<BuilderPageSkeleton />}>
      <ReportModeGenerator />
    </Suspense>
  );
}
