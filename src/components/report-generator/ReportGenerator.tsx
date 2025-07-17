
'use client';

import { ReportActions } from './ReportActions';
import { ReportResults } from './ReportResults';
import { AlertCircle } from 'lucide-react';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { GenerationTools } from './GenerationTools';
import { EvaluationTools } from './EvaluationTools';
import { Card } from '@/components/ui/card';

export default function ReportGenerator() {
    const {
        proposal,
        handleSectionUpdate,
    } = useBuilderStore();

  if (!proposal) {
    return (
        <Card className="flex items-center justify-center h-full min-h-[400px]">
            <div className="text-center text-muted-foreground p-8">
                <AlertCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
                <h3 className="text-lg font-semibold">No Proposal Loaded</h3>
                <p>Please generate a proposal in "Proposal Mode" first, or upload a project file.</p>
            </div>
        </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-180px)]">
      {/* Left Column -> Now the main results view */}
      <div className="lg:col-span-8 overflow-y-auto pr-2">
        <ReportResults onSectionUpdate={handleSectionUpdate} />
      </div>

      {/* Right Column -> All tools */}
      <div className="lg:col-span-4 space-y-6 overflow-y-auto pr-2">
        <ReportActions />
        <GenerationTools />
        <EvaluationTools />
      </div>
    </div>
  );
}
