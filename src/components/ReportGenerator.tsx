
'use client';

import { ProposalEditor } from './report-generator/ProposalEditor';
import { GenerationTools } from './report-generator/GenerationTools';
import { ReportActions } from './report-generator/ReportActions';
import { ReportResults } from './report-generator/ReportResults';
import { Loader2 } from 'lucide-react';
import { useReportState } from '@/context/ReportStateContext';
import { EvaluationTools } from './report-generator/EvaluationTools';

export default function ReportGenerator() {
  const {
    state,
    isLoaded,
    generatingItem,
    isAnythingGenerating,
    proposal,
    proposalJson,
    handleProposalJsonChange,
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

  const isToolsDisabled = !proposalJson || isAnythingGenerating;

  return (
    <form action={handleSubmit}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-180px)]">
        {/* Left Column */}
        <div className="lg:col-span-3 space-y-6 overflow-y-auto pr-2">
          <ProposalEditor
            proposalJson={proposalJson}
            onProposalJsonChange={handleProposalJsonChange}
            isDisabled={isAnythingGenerating}
            error={state.error && !generatingItem ? state.error : undefined}
          />
        </div>

        {/* Center Column */}
        <div className="lg:col-span-6 overflow-y-auto pr-2">
          <ReportResults
            reportState={state}
            generatingItem={generatingItem}
            proposal={proposal}
            onProposalUpdate={handleProposalUpdate}
            onSectionUpdate={handleSectionUpdate}
            onDiagramCodeUpdate={handleDiagramCodeUpdate}
            onDiagramUpdate={handleDiagramUpdate}
          />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-3 space-y-6 overflow-y-auto pr-2">
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
