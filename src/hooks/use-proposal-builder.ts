
'use client';

import { useState, useReducer, useTransition } from 'react';
import { generateProposal } from '@/ai/flows/generate-proposal';
import { deductCredit } from '@/services/credit-service';
import { AGENTS } from '@/lib/agents';
import type { ProjectProposal } from '@/ai/schemas';
import { useAuth } from '@/context/AuthContext';
import { useToast } from './use-toast';

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
    const { toast } = useToast();

    const handleGenerateProposal = async () => {
        const proposalAgent = AGENTS.find(a => a.id === 'generate-proposal');
        if (!projectIdea.trim()) {
            dispatch({ type: 'GENERATION_FAILURE', payload: 'Project idea cannot be empty.' });
            return;
        }
        if (!proposalAgent) {
            dispatch({ type: 'GENERATION_FAILURE', payload: 'Proposal agent not found.' });
            return;
        };
        
        startTransition(async () => {
            dispatch({ type: 'GENERATION_START' });

            if (!proposalAgent.isEnabled) {
                dispatch({ type: 'GENERATION_FAILURE', payload: 'The Proposal Generation agent is currently disabled.' });
                return;
            }

            try {
                if (!user) throw new Error("User not authenticated.");
                // Use the API route for proposal generation
                const response = await fetch('/api/generate-proposal', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ projectIdea }),
                });

                const result = await response.json();

                if (!response.ok) {
                    const errorMessage = result.errors?.projectIdea || result.message || 'An unknown error occurred.';
                    throw new Error(errorMessage);
                }

                await deductCredit(user.id, 1);
                
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
