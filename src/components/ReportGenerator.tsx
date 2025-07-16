
'use client';

import { ReportActions } from './report-generator/ReportActions';
import { ReportResults } from './report-generator/ReportResults';
import { Loader2, AlertCircle } from 'lucide-react';
import { useBuilderState } from '@/context/BuilderStateContext';
import { GenerationTools } from './report-generator/GenerationTools';
import { EvaluationTools } from './report-generator/EvaluationTools';
import { Card } from './ui/card';

export default function ReportGenerator() {
  const {
    state,
    handleGenerateReportSection,
    handleSectionUpdate,
    toggleContextSelection,
    setExternalContext,
    removeExternalContext,
    handleEvaluateReport,
  } = useBuilderState();

  const { isLoaded, isAnythingGenerating, proposal, lastGenerated } = state;


  if (!isLoaded) {
      return (
          <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      )
  }

  const isToolsDisabled = !proposal || isAnythingGenerating;
  
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
    <form action={(formData) => handleEvaluateReport(formData)}>
       <input type="hidden" name="proposalJson" value={state.proposalJson} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-180px)]">
        {/* Left Column -> Now the main results view */}
        <div className="lg:col-span-8 overflow-y-auto pr-2">
          <ReportResults
            reportState={state}
            generatingItem={isAnythingGenerating ? lastGenerated : null}
            onSectionUpdate={handleSectionUpdate}
          />
        </div>

        {/* Right Column -> All tools */}
        <div className="lg:col-span-4 space-y-6 overflow-y-auto pr-2">
          <ReportActions
            isGenerating={isAnythingGenerating}
          />
          <GenerationTools
            isDisabled={isToolsDisabled}
            reportState={state}
            isPending={isAnythingGenerating}
            generatingItem={lastGenerated}
            contextSelections={state.contextSelections}
            onContextToggle={toggleContextSelection}
            onExternalContextUploaded={setExternalContext}
            onExternalContextRemoved={removeExternalContext}
            onGenerate={handleGenerateReportSection}
          />
           <EvaluationTools
            isDisabled={isToolsDisabled}
            isEvaluating={isAnythingGenerating && lastGenerated === 'evaluate'}
            evaluationResult={state.evaluation}
          />
        </div>
      </div>
    </form>
  );
}
