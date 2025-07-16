
'use client';

import { useState, useReducer, useTransition, useCallback, useEffect } from 'react';
import { z } from 'zod';
import { generatePresentation } from '@/ai/flows/generate-presentation';
import { ProjectProposalSchema, type PresentationSlide, type SectionName, type DiagramType } from '@/ai/schemas';
import { AGENTS } from '@/lib/agents';
import { deductCredit } from '@/services/credit-service';
import { useAuth } from '@/context/AuthContext';
import { useToast } from './use-toast';
import { useBuilderState } from '@/context/BuilderStateContext';

const PRESENTATION_KEY = 'arkan-presentation';

export interface PresentationState {
  slides?: PresentationSlide[];
  error?: string;
  isLoaded: boolean;
}

type Action =
  | { type: 'GENERATION_START' }
  | { type: 'GENERATION_SUCCESS'; payload: PresentationSlide[] }
  | { type: 'GENERATION_FAILURE'; payload: string }
  | { type: 'LOAD_FROM_STORAGE'; payload: PresentationSlide[] };

const initialState: PresentationState = {
    isLoaded: false,
};

function reducer(state: PresentationState, action: Action): PresentationState {
  switch (action.type) {
    case 'GENERATION_START':
      return { ...state, slides: undefined, error: undefined };
    case 'GENERATION_SUCCESS':
      return { ...state, slides: action.payload, error: undefined };
    case 'GENERATION_FAILURE':
      return { ...state, error: action.payload };
    case 'LOAD_FROM_STORAGE':
        return { ...state, slides: action.payload, isLoaded: true };
    default:
      return state;
  }
}

const GeneratePresentationSchema = z.object({
  proposal: ProjectProposalSchema
});


export function usePresentationBuilder() {
    const { state: builderState } = useBuilderState();
    const [state, dispatch] = useReducer(reducer, initialState);
    const [isGenerating, startTransition] = useTransition();
    const { user, fetchUser } = useAuth();
    const { toast } = useToast();

    // Load from local storage on initial mount
    useEffect(() => {
        try {
            const storedPresentation = localStorage.getItem(PRESENTATION_KEY);
            if (storedPresentation) {
                dispatch({ type: 'LOAD_FROM_STORAGE', payload: JSON.parse(storedPresentation) });
            } else {
                dispatch({ type: 'LOAD_FROM_STORAGE', payload: [] });
            }
        } catch (e) {
            console.error('Failed to load presentation from storage', e);
            dispatch({ type: 'LOAD_FROM_STORAGE', payload: [] });
        }
    }, []);


    // State for context selections
    const [contextSelections, setContextSelections] = useState({ sections: {} as Record<string, boolean>, diagrams: {} as Record<string, boolean> });
    
    // Automatically select all available content when it changes
    useEffect(() => {
        const newSelections = { sections: {} as Record<string, boolean>, diagrams: {} as Record<string, boolean> };
        Object.keys(builderState.sections).forEach(key => newSelections.sections[key] = true);
        Object.keys(builderState.diagrams).forEach(key => newSelections.diagrams[key] = true);
        setContextSelections(newSelections);
    }, [builderState.sections, builderState.diagrams]);


    const toggleContextSelection = useCallback((type: 'sections' | 'diagrams', key: string) => {
        setContextSelections(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [key]: !prev[type][key]
            }
        }));
    }, []);

    const handleGeneratePresentation = () => {
        
        const validatedFields = GeneratePresentationSchema.safeParse({ 
            proposal: builderState.proposal
        });

        if (!validatedFields.success) {
            dispatch({ type: 'GENERATION_FAILURE', payload: 'A valid proposal is required.' });
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
                    Object.entries(builderState.sections).filter(([key]) => contextSelections.sections[key])
                ) as Record<SectionName, string>;
                
                const selectedDiagrams = Object.fromEntries(
                    Object.entries(builderState.diagrams).filter(([key]) => contextSelections.diagrams[key]).map(([key, value]) => [key, value.plantUmlCode])
                ) as Record<DiagramType, string>;

                const result = await generatePresentation({
                    proposal: validatedFields.data.proposal,
                    sections: selectedSections,
                    diagrams: selectedDiagrams,
                    prompt: typeof presentationAgent.prompt === 'string' ? presentationAgent.prompt : presentationAgent.prompt.base
                });

                await deductCredit(user.id, 1);
                dispatch({ type: 'GENERATION_SUCCESS', payload: result.slides });
                localStorage.setItem(PRESENTATION_KEY, JSON.stringify(result.slides)); // Save to local storage
                await fetchUser();
                toast({ title: 'Presentation Generated', description: `Created a ${result.slides.length}-slide presentation.` });
            } catch (e: any) {
                console.error(e);
                const errorMessage = e.message || 'An error occurred while generating the presentation. Please try again.';
                dispatch({ type: 'GENERATION_FAILURE', payload: errorMessage });
                toast({ title: "Generation Failed", description: errorMessage, variant: 'destructive' });
            }
        });
    };

    return {
        state,
        isGenerating,
        proposal: builderState.proposal,
        sections: builderState.sections,
        diagrams: builderState.diagrams,
        contextSelections,
        toggleContextSelection,
        handleGeneratePresentation
    };
}
