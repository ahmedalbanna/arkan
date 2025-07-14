'use client';

import { ProposalGenerator } from './report-generator/ProposalGenerator';
import { ProposalEditor } from './report-generator/ProposalEditor';
import { GenerationTools } from './report-generator/GenerationTools';
import { ReportActions } from './report-generator/ReportActions';
import { ReportResults } from './report-generator/ReportResults';
import { Loader2 } from 'lucide-react';
import { useReportState } from '@/context/ReportStateContext';


export default function ReportGenerator() {
  const {
    state,
    isLoaded,
    isGeneratingProposal,
    generatingItem,
    isAnythingGenerating,
    proposal,
    proposalJson,
    projectIdea,
    handleProjectIdeaChange,
    handleProposalGenerated,
    handleProposalJsonChange,
    handleProposalUpdate,
    handleSectionUpdate,
    handleDiagramUpdate,
    handleNewSession,
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-150px)]">
        {/* Left Column */}
        <div className="lg:col-span-3 space-y-6 overflow-y-auto pr-2">
          <ProposalGenerator
            isGenerating={isGeneratingProposal}
            projectIdea={projectIdea}
            onProjectIdeaChange={handleProjectIdeaChange}
            onProposalGenerated={handleProposalGenerated}
          />
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
            onDiagramUpdate={handleDiagramUpdate}
          />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-3 space-y-6 overflow-y-auto pr-2">
          <ReportActions
            proposal={proposal}
            reportState={state}
            onNewSession={handleNewSession}
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
        </div>
      </div>
    </form>
  );
}