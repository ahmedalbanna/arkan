
'use client';

import { useState, useReducer, useTransition } from 'react';
import { generateProposal } from '@/ai/flows/generate-proposal';
import { deductCredit } from '@/services/credit-service';
import { AGENTS } from '@/lib/agents';
import type { ProjectProposal } from '@/ai/schemas';
import { useAuth } from '@/context/AuthContext';

export interface ProposalGenerationState {
  proposal?: ProjectProposal;
  error?: string;
}

type Action =
  | { type: 'GENERATION_START' }
  | { type: 'GENERATION_SUCCESS'; payload: ProjectProposal }
  | { type: 'GENERATION_FAILURE'; payload: string };

const initialState: ProposalGenerationState = {};

function reducer(state: ProposalGenerationState, action: Action): ProposalGenerationState {
  switch (action.type) {
    case 'GENERATION_START':
      return { error: undefined };
    case 'GENERATION_SUCCESS':
      return { proposal: action.payload, error: undefined };
    case 'GENERATION_FAILURE':
      return { error: action.payload };
    default:
      return state;
  }
}

export function useProposalBuilder() {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [isGenerating, startTransition] = useTransition();
    const [projectIdea, setProjectIdea] = useState('');
    const { user, fetchUser } = useAuth();

    const handleGenerateProposal = () => {
        const proposalAgent = AGENTS.find(a => a.id === 'generate-proposal');
        if (!proposalAgent || !projectIdea) return;
        
        startTransition(async () => {
            dispatch({ type: 'GENERATION_START' });

            if (!proposalAgent.isEnabled) {
                dispatch({ type: 'GENERATION_FAILURE', payload: 'The Proposal Generation agent is currently disabled.' });
                return;
            }

            try {
                if (!user) throw new Error("User not authenticated.");
                await deductCredit(user.id, 1);

                const result = await generateProposal({ 
                    projectIdea,
                    prompt: typeof proposalAgent.prompt === 'string' ? proposalAgent.prompt : proposalAgent.prompt.base
                });
                
                dispatch({ type: 'GENERATION_SUCCESS', payload: result });
                await fetchUser();
            } catch (e: any) {
                console.error(e);
                const errorMessage = e.message || 'An error occurred while generating the proposal. Please try again.';
                dispatch({ type: 'GENERATION_FAILURE', payload: errorMessage });
            }
        });
    };

    return {
        state,
        isGenerating,
        projectIdea,
        setProjectIdea,
        handleGenerateProposal
    };
}
