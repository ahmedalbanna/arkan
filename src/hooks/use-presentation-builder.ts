
'use client';

import { useState, useReducer, useTransition, useCallback, useEffect } from 'react';
import { z } from 'zod';
import { type PresentationSlide, type SectionName, type DiagramType } from '@/ai/schemas';
import { AGENTS } from '@/lib/agents';
import { deductCredit } from '@/services/credit-service';
import { useAuth } from '@/context/AuthContext';
import { useToast } from './use-toast';
import { useBuilderState } from '@/context/BuilderStateContext';
import { presentationConfig } from '@/lib/report-config';
import type { AgentPrompt } from '@/lib/agents';

const PRESENTATION_KEY = 'arkan-presentation-history';

export interface Presentation {
    id: string;
    name: string;
    slides: PresentationSlide[];
}

export interface PresentationState {
  error?: string;
  isLoaded: boolean;
  activePresentationId?: string | null;
  guidelineState: {
    checked: Record<number, boolean>;
    custom: string[];
  };
  customGuidelineInput: string;
}

type Action =
  | { type: 'GENERATION_START' }
  | { type: 'GENERATION_SUCCESS'; payload: { newPresentation: Presentation } }
  | { type: 'GENERATION_FAILURE'; payload: string }
  | { type: 'SET_IS_LOADED' }
  | { type: 'SET_ACTIVE_PRESENTATION'; payload: string | null }
  | { type: 'SET_GUIDELINE_STATE'; payload: PresentationState['guidelineState'] }
  | { type: 'SET_CUSTOM_GUIDELINE_INPUT'; payload: string }
  ;

const getInitialGuidelineState = (): PresentationState['guidelineState'] => {
    const agent = AGENTS.find(a => a.id === presentationConfig.presentation.agentId);
    const prompt = agent?.prompt as AgentPrompt | undefined;
    const checked: Record<number, boolean> = {};
    if (prompt?.guidelines) {
        prompt.guidelines.forEach((g, i) => {
            checked[i] = g.isDefault;
        });
    }
    return { checked, custom: [] };
};


const initialState: PresentationState = {
    isLoaded: false,
    activePresentationId: null,
    guidelineState: getInitialGuidelineState(),
    customGuidelineInput: '',
};

function reducer(state: PresentationState, action: Action): PresentationState {
  switch (action.type) {
    case 'GENERATION_START':
      return { ...state, error: undefined };
    case 'GENERATION_SUCCESS':
      return { ...state, error: undefined, activePresentationId: action.payload.newPresentation.id };
    case 'GENERATION_FAILURE':
      return { ...state, error: action.payload };
    case 'SET_IS_LOADED':
        return { ...state, isLoaded: true };
    case 'SET_ACTIVE_PRESENTATION':
        return { ...state, activePresentationId: action.payload };
    case 'SET_GUIDELINE_STATE':
        return { ...state, guidelineState: action.payload };
    case 'SET_CUSTOM_GUIDELINE_INPUT':
        return { ...state, customGuidelineInput: action.payload };
    default:
      return state;
  }
}

