
'use client';

import { ReportActions } from './report-generator/ReportActions';
import { ReportResults } from './report-generator/ReportResults';
import { Loader2 } from 'lucide-react';
import { useReportState } from '@/context/ReportStateContext';
import { GenerationTools } from './report-generator/GenerationTools';
import { EvaluationTools } from './report-generator/EvaluationTools';

export default function ReportGenerator() {
  const {
    state,
    isLoaded,
    generatingItem,
    isAnythingGenerating,
    proposal,
    handleProposalUpdate,
    handleSectionUpdate,
    handleDiagramCodeUpdate,
    handleDiagramUpdate,
    handleSubmit,
    contextSelections,
    toggleContextSelection,
    setExternalContext,
    removeExternalContext,
  } = useReportState();


  if (!isLoaded) {
      return (
          <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      )
  }

  const isToolsDisabled = !proposal || isAnythingGenerating;

  return (
    <form action={handleSubmit}>
       <input type="hidden" name="proposalJson" value={state.proposalJson} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-180px)]">
        {/* Left Column -> Now the main results view */}
        <div className="lg:col-span-8 overflow-y-auto pr-2">
          <ReportResults
            reportState={state}
            generatingItem={generatingItem}
            proposal={proposal}
            onProposalUpdate={handleProposalUpdate}
            onSectionUpdate={handleSectionUpdate}
            onDiagramCodeUpdate={handleDiagramCodeUpdate}
            onDiagramUpdate={handleDiagramUpdate}
            isAnythingGenerating={isAnythingGenerating}
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
            isPending={isAnythingGenerating && !!generatingItem}
            generatingItem={generatingItem}
            contextSelections={contextSelections}
            onContextToggle={toggleContextSelection}
            onExternalContextUploaded={setExternalContext}
            onExternalContextRemoved={removeExternalContext}
          />
           <EvaluationTools
            isDisabled={isToolsDisabled}
            isEvaluating={isAnythingGenerating && generatingItem === 'evaluate'}
            evaluationResult={state.evaluation}
          />
        </div>
      </div>
    </form>
  );
}
