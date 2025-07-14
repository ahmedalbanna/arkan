
'use client';

import { useState, useReducer, useTransition } from 'react';
import { generateProposal } from '@/ai/flows/generate-proposal';
import { deductCredit } from '@/services/credit-service';
import { AGENTS } from '@/lib/agents';
import type { ProjectProposal, ProjectProposalSchema } from '@/ai/schemas';
import { useAuth } from '@/context/AuthContext';
import { useToast } from './use-toast';
import { z } from 'zod';

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
      return { error: undefined, proposal: undefined };
    case 'GENERATION_SUCCESS':
      return { proposal: action.payload, error: undefined };
    case 'GENERATION_FAILURE':
      return { error: action.payload, proposal: undefined };
    default:
      return state;
  }
}

const GenerateProposalSchema = z.object({
  projectIdea: z.string().min(1, 'Project idea cannot be empty.'),
  guidelines: z.array(z.string()).optional(),
});


export function useProposalBuilder() {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [isGenerating, startTransition] = useTransition();
    const [projectIdea, setProjectIdea] = useState('');
    const [customGuidelines, setCustomGuidelines] = useState<string[]>([]);
    const { user, fetchUser } = useAuth();
    const { toast } = useToast();

    const handleFormSubmit = () => {
        const formData = new FormData();
        formData.set('projectIdea', projectIdea);
        customGuidelines.forEach(g => formData.append('guidelines[]', g));
        
        const validatedFields = GenerateProposalSchema.safeParse(Object.fromEntries(formData));

        if (!validatedFields.success) {
            dispatch({ type: 'GENERATION_FAILURE', payload: 'Project idea cannot be empty.' });
            return;
        }
        
        const proposalAgent = AGENTS.find(a => a.id === 'generate-proposal');
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

                // Construct the prompt on the client side
                let fullPrompt = typeof proposalAgent.prompt === 'string' 
                    ? proposalAgent.prompt 
                    : proposalAgent.prompt.base;

                if (validatedFields.data.guidelines && validatedFields.data.guidelines.length > 0) {
                    fullPrompt += '\n\nAdditionally, please adhere to the following custom guidelines:\n' + validatedFields.data.guidelines.map(g => `- ${g}`).join('\n');
                }
                
                // Use the API route for proposal generation
                const response = await fetch('/api/generate-proposal', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        projectIdea: validatedFields.data.projectIdea,
                        prompt: fullPrompt // Send the fully constructed prompt
                    }),
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
        customGuidelines,
        setCustomGuidelines,
        handleFormSubmit
    };
}
