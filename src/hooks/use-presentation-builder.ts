
'use client';

import { useState, useReducer, useTransition, useCallback } from 'react';
import { z } from 'zod';
import { generatePresentation } from '@/ai/flows/generate-presentation';
import { ProjectProposalSchema, type PresentationSlide, SectionNameSchema, DiagramTypeSchema } from '@/ai/schemas';
import type { ReportState as FullReportState } from '@/hooks/use-report-builder';
import { AGENTS } from '@/lib/agents';
import { deductCredit } from '@/services/credit-service';
import { useAuth } from '@/context/AuthContext';
import { useToast } from './use-toast';

export interface PresentationState {
  slides?: PresentationSlide[];
  error?: string;
}

type ReportContextState = Pick<FullReportState, 'sections' | 'diagrams'>;

type Action =
  | { type: 'GENERATION_START' }
  | { type: 'GENERATION_SUCCESS'; payload: PresentationSlide[] }
  | { type: 'GENERATION_FAILURE'; payload: string }
  | { type: 'SET_REPORT_STATE', payload: ReportContextState };

const initialState: PresentationState = {};

function reducer(state: PresentationState, action: Action): PresentationState {
  switch (action.type) {
    case 'GENERATION_START':
      return { ...state, error: undefined };
    case 'GENERATION_SUCCESS':
      return { slides: action.payload, error: undefined };
    case 'GENERATION_FAILURE':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

const GeneratePresentationSchema = z.object({
  proposalJson: z.string().min(1, 'Please paste the project proposal content.'),
  guidelines: z.array(z.string()).optional(),
  instructionText: z.string().optional(),
});


export function usePresentationBuilder() {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [isGenerating, startTransition] = useTransition();
    const [proposalJson, setProposalJson] = useState('');
    const { user, fetchUser } = useAuth();
    const { toast } = useToast();

    // State for context
    const [reportState, setReportStateInternal] = useState<ReportContextState>({ sections: {}, diagrams: {} });
    const [contextSelections, setContextSelections] = useState({ sections: {} as Record<string, boolean>, diagrams: {} as Record<string, boolean> });


    const setReportState = (file: File | null) => {
        if (!file) {
            setReportStateInternal({ sections: {}, diagrams: {} });
            setContextSelections({ sections: {}, diagrams: {} });
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const parsed = JSON.parse(content) as FullReportState;
                if (parsed.sections || parsed.diagrams) {
                    const sections = parsed.sections || {};
                    const diagrams = parsed.diagrams || {};
                    setReportStateInternal({ sections, diagrams });
                    
                    const newSelections = { sections: {} as Record<string, boolean>, diagrams: {} as Record<string, boolean> };
                    Object.keys(sections).forEach(key => newSelections.sections[key] = true);
                    Object.keys(diagrams).forEach(key => newSelections.diagrams[key] = true);
                    setContextSelections(newSelections);

                    toast({ title: 'Report File Loaded', description: `Loaded context from ${file.name}` });
                } else {
                    throw new Error('Invalid file structure');
                }
            } catch (err) {
                toast({ title: 'Error', description: 'Could not parse the report file.', variant: 'destructive' });
            }
        };
        reader.readAsText(file);
    };

    const toggleContextSelection = useCallback((type: 'sections' | 'diagrams', key: string) => {
        setContextSelections(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [key]: !prev[type][key]
            }
        }));
    }, []);

    const handleGeneratePresentation = (formData?: FormData) => {
        
        const validatedFields = GeneratePresentationSchema.safeParse({ 
            proposalJson,
            guidelines: formData?.getAll('guidelines[]').map(String),
            instructionText: formData?.get('instructionText') as string | undefined
        });

        if (!validatedFields.success) {
            dispatch({ type: 'GENERATION_FAILURE', payload: 'Proposal JSON is required.' });
            return;
        }

        let proposalData;
        try {
            proposalData = JSON.parse(validatedFields.data.proposalJson);
        } catch (e) {
            dispatch({ type: 'GENERATION_FAILURE', payload: 'Invalid JSON format. Please check the content.' });
            return;
        }

        const validatedProposal = ProjectProposalSchema.safeParse(proposalData);
        if (!validatedProposal.success) {
            dispatch({ type: 'GENERATION_FAILURE', payload: 'The proposal data does not match the required structure.' });
            return;
        }

        const presentationAgent = AGENTS.find(a => a.id === 'generate-presentation');
        if (!presentationAgent) {
            dispatch({ type: 'GENERATION_FAILURE', payload: 'Presentation generation agent not configured.' });
            return;
        }
        
        if (!presentationAgent.isEnabled) {
            dispatch({ type: 'GENERATION_FAILURE', payload: 'The Presentation Generation agent is currently disabled.' });
            return;
        }

        startTransition(async () => {
            dispatch({ type: 'GENERATION_START' });
            try {
                if (!user) throw new Error("User not authenticated.");
                
                const selectedSections = Object.fromEntries(
                    Object.entries(reportState.sections).filter(([key]) => contextSelections.sections[key])
                ) as Record<SectionNameSchema, string>;
                const selectedDiagrams = Object.fromEntries(
                    Object.entries(reportState.diagrams).filter(([key]) => contextSelections.diagrams[key]).map(([key, value]) => [key, value.plantUmlCode])
                ) as Record<DiagramTypeSchema, string>;

                const result = await generatePresentation({
                    proposal: validatedProposal.data,
                    sections: selectedSections,
                    diagrams: selectedDiagrams,
                    prompt: typeof presentationAgent.prompt === 'string' ? presentationAgent.prompt : presentationAgent.prompt.base
                });

                await deductCredit(user.id, 1);
                dispatch({ type: 'GENERATION_SUCCESS', payload: result.slides });
                await fetchUser();
                toast({ title: 'Presentation Generated', description: `Created a ${result.slides.length}-slide presentation.` });
            } catch (e: any) {
                console.error(e);
                const errorMessage = e.message || 'An error occurred while generating the presentation. Please try again.';
                dispatch({ type: 'GENERATION_FAILURE', payload: errorMessage });
            }
        });
    };

    return {
        state,
        isGenerating,
        proposalJson,
        setProposalJson,
        reportState,
        setReportState,
        contextSelections,
        toggleContextSelection,
        handleGeneratePresentation
    };
}
