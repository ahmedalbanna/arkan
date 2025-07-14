
'use client';

import { useState, useReducer, useTransition } from 'react';
import { z } from 'zod';
import { generatePresentation } from '@/ai/flows/generate-presentation';
import { ProjectProposalSchema, type PresentationSlide } from '@/ai/schemas';
import { AGENTS } from '@/lib/agents';
import { deductCredit } from '@/services/credit-service';
import { useAuth } from '@/context/AuthContext';
import { useToast } from './use-toast';

export interface PresentationState {
  slides?: PresentationSlide[];
  error?: string;
}

type Action =
  | { type: 'GENERATION_START' }
  | { type: 'GENERATION_SUCCESS'; payload: PresentationSlide[] }
  | { type: 'GENERATION_FAILURE'; payload: string };

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
});

export function usePresentationBuilder() {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [isGenerating, startTransition] = useTransition();
    const [proposalJson, setProposalJson] = useState('');
    const { user, fetchUser } = useAuth();
    const { toast } = useToast();

    const handleGeneratePresentation = () => {
        const validatedFields = GeneratePresentationSchema.safeParse({ proposalJson });

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
                await deductCredit(user.id, 1);

                const result = await generatePresentation({
                    proposal: validatedProposal.data,
                    prompt: typeof presentationAgent.prompt === 'string' ? presentationAgent.prompt : presentationAgent.prompt.base
                });

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
        handleGeneratePresentation
    };
}
