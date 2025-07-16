
'use client';

import { ReportActions } from './report-generator/ReportActions';
import { ReportResults } from './report-generator/ReportResults';
import { Loader2, AlertCircle } from 'lucide-react';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { GenerationTools } from './report-generator/GenerationTools';
import { EvaluationTools } from './report-generator/EvaluationTools';
import { Card } from './ui/card';
import { useAuth } from '@/context/AuthContext';

export default function ReportGenerator() {
    const auth = useAuth();
    const {
        proposal,
        isAnythingGenerating,
        lastGenerated,
        sections,
        diagrams,
        evaluation,
        externalContext,
        contextSelections,
        controlState,
        guidelineState,
        customGuidelineInput,
        handleSectionUpdate,
        handleGenerateReportSection,
        handleEvaluateReport,
        toggleContextSelection,
        setExternalContext,
        removeExternalContext,
        handleControlChange,
        handleGuidelineToggle,
        setCustomGuidelineInputForItem,
        handleAddCustomGuidelineForItem,
        handleRemoveCustomGuidelineForItem,
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

  return (
    <form action={(formData) => handleEvaluateReport(formData)}>
       <input type="hidden" name="proposalJson" value={JSON.stringify(proposal)} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-180px)]">
        {/* Left Column -> Now the main results view */}
        <div className="lg:col-span-8 overflow-y-auto pr-2">
          <ReportResults
            sections={sections}
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
            isPending={isAnythingGenerating}
            generatingItem={lastGenerated}
            sections={sections}
            diagrams={diagrams}
            externalContext={externalContext}
            contextSelections={contextSelections}
            onContextToggle={toggleContextSelection}
            onExternalContextUploaded={setExternalContext}
            onExternalContextRemoved={removeExternalContext}
            onGenerate={(section) => handleGenerateReportSection(section, auth)}
            controlState={controlState}
            onControlChange={handleControlChange}
            guidelineState={guidelineState}
            onGuidelineToggle={handleGuidelineToggle}
            customGuidelineInput={customGuidelineInput}
            onCustomGuidelineChange={setCustomGuidelineInputForItem}
            onAddCustomGuideline={handleAddCustomGuidelineForItem}
            onRemoveCustomGuideline={handleRemoveCustomGuidelineForItem}
          />
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
