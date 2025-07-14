
'use client';

import { useState, useReducer, useTransition, useEffect, useCallback } from 'react';
import { z } from 'zod';
import { ProjectProposalSchema, DiagramTypeSchema, type DiagramType, SectionNameSchema } from '@/ai/schemas';
import { deductCredit } from '@/services/credit-service';
import { useAuth } from '@/context/AuthContext';
import { useToast } from './use-toast';
import { useBuilderState } from '@/context/BuilderStateContext';

export interface DiagramState {
  diagrams?: Partial<Record<DiagramType, { plantUmlCode: string; imageUrl: string; }>>;
  lastGenerated?: DiagramType;
  error?: string;
}

type Action =
  | { type: 'SET_STATE'; payload: DiagramState }
  | { type: 'GENERATION_START', payload: { diagramType: DiagramType } }
  | { type: 'GENERATION_SUCCESS', payload: { diagramType: DiagramType, plantUmlCode: string, imageUrl: string } }
  | { type: 'RENDER_SUCCESS', payload: { diagramType: DiagramType, plantUmlCode: string, imageUrl: string } }
  | { type: 'GENERATION_FAILURE', payload: string }
  | { type: 'UPDATE_DIAGRAM_CODE', payload: { key: DiagramType, code: string } }
  | { type: 'CLEAR_ERROR' };


const initialState: DiagramState = { diagrams: {} };

const diagramReducer = (state: DiagramState, action: Action) => {
    switch (action.type) {
        case 'SET_STATE':
            return { ...state, ...action.payload };
        case 'GENERATION_START':
            return { ...state, error: undefined };
        case 'GENERATION_SUCCESS':
            return {
                ...state,
                diagrams: {
                    ...state.diagrams,
                    [action.payload.diagramType]: {
                        plantUmlCode: action.payload.plantUmlCode,
                        imageUrl: action.payload.imageUrl
                    }
                },
                lastGenerated: action.payload.diagramType,
                error: undefined
            };
        case 'RENDER_SUCCESS':
            return {
                ...state,
                diagrams: {
                    ...state.diagrams,
                    [action.payload.diagramType]: {
                        ...state.diagrams![action.payload.diagramType]!,
                        imageUrl: action.payload.imageUrl,
                    }
                },
                lastGenerated: action.payload.diagramType,
                error: undefined
            };
        case 'GENERATION_FAILURE':
            return { ...state, error: action.payload };
        case 'UPDATE_DIAGRAM_CODE':
            if (!state.diagrams || !state.diagrams[action.payload.key]) return state;
            return {
                ...state,
                diagrams: {
                    ...state.diagrams,
                    [action.payload.key]: {
                        ...state.diagrams![action.payload.key]!,
                        plantUmlCode: action.payload.code
                    }
                }
            };
        case 'CLEAR_ERROR':
            return { ...state, error: undefined };
        default:
            return state;
    }
};

const GenerateDiagramSchema = z.object({
  proposalJson: z.string().min(1, 'Please paste the project proposal content.'),
  itemToGenerate: DiagramTypeSchema,
  guidelines: z.array(z.string()).optional(),
});


