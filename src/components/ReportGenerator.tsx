
'use client';

import { ReportActions } from './report-generator/ReportActions';
import { ReportResults } from './report-generator/ReportResults';
import { AlertCircle } from 'lucide-react';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { GenerationTools } from './report-generator/GenerationTools';
import { EvaluationTools } from './report-generator/EvaluationTools';
import { Card } from './ui/card';
import { useAuth } from '@/context/AuthContext';

export default function ReportGenerator() {
    const { user, fetchUser } = useAuth();
    const {
        proposal,
        isAnythingGenerating,
        lastGenerated,
        handleEvaluateReport,
        evaluation,
        handleSectionUpdate
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

  const isToolsDisabled = !proposal || isAnythingGenerating;

  const onEvaluate = (formData: FormData) => {
    if (user) {
        handleEvaluateReport(formData, user, fetchUser);
    }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onEvaluate(new FormData(e.currentTarget)); }}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-180px)]">
        {/* Left Column -> Now the main results view */}
        <div className="lg:col-span-8 overflow-y-auto pr-2">
          <ReportResults
            generatingItem={lastGenerated}
            onSectionUpdate={handleSectionUpdate}
          />
        </div>

        {/* Right Column -> All tools */}
        <div className="lg:col-span-4 space-y-6 overflow-y-auto pr-2">
          <ReportActions />
          <GenerationTools />
           <EvaluationTools
            isDisabled={isToolsDisabled}
            isEvaluating={isAnythingGenerating && lastGenerated === 'evaluate'}
            evaluationResult={evaluation}
          />
        </div>
      </div>
    </form>
  );
}
