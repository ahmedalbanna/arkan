
'use client';

import { useState, useReducer, useTransition, useEffect, useCallback } from 'react';
import { generateProposal } from '@/ai/flows/generate-proposal';
import { deductCredit } from '@/services/credit-service';
import { useAuth } from '@/context/AuthContext';
import { useToast } from './use-toast';
import { z } from 'zod';
import type { ProjectProposal } from '@/ai/schemas';
import { templates as proposalTemplates, type ProposalTemplateKey, type ProposalTemplate } from '@/lib/proposal-templates';
import { useBuilderState } from '@/context/BuilderStateContext';


export interface ProposalGenerationState {
  error?: string;
  projectIdea?: string;
  selectedTemplate?: ProposalTemplateKey;
  customGuidelines?: string[];
}

type Action =
  | { type: 'SET_ERROR'; payload: string | undefined }
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
    case 'SET_ERROR':
        return { ...state, error: action.payload };
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
    const { state: builderState, dispatch: builderDispatch, isGeneratingProposal } = useBuilderState();
    const [state, dispatch] = useReducer(reducer, initialState);
    
    // Template state (static, not part of the persisted state)
    const [templates] = useState<Record<ProposalTemplateKey, ProposalTemplate>>(proposalTemplates);

    const [customGuidelineInput, setCustomGuidelineInput] = useState('');

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
            dispatch({ type: 'SET_ERROR', payload: 'Selected template not found.' });
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
            dispatch({ type: 'SET_ERROR', payload: 'Project idea cannot be empty.' });
            return;
        }
        
        // Use the global dispatch now
        builderDispatch({
            type: 'GENERATE_PROPOSAL',
            payload: {
                projectIdea: validatedFields.data.projectIdea,
                prompt: validatedFields.data.prompt
            }
        });
    };

    return {
        state: { ...state, proposal: builderState.proposal, error: builderState.error },
        isGenerating: isGeneratingProposal,
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
