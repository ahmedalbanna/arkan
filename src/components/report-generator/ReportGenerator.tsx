
'use client';

import { useState, useTransition, useActionState, useEffect, useRef } from 'react';
import { handleGenerateReportItem, handleCreateProjectFromProposal } from '@/app/generate-report/actions';
import { useReportBuilder } from '@/hooks/use-report-builder';
import { ProposalGenerator } from './ProposalGenerator';
import { ProposalEditor } from './ProposalEditor';
import { GenerationTools } from './GenerationTools';
import { ReportActions } from './ReportActions';
import { ReportResults } from './ReportResults';
import { add, format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { useAgents } from '@/hooks/use-agents';
import { ProjectProposalSchema, type ProjectProposal, type SectionName, type DiagramType } from '@/ai/schemas';
import { useToast } from '@/hooks/use-toast';
import { sectionConfig, diagramConfig } from '@/lib/report-config';
import { useAuth } from '@/context/AuthContext';

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
  const [isGenerating, startTransition] = useTransition();
  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);
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
    contextSelections,
    toggleContextSelection,
  } = useReportBuilder();
  
  const { isLoaded: agentsLoaded } = useAgents();
  const { user, deductCredits } = useAuth();

  const { toast } = useToast();
  const [createState, createFormAction] = useActionState(handleCreateProjectFromProposal, null);

  const prevLastGenerated = useRef<string | undefined>();
  const prevError = useRef<string | undefined>();

  useEffect(() => {
    if (createState?.error) {
      toast({
        title: "Error Creating Project",
        description: createState.error,
        variant: 'destructive'
      })
    }
  }, [createState, toast]);

  useEffect(() => {
    // Toast for generation success
    if (state.lastGenerated && state.lastGenerated !== prevLastGenerated.current && !state.error) {
        const itemConfig = (sectionConfig as any)[state.lastGenerated] || (diagramConfig as any)[state.lastGenerated];
        const title = itemConfig?.title || state.lastGenerated;
        toast({
            title: "Generation Successful!",
            description: `Successfully generated "${title}".`,
        });
    }

    // Toast for generation error
    if (state.error && state.error !== prevError.current && state.error !== 'Invalid JSON format. Please check the content.') {
        toast({
            title: "Generation Failed",
            description: state.error,
            variant: "destructive",
        });
    }

    prevLastGenerated.current = state.lastGenerated;
    prevError.current = state.error;

  }, [state.lastGenerated, state.error, toast]);


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

  const handleDiagramCodeUpdate = (diagramType: DiagramType, code: string) => {
    setState(prevState => {
        const diagrams = { ...prevState.diagrams };
        if (diagrams[diagramType]) {
            diagrams[diagramType]!.plantUmlCode = code;
        }
        return {
            ...prevState,
            diagrams
        };
    });
  };

  const handleDiagramUpdate = (diagramType: DiagramType, code: string) => {
      const formData = new FormData();
      if (proposalJson) formData.set('proposalJson', proposalJson);
      // Add a dummy value for itemToGenerate to pass schema validation if needed, but intent will be checked first
      formData.set('itemToGenerate', diagramType);
      formData.set('intent', 'update_diagram');
      formData.set('diagramToUpdate', diagramType);
      formData.set('plantUmlCode', code);
      handleSubmit(formData);
  };

  const handleSubmit = (formData: FormData) => {
    const item = (formData.get('itemToGenerate') || formData.get('diagramToUpdate')) as string;
    if (!item) return;

    if (!user || user.credits < 1) {
        toast({
            title: "Insufficient Credits",
            description: "You do not have enough credits to generate a new item.",
            variant: "destructive",
        });
        return;
    }

    setGeneratingItem(item);
    startTransition(async () => {
      const newState = await handleGenerateReportItem(state, formData);
      if(!newState.error) {
        deductCredits(1);
      }
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

  const isAnythingGenerating = isGenerating || isGeneratingProposal;
  const isToolsDisabled = !proposalJson || isAnythingGenerating;

  return (
    <div className="space-y-6">
      <ProposalGenerator
        isGenerating={isGeneratingProposal}
        setIsGenerating={setIsGeneratingProposal}
        projectIdea={projectIdea}
        onProjectIdeaChange={setProjectIdea}
        onProposalGenerated={handleProposalGenerated}
        onReset={handleNewSession}
      />

      <form action={handleSubmit}>
         {proposalJson && <input type="hidden" name="proposalJson" value={proposalJson} />}
         {state.sections && <input type="hidden" name="sectionsJson" value={JSON.stringify(state.sections)} />}
         {state.diagrams && <input type="hidden" name="diagramsJson" value={JSON.stringify(state.diagrams)} />}
         
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ProposalEditor 
                proposalJson={proposalJson} 
                onProposalJsonChange={handleProposalJsonChange}
                isDisabled={isAnythingGenerating}
                error={state?.error && !generatingItem ? state.error : undefined}
            />
            <GenerationTools 
                isDisabled={isToolsDisabled}
                reportState={state}
                isPending={isGenerating}
                generatingItem={generatingItem}
                contextSelections={contextSelections}
                onContextToggle={toggleContextSelection}
            />
          </div>
          <div className="lg:col-span-3 space-y-6">
            <ReportActions
              proposal={proposal}
              reportState={state}
              onNewSession={handleNewSession}
              isGenerating={isAnythingGenerating}
              createFormAction={createFormAction}
            />
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
        </div>
      </form>
    </div>
  );
}
