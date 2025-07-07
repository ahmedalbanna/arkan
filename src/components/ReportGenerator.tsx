'use client';

import { useState, useTransition } from 'react';
import { handleGenerateReportItem } from '@/app/generate-report/actions';
import { useReportBuilder } from '@/hooks/use-report-builder';
import { ProposalGenerator } from './report-generator/ProposalGenerator';
import { ProposalEditor } from './report-generator/ProposalEditor';
import { GenerationTools } from './report-generator/GenerationTools';
import { ReportActions } from './report-generator/ReportActions';
import { ReportResults } from './report-generator/ReportResults';
import { add, format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { useAgents } from '@/hooks/use-agents';
import { ProjectProposalSchema, type ProjectProposal, type SectionName } from '@/ai/schemas';

function set(obj: any, path: string, value: any) {
  const keys = path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (i === keys.length - 1) {
      current[key] = value;
    } else {
      if (!current[key]) {
        current[key] = /^\d+$/.test(keys[i + 1]) ? [] : {};
      }
      current = current[key];
    }
  }
}

export default function ReportGenerator() {
  const [isPending, startTransition] = useTransition();
  const [generatingItem, setGeneratingItem] = useState<string | null>(null);

  const {
    isLoaded,
    state,
    setState,
    projectIdea,
    setProjectIdea,
    proposal,
    setProposal,
    proposalJson,
    setProposalJson,
    handleNewSession,
  } = useReportBuilder();
  
  const { isLoaded: agentsLoaded } = useAgents();

  const handleProposalGenerated = (newProposal: ProjectProposal) => {
    setProposal(newProposal);
    setProposalJson(JSON.stringify(newProposal, null, 2));
  };
  
  const handleProposalJsonChange = (json: string) => {
    setProposalJson(json);
    try {
        const parsed = ProjectProposalSchema.parse(JSON.parse(json));
        setProposal(parsed);
    } catch {
        // Silently fail, UI will be based on last valid proposal
    }
  };

  const handleProposalUpdate = (path: string, value: any) => {
    if (!proposal) return;
    const newProposal = JSON.parse(JSON.stringify(proposal));
    set(newProposal, path, value);

    if (path.startsWith('budget.breakdown') || path === 'budget.currency') {
        const total = newProposal.budget.breakdown.reduce((acc: number, item: { cost: number }) => acc + Number(item.cost || 0), 0);
        newProposal.budget.totalAmount = total;
    }

    if (path.startsWith('timeline')) {
        try {
            let currentDate = new Date(newProposal.timeline.startDate);
            if (isNaN(currentDate.getTime())) { currentDate = new Date(); }
            for (const phase of newProposal.timeline.phases) {
                currentDate = add(currentDate, { weeks: Number(phase.durationWeeks || 0) });
            }
            newProposal.timeline.endDate = format(currentDate, 'yyyy-MM-dd');
        } catch (error) {
            console.error("Error calculating timeline:", error);
        }
    }
    
    setProposal(newProposal);
    setProposalJson(JSON.stringify(newProposal, null, 2));
  };

  const handleSectionUpdate = (sectionKey: SectionName, newContent: string) => {
    setState({
        ...state,
        sections: { ...state.sections, [sectionKey]: newContent },
        lastGenerated: state.lastGenerated, // Keep lastGenerated
    });
  };

  const handleSubmit = (formData: FormData) => {
    const item = formData.get('itemToGenerate') as string;
    if (!item) return;

    setGeneratingItem(item);
    startTransition(async () => {
      const newState = await handleGenerateReportItem(state, formData);
      setState(newState);
      setGeneratingItem(null);
    });
  };
  
  if (!isLoaded || !agentsLoaded) {
      return (
          <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      )
  }

  return (
    <div className="space-y-6">
      <ProposalGenerator
        projectIdea={projectIdea}
        onProjectIdeaChange={setProjectIdea}
        onProposalGenerated={handleProposalGenerated}
        onReset={handleNewSession}
      />

      <form action={handleSubmit}>
        <div className={`grid grid-cols-1 md:grid-cols-5 sm:gap-2 lg:gap-4 ${!proposalJson ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="md:col-span-2 space-y-6">
            <ProposalEditor 
                proposalJson={proposalJson} 
                onProposalJsonChange={handleProposalJsonChange}
                isDisabled={!proposalJson}
                error={state?.error && !generatingItem ? state.error : undefined}
            />
            <GenerationTools 
                reportState={state}
                isPending={isPending}
                generatingItem={generatingItem}
            />
          </div>
          <div className="md:col-span-3 space-y-6">
            <ReportActions
              proposal={proposal}
              reportState={state}
              onNewSession={handleNewSession}
              isPending={isPending}
            />
            <ReportResults
              reportState={state}
              generatingItem={generatingItem}
              proposal={proposal}
              onProposalUpdate={handleProposalUpdate}
              onSectionUpdate={handleSectionUpdate}
            />
          </div>
        </div>
      </form>
    </div>
  );
}
