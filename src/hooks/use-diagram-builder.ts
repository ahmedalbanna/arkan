
'use client';

import { useState, useReducer, useTransition, useEffect, useCallback } from 'react';
import { z } from 'zod';
import { DiagramTypeSchema, type DiagramType, SectionNameSchema, type SectionName } from '@/ai/schemas';
import { deductCredit } from '@/services/credit-service';
import { useAuth } from '@/context/AuthContext';
import { useToast } from './use-toast';
import { useBuilderState } from '@/context/BuilderStateContext';

export interface DiagramState {
  diagrams?: Partial<Record<DiagramType, { plantUmlCode: string; imageUrl: string; }>>;
  sections?: Partial<Record<SectionName, string>>;
  externalContext?: { fileName: string; content: string };
  lastGenerated?: DiagramType;
  error?: string;
  contextSelections: Record<string, Record<string, boolean>>;
}

type Action =
  | { type: 'SET_BUILDER_STATE'; payload: { sections: any, diagrams: any, contextSelections: any } }
  | { type: 'GENERATION_START', payload: { diagramType: DiagramType } }
  | { type: 'GENERATION_SUCCESS', payload: { diagramType: DiagramType, plantUmlCode: string, imageUrl: string } }
  | { type: 'GENERATION_FAILURE', payload: string }
  | { type: 'UPDATE_DIAGRAM_CODE', payload: { key: DiagramType, code: string } }
  | { type: 'TOGGLE_CONTEXT_SELECTION', payload: { parentKey: string; contextKey: string } }
  | { type: 'SET_EXTERNAL_CONTEXT', payload: { fileName: string; content: string } }
  | { type: 'REMOVE_EXTERNAL_CONTEXT' }
  | { type: 'CLEAR_ERROR' };


const initialState: DiagramState = { diagrams: {}, sections: {}, contextSelections: {} };

const diagramReducer = (state: DiagramState, action: Action): DiagramState => {
    switch (action.type) {
        case 'SET_BUILDER_STATE':
            return {
                ...state,
                sections: action.payload.sections,
                diagrams: action.payload.diagrams,
                contextSelections: action.payload.contextSelections,
            };
        case 'GENERATION_START':
            return { ...state, error: undefined };
        case 'GENERATION_SUCCESS':
             return {
                ...state,
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
        case 'TOGGLE_CONTEXT_SELECTION': {
          const { parentKey, contextKey } = action.payload;
          const newSelections = JSON.parse(JSON.stringify(state.contextSelections));
          if (!newSelections[parentKey]) newSelections[parentKey] = {};
          newSelections[parentKey][contextKey] = !newSelections[parentKey][contextKey];
          return { ...state, contextSelections: newSelections };
        }
        case 'SET_EXTERNAL_CONTEXT':
          return { ...state, externalContext: action.payload };
        case 'REMOVE_EXTERNAL_CONTEXT':
          const { externalContext, ...rest } = state;
          return { ...rest, sections: state.sections, diagrams: state.diagrams, contextSelections: state.contextSelections };
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
  externalContextContent: z.string().optional(),
});


export function useDiagramBuilder() {
    const { state: builderState, dispatch: builderDispatch } = useBuilderState();
    const [state, dispatch] = useReducer(diagramReducer, initialState);
    const [isGenerating, startTransition] = useTransition();
    const [generatingDiagram, setGeneratingDiagram] = useState<DiagramType | null>(null);
    
    const { user, fetchUser } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        dispatch({ type: 'SET_BUILDER_STATE', payload: { 
            sections: builderState.sections, 
            diagrams: builderState.diagrams,
            contextSelections: builderState.contextSelections,
        }});
    }, [builderState.sections, builderState.diagrams, builderState.contextSelections]);

    const handleFormSubmit = (formData: FormData) => {
        const validatedFields = GenerateDiagramSchema.safeParse({
            proposalJson: builderState.proposalJson,
            itemToGenerate: formData.get('itemToGenerate'),
            guidelines: formData.getAll('guidelines[]').map(String),
            externalContextContent: formData.get('externalContextContent') ?? undefined,
        });

        if (!validatedFields.success) {
            const error = validatedFields.error.flatten().fieldErrors;
            const errorMessage = Object.values(error).flat().join(', ');
            dispatch({ type: 'GENERATION_FAILURE', payload: `Invalid data: ${errorMessage}` });
            toast({ title: "Validation Error", description: `Invalid data: ${errorMessage}`, variant: 'destructive' });
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
                const otherSections: Record<string, string> = {};

                if (state.contextSelections[diagramToGenerate]) {
                    for (const fullContextKey in state.contextSelections[diagramToGenerate]) {
                        if (state.contextSelections[diagramToGenerate][fullContextKey]) {
                            if (fullContextKey.startsWith('diagram_')) {
                                const contextKey = fullContextKey.substring(8) as DiagramType;
                                if (builderState.diagrams?.[contextKey]) {
                                    otherDiagrams[contextKey] = builderState.diagrams[contextKey]!.plantUmlCode;
                                }
                            } else if (fullContextKey.startsWith('section_')) {
                                const contextKey = fullContextKey.substring(8) as SectionName;
                                if (builderState.sections?.[contextKey]) {
                                    otherSections[contextKey] = builderState.sections[contextKey]!;
                                }
                            }
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
                        otherSections,
                        guidelines: validatedFields.data.guidelines,
                        externalContextContent: validatedFields.data.externalContextContent,
                    }),
                });

                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'API request failed');
                
                await deductCredit(user.id, 1);
                
                const successPayload = {
                    diagrams: { ...builderState.diagrams, [diagramToGenerate]: { plantUmlCode: result.plantUmlCode, imageUrl: result.imageUrl }},
                    lastGenerated: diagramToGenerate,
                };

                builderDispatch({ type: 'GENERATION_SUCCESS', payload: successPayload });
                dispatch({ type: 'GENERATION_SUCCESS', payload: { diagramType: diagramToGenerate, ...result }});


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

                const successPayload = {
                    diagrams: { ...builderState.diagrams, [diagramType]: { plantUmlCode: result.plantUmlCode, imageUrl: result.imageUrl } },
                    lastGenerated: diagramType,
                };
                builderDispatch({ type: 'GENERATION_SUCCESS', payload: successPayload });
                dispatch({ type: 'GENERATION_SUCCESS', payload: { diagramType, ...result }});

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

    const toggleContextSelection = (parentKey: string, contextKey: string) => dispatch({ type: 'TOGGLE_CONTEXT_SELECTION', payload: { parentKey, contextKey } });
    const setExternalContext = (fileName: string, content: string) => dispatch({ type: 'SET_EXTERNAL_CONTEXT', payload: { fileName, content } });
    const removeExternalContext = () => dispatch({ type: 'REMOVE_EXTERNAL_CONTEXT' });


    return {
        state,
        isAnythingGenerating: isGenerating || builderState.lastGenerated === 'proposal',
        generatingDiagram,
        handleFormSubmit,
        handleDiagramCodeUpdate,
        handleDiagramUpdate,
        contextSelections: state.contextSelections,
        toggleContextSelection,
        setExternalContext,
        removeExternalContext,
    };
}