export function usePresentationBuilder() {
    const { state: builderState, dispatch: builderDispatch } = useBuilderState();
    const [state, dispatch] = useReducer(reducer, initialState);
    const [isGenerating, startTransition] = useTransition();
    const { user, fetchUser } = useAuth();
    const { toast } = useToast();

    // Load from local storage on initial mount
    useEffect(() => {
        try {
            const storedHistory = localStorage.getItem(PRESENTATION_KEY);
            if (storedHistory) {
                const presentations = JSON.parse(storedHistory);
                if (Array.isArray(presentations) && presentations.length > 0) {
                    builderDispatch({ type: 'SET_STATE', payload: { presentation: { history: presentations } } });
                    dispatch({ type: 'SET_ACTIVE_PRESENTATION', payload: presentations[0].id });
                }
            }
        } catch (error) {
            console.error('Failed to load presentation history from localStorage', error);
        }
        dispatch({ type: 'SET_IS_LOADED' });
    }, [builderDispatch]);

    // Save to local storage whenever history changes
    useEffect(() => {
        try {
            if (builderState.presentation?.history && builderState.presentation.history.length > 0) {
                localStorage.setItem(PRESENTATION_KEY, JSON.stringify(builderState.presentation.history));
            } else if (builderState.proposal === null) {
                // If the session is new (proposal is null), clear storage.
                localStorage.removeItem(PRESENTATION_KEY);
            }
        } catch (error) {
            console.error('Failed to save presentation history to localStorage', error);
        }
    }, [builderState.presentation?.history, builderState.proposal]);


    const [contextSelections, setContextSelections] = useState({ sections: {} as Record<string, boolean>, diagrams: {} as Record<string, boolean> });
    
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
    
    // --- Guideline Handlers ---
    const handleGuidelineToggle = useCallback((index: number, checked: boolean) => {
        dispatch({
            type: 'SET_GUIDELINE_STATE',
            payload: {
                ...state.guidelineState,
                checked: { ...state.guidelineState.checked, [index]: checked }
            }
        });
    }, [state.guidelineState]);

    const handleCustomGuidelineChange = useCallback((value: string) => {
        dispatch({ type: 'SET_CUSTOM_GUIDELINE_INPUT', payload: value });
    }, []);

    const handleAddCustomGuideline = useCallback(() => {
        const newGuideline = state.customGuidelineInput.trim();
        if (newGuideline) {
            dispatch({
                type: 'SET_GUIDELINE_STATE',
                payload: { ...state.guidelineState, custom: [...state.guidelineState.custom, newGuideline] }
            });
            dispatch({ type: 'SET_CUSTOM_GUIDELINE_INPUT', payload: '' });
        }
    }, [state.customGuidelineInput, state.guidelineState]);
    
    const handleRemoveCustomGuideline = useCallback((indexToRemove: number) => {
        const newCustom = state.guidelineState.custom.filter((_, i) => i !== indexToRemove);
        dispatch({ type: 'SET_GUIDELINE_STATE', payload: { ...state.guidelineState, custom: newCustom } });
    }, [state.guidelineState]);


    const handleGeneratePresentation = (guidelines: string[]) => {
        
        if (!builderState.proposal) {
            dispatch({ type: 'GENERATION_FAILURE', payload: 'A valid proposal is required.' });
            return;
        }

        const presentationAgent = AGENTS.find(a => a.id === 'generate-presentation');
        if (!presentationAgent || !presentationAgent.isEnabled) {
            const errorMsg = 'Presentation generation agent is not configured or is disabled.';
            dispatch({ type: 'GENERATION_FAILURE', payload: errorMsg });
            toast({ title: 'Agent Error', description: errorMsg, variant: 'destructive' });
            return;
        }
        
        startTransition(async () => {
            dispatch({ type: 'GENERATION_START' });
            builderDispatch({ type: 'GENERATION_START', payload: { item: 'presentation' } });

            try {
                if (!user) throw new Error("User not authenticated.");
                
                const selectedSections = Object.fromEntries(
                    Object.entries(builderState.sections).filter(([key]) => contextSelections.sections[key])
                ) as Record<SectionName, string>;
                
                const selectedDiagrams = Object.fromEntries(
                    Object.entries(builderState.diagrams).filter(([key]) => contextSelections.diagrams[key]).map(([key, value]) => [key, value.plantUmlCode])
                ) as Record<DiagramType, string>;

                const response = await fetch('/api/generate-presentation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        proposal: builderState.proposal,
                        sections: selectedSections,
                        diagrams: selectedDiagrams,
                        guidelines: guidelines,
                    })
                });
                
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || "Failed to generate presentation.");


                await deductCredit(user.id, 1);
                
                const newPresentation: Presentation = {
                    id: new Date().toISOString(),
                    name: `Presentation - ${new Date().toLocaleTimeString()}`,
                    slides: result.slides,
                };

                const newHistory = [newPresentation, ...(builderState.presentation?.history || [])];

                dispatch({ type: 'GENERATION_SUCCESS', payload: { newPresentation } });
                builderDispatch({ type: 'SET_STATE', payload: { presentation: { history: newHistory } } });
                builderDispatch({ type: 'GENERATION_SUCCESS', payload: { lastGenerated: 'presentation' } });

                await fetchUser();
                toast({ title: 'Presentation Generated', description: `Created a ${result.slides.length}-slide presentation.` });
            } catch (e: any) {
                console.error(e);
                const errorMessage = e.message || 'An error occurred while generating the presentation. Please try again.';
                dispatch({ type: 'GENERATION_FAILURE', payload: errorMessage });
                builderDispatch({ type: 'GENERATION_ERROR', payload: { error: errorMessage, item: 'presentation' } });
                toast({ title: "Generation Failed", description: errorMessage, variant: 'destructive' });
            }
        });
    };

    const presentations = builderState.presentation?.history || [];
    const activePresentation = presentations.find(p => p.id === state.activePresentationId);

    return {
        state,
        presentations,
        activePresentation,
        setActivePresentationId: (id: string | null) => dispatch({ type: 'SET_ACTIVE_PRESENTATION', payload: id }),
        isGenerating: isGenerating || builderState.lastGenerated === 'presentation',
        proposal: builderState.proposal,
        sections: builderState.sections,
        diagrams: builderState.diagrams,
        contextSelections,
        toggleContextSelection,
        handleGeneratePresentation,
        // Guideline handlers
        guidelineState: state.guidelineState,
        onGuidelineToggle: handleGuidelineToggle,
        customGuidelineInput: state.customGuidelineInput,
        onCustomGuidelineChange: handleCustomGuidelineChange,
        onAddCustomGuideline: handleAddCustomGuideline,
        onRemoveCustomGuideline: handleRemoveCustomGuideline,
    };
}
