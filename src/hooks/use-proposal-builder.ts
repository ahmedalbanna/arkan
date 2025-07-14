
'use client';

import { useState, useReducer, useTransition, useEffect, useCallback } from 'react';
import { generateProposal } from '@/ai/flows/generate-proposal';
import { deductCredit } from '@/services/credit-service';
import { useAuth } from '@/context/AuthContext';
import { useToast } from './use-toast';
import { z } from 'zod';
import type { ProjectProposal } from '@/ai/schemas';
import { templates as proposalTemplates, type ProposalTemplateKey, type ProposalTemplate } from '@/lib/proposal-templates';

const STORAGE_KEY = 'arkan-proposal-state';

export interface ProposalGenerationState {
  proposal?: ProjectProposal;
  error?: string;
  projectIdea?: string;
  selectedTemplate?: ProposalTemplateKey;
  customGuidelines?: string[];
}

type Action =
  | { type: 'SET_ENTIRE_STATE'; payload: ProposalGenerationState }
  | { type: 'GENERATION_START'; payload: { projectIdea: string } }
  | { type: 'GENERATION_SUCCESS'; payload: ProjectProposal }
  | { type: 'GENERATION_FAILURE'; payload: string }
  | { type: 'SET_PROJECT_IDEA'; payload: string }
  | { type: 'SET_SELECTED_TEMPLATE'; payload: ProposalTemplateKey }
  | { type: 'SET_CUSTOM_GUIDELINES'; payload: string[] };

const initialState: ProposalGenerationState = {
  projectIdea: '',
  selectedTemplate: 'default',
  customGuidelines: [],
};

function reducer(state: ProposalGenerationState, action: Action): ProposalGenerationState {
  switch (action.type) {
    case 'SET_ENTIRE_STATE':
        return { ...state, ...action.payload };
    case 'GENERATION_START':
      return { ...state, projectIdea: action.payload.projectIdea, error: undefined, proposal: undefined };
    case 'GENERATION_SUCCESS':
      return { ...state, proposal: action.payload, error: undefined };
    case 'GENERATION_FAILURE':
      return { ...state, error: action.payload, proposal: undefined };
    case 'SET_PROJECT_IDEA':
        return { ...state, projectIdea: action.payload };
    case 'SET_SELECTED_TEMPLATE':
        return { ...state, selectedTemplate: action.payload };
    case 'SET_CUSTOM_GUIDELINES':
        return { ...state, customGuidelines: action.payload };
    default:
      return state;
  }
}

const GenerateProposalSchema = z.object({
  projectIdea: z.string().min(1, 'Project idea cannot be empty.'),
  prompt: z.string(),
});


export function useProposalBuilder() {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [isGenerating, startTransition] = useTransition();
    const { user, fetchUser } = useAuth();
    const { toast } = useToast();
    const [isLoaded, setIsLoaded] = useState(false);
    
    // Template state (static, not part of the persisted state)
    const [templates] = useState<Record<ProposalTemplateKey, ProposalTemplate>>(proposalTemplates);

    const [customGuidelineInput, setCustomGuidelineInput] = useState('');

    useEffect(() => {
        try {
            const savedState = localStorage.getItem(STORAGE_KEY);
            if(savedState) {
                dispatch({ type: 'SET_ENTIRE_STATE', payload: JSON.parse(savedState) });
            }
        } catch (e) {
            console.error('Failed to load proposal state from storage', e);
        }
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (isLoaded) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            } catch (e) {
                console.error('Failed to save proposal state to storage', e);
            }
        }
    }, [state, isLoaded]);

    const setProjectIdea = (idea: string) => dispatch({ type: 'SET_PROJECT_IDEA', payload: idea });
    const handleTemplateChange = (key: ProposalTemplateKey) => dispatch({ type: 'SET_SELECTED_TEMPLATE', payload: key });

    const handleAddCustomGuideline = useCallback(() => {
        const newGuideline = customGuidelineInput.trim();
        if (newGuideline) {
            const newGuidelines = [...(state.customGuidelines || []), newGuideline];
            dispatch({ type: 'SET_CUSTOM_GUIDELINES', payload: newGuidelines });
            setCustomGuidelineInput('');
        }
    }, [customGuidelineInput, state.customGuidelines]);

    const handleRemoveCustomGuideline = useCallback((indexToRemove: number) => {
        const newGuidelines = (state.customGuidelines || []).filter((_, index) => index !== indexToRemove);
        dispatch({ type: 'SET_CUSTOM_GUIDELINES', payload: newGuidelines });
    }, [state.customGuidelines]);


    const handleFormSubmit = () => {
        const selectedTemplateKey = state.selectedTemplate || 'default';
        const currentTemplate = templates[selectedTemplateKey];
        const projectIdea = state.projectIdea || '';

        if (!currentTemplate) {
            dispatch({ type: 'GENERATION_FAILURE', payload: 'Selected template not found.' });
            return;
        }

        const allGuidelines = [...(currentTemplate.guidelines || []), ...(state.customGuidelines || [])];
        let fullPrompt = currentTemplate.prompt;
        
        if (allGuidelines.length > 0) {
            fullPrompt += '\n\nAdditionally, please adhere to the following guidelines:\n' + allGuidelines.map(g => `- ${g}`).join('\n');
        }

        const validatedFields = GenerateProposalSchema.safeParse({
            projectIdea: projectIdea,
            prompt: fullPrompt
        });

        if (!validatedFields.success) {
            dispatch({ type: 'GENERATION_FAILURE', payload: 'Project idea cannot be empty.' });
            return;
        }
        
        startTransition(async () => {
            dispatch({ type: 'GENERATION_START', payload: { projectIdea } });

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
        projectIdea: state.projectIdea || '',
        setProjectIdea,
        handleFormSubmit,
        // Template related
        templates,
        selectedTemplate: state.selectedTemplate || 'default',
        handleTemplateChange,
        // Guideline related
        customGuidelines: state.customGuidelines || [],
        customGuidelineInput,
        setCustomGuidelineInput,
        handleAddCustomGuideline,
        handleRemoveCustomGuideline,
    };
}