export function useDiagramBuilder() {
    const { state: builderState, dispatch: builderDispatch } = useBuilderState();
    const [state, dispatch] = useReducer(diagramReducer, initialState);
    const [isGenerating, startTransition] = useTransition();
    const [generatingDiagram, setGeneratingDiagram] = useState<DiagramType | null>(null);
    const [contextSelections, setContextSelections] = useState<Record<string, Record<string, boolean>>>({});
    
    const { user, fetchUser } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        if(builderState.diagrams) {
            dispatch({ type: 'SET_STATE', payload: { diagrams: builderState.diagrams } });
        }
    }, [builderState.diagrams]);

    const handleFormSubmit = (formData: FormData) => {
        const validatedFields = GenerateDiagramSchema.safeParse({
            proposalJson: builderState.proposalJson,
            itemToGenerate: formData.get('itemToGenerate'),
            guidelines: formData.getAll('guidelines[]').map(String),
        });

        if (!validatedFields.success) {
            const error = validatedFields.error.flatten().fieldErrors;
            const message = error.proposalJson?.[0] || error.itemToGenerate?.[0] || 'Invalid data.';
            dispatch({ type: 'GENERATION_FAILURE', payload: message });
            return;
        }

        const proposalData = builderState.proposal;
        if (!proposalData) {
            dispatch({ type: 'GENERATION_FAILURE', payload: 'The proposal data does not match the required structure.' });
            return;
        }
        
        const diagramToGenerate = validatedFields.data.itemToGenerate;
        setGeneratingDiagram(diagramToGenerate);
        dispatch({ type: 'GENERATION_START', payload: { diagramType: diagramToGenerate } });

        startTransition(async () => {
            try {
                if (!user) throw new Error("User not authenticated");

                const otherDiagrams: Record<string, string> = {};
                if (contextSelections[diagramToGenerate]) {
                    for (const key in contextSelections[diagramToGenerate]) {
                        if (contextSelections[diagramToGenerate][key] && state.diagrams?.[key as DiagramType]) {
                            otherDiagrams[key] = state.diagrams[key as DiagramType]!.plantUmlCode;
                        }
                    }
                }
                
                const response = await fetch('/api/generate-diagrams', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        proposal: proposalData,
                        diagramToGenerate,
                        otherDiagrams,
                        guidelines: validatedFields.data.guidelines,
                    }),
                });

                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'API request failed');
                
                await deductCredit(user.id, 1);
                
                builderDispatch({ type: 'GENERATION_SUCCESS', payload: {
                    diagrams: { ...builderState.diagrams, [diagramToGenerate]: { plantUmlCode: result.plantUmlCode, imageUrl: result.imageUrl }},
                    lastGenerated: diagramToGenerate,
                }});

                toast({ title: "Diagram Generated", description: `Successfully created ${diagramToGenerate} diagram.` });
                await fetchUser();
            } catch (e: any) {
                console.error(e);
                const errorMessage = e.message || 'An error occurred while generating the diagram.';
                dispatch({ type: 'GENERATION_FAILURE', payload: errorMessage });
                toast({ title: "Generation Failed", description: errorMessage, variant: 'destructive' });
            } finally {
                setGeneratingDiagram(null);
            }
        });
    };

    const handleDiagramCodeUpdate = useCallback((key: DiagramType, code: string) => {
        builderDispatch({ type: 'UPDATE_DIAGRAM_CODE', payload: { key, code } });
    }, [builderDispatch]);

    const handleDiagramUpdate = (diagramType: DiagramType, code: string) => {
        setGeneratingDiagram(diagramType);
        dispatch({ type: 'GENERATION_START', payload: { diagramType } });

        startTransition(async () => {
             try {
                const response = await fetch('/api/generate-diagrams', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ intent: 'update_diagram', plantUmlCode: code }),
                });

                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'API request failed');

                builderDispatch({
                    type: 'GENERATION_SUCCESS', payload: {
                        diagrams: { ...builderState.diagrams, [diagramType]: { plantUmlCode: result.plantUmlCode, imageUrl: result.imageUrl } },
                        lastGenerated: diagramType,
                    }
                });

                toast({ title: "Diagram Updated", description: "Successfully re-rendered diagram." });

            } catch (e: any) {
                console.error(e);
                const errorMessage = e.message || 'An error occurred while updating the diagram.';
                dispatch({ type: 'GENERATION_FAILURE', payload: errorMessage });
                toast({ title: "Update Failed", description: errorMessage, variant: 'destructive' });
            } finally {
                setGeneratingDiagram(null);
            }
        });
    }

    const toggleContextSelection = useCallback((parentKey: string, contextKey: string) => {
        setContextSelections(prev => {
            const newSelections = { ...prev };
            if (!newSelections[parentKey]) {
                newSelections[parentKey] = {};
            }
            newSelections[parentKey][contextKey] = !newSelections[parentKey][contextKey];
            return newSelections;
        });
    }, []);


    return {
        state,
        proposalJson: builderState.proposalJson,
        isAnythingGenerating: isGenerating || builderState.lastGenerated === 'proposal',
        generatingDiagram,
        handleFormSubmit,
        handleDiagramCodeUpdate,
        handleDiagramUpdate,
        contextSelections,
        toggleContextSelection,
    };
}
