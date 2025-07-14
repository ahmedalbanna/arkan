
'use client';

import { useState, useReducer, useTransition, useEffect, useCallback } from 'react';
import { generateProposal } from '@/ai/flows/generate-proposal';
import { deductCredit } from '@/services/credit-service';
import { useAuth } from '@/context/AuthContext';
import { useToast } from './use-toast';
import { z } from 'zod';
import type { ProjectProposal } from '@/ai/schemas';
import { templates as proposalTemplates, type ProposalTemplateKey, type ProposalTemplate } from '@/lib/proposal-templates';

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
  prompt: z.string(),
});


export function useProposalBuilder() {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [isGenerating, startTransition] = useTransition();
    const [projectIdea, setProjectIdea] = useState('');
    const { user, fetchUser } = useAuth();
    const { toast } = useToast();
    
    // Template state
    const [templates, setTemplates] = useState<Record<ProposalTemplateKey, ProposalTemplate>>(proposalTemplates);
    const [selectedTemplate, setSelectedTemplate] = useState<ProposalTemplateKey>('default');
    
    // Guideline state
    const [customGuidelines, setCustomGuidelines] = useState<string[]>([]);
    const [customGuidelineInput, setCustomGuidelineInput] = useState('');

    const handleTemplateChange = useCallback((key: ProposalTemplateKey) => {
        setSelectedTemplate(key);
    }, []);
    
    const handleAddCustomGuideline = useCallback(() => {
        const newGuideline = customGuidelineInput.trim();
        if (newGuideline) {
            setCustomGuidelines(prev => [...prev, newGuideline]);
            setCustomGuidelineInput('');
        }
    }, [customGuidelineInput]);

    const handleRemoveCustomGuideline = useCallback((indexToRemove: number) => {
        setCustomGuidelines(prev => prev.filter((_, index) => index !== indexToRemove));
    }, []);


    const handleFormSubmit = () => {
        const currentTemplate = templates[selectedTemplate];
        if (!currentTemplate) {
            dispatch({ type: 'GENERATION_FAILURE', payload: 'Selected template not found.' });
            return;
        }

        const allGuidelines = [...(currentTemplate.guidelines || []), ...customGuidelines];
        let fullPrompt = currentTemplate.prompt;
        
        if (allGuidelines.length > 0) {
            fullPrompt += '\n\nAdditionally, please adhere to the following guidelines:\n' + allGuidelines.map(g => `- ${g}`).join('\n');
        }

        const validatedFields = GenerateProposalSchema.safeParse({
            projectIdea,
            guidelines: allGuidelines,
            prompt: fullPrompt
        });

        if (!validatedFields.success) {
            dispatch({ type: 'GENERATION_FAILURE', payload: 'Project idea cannot be empty.' });
            return;
        }
        
        startTransition(async () => {
            dispatch({ type: 'GENERATION_START' });

            try {
                if (!user) throw new Error("User not authenticated.");

                const response = await fetch('/api/generate-proposal', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        projectIdea: validatedFields.data.projectIdea,
                        prompt: validatedFields.data.prompt
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
        handleFormSubmit,
        // Template related
        templates,
        selectedTemplate,
        handleTemplateChange,
        // Guideline related
        customGuidelines,
        setCustomGuidelines,
        customGuidelineInput,
        setCustomGuidelineInput,
        handleAddCustomGuideline,
        handleRemoveCustomGuideline,
    };
}
