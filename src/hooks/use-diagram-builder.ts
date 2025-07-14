
'use client';

import { useState, useReducer, useTransition, useEffect } from 'react';
import { z } from 'zod';
import { ProjectProposalSchema, DiagramTypeSchema, type DiagramType } from '@/ai/schemas';
import { deductCredit } from '@/services/credit-service';
import { useAuth } from '@/context/AuthContext';
import { useToast } from './use-toast';

export interface DiagramState {
  plantUmlCodes?: Partial<Record<DiagramType, string>>;
  imageUrl?: string;
  currentPlantUmlCode?: string;
  lastGenerated?: DiagramType;
  error?: string;
}

type Action =
  | { type: 'GENERATION_START', payload: { diagramType: DiagramType } }
  | { type: 'GENERATION_SUCCESS', payload: DiagramState }
  | { type: 'GENERATION_FAILURE', payload: string }
  | { type: 'RENDER_START' }
  | { type: 'RENDER_SUCCESS', payload: { imageUrl: string, currentPlantUmlCode: string, diagramType: DiagramType } };

const initialState: DiagramState = { plantUmlCodes: {} };

function reducer(state: DiagramState, action: Action): DiagramState {
  switch (action.type) {
    case 'GENERATION_START':
      return { ...state, error: undefined };
    case 'GENERATION_SUCCESS':
      return { ...state, ...action.payload, error: undefined };
    case 'GENERATION_FAILURE':
      return { ...state, error: action.payload };
    case 'RENDER_START':
        return { ...state, error: undefined };
    case 'RENDER_SUCCESS':
        const { imageUrl, currentPlantUmlCode, diagramType } = action.payload;
        return {
            ...state,
            imageUrl,
            currentPlantUmlCode,
            lastGenerated: diagramType,
            plantUmlCodes: {
                ...state.plantUmlCodes,
                [diagramType]: currentPlantUmlCode,
            },
            error: undefined
        }
    default:
      return state;
  }
}

const GenerateDiagramSchema = z.object({
  proposalJson: z.string().min(1, 'Please paste the project proposal content.'),
  diagramToGenerate: DiagramTypeSchema,
});

const RenderDiagramSchema = z.object({
  plantUmlCode: z.string(),
  diagramType: DiagramTypeSchema,
});

export function useDiagramBuilder() {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [isGenerating, startGeneratingTransition] = useTransition();
    const [isRendering, startRenderingTransition] = useTransition();
    const { user, fetchUser } = useAuth();
    const { toast } = useToast();
    
    const [proposalJson, setProposalJson] = useState('');
    const [editedCodes, setEditedCodes] = useState<Partial<Record<DiagramType, string>>>({});
    const [generatingDiagram, setGeneratingDiagram] = useState<DiagramType | null>(null);

    useEffect(() => {
        if (state.lastGenerated && state.currentPlantUmlCode && !state.error) {
            setEditedCodes(prev => ({
                ...prev,
                [state.lastGenerated!]: state.currentPlantUmlCode,
            }));
        }
    }, [state.lastGenerated, state.currentPlantUmlCode, state.imageUrl, state.error]);

    const handleCodeChange = (newCode: string) => {
        if (state.lastGenerated) {
            setEditedCodes(prev => ({ ...prev, [state.lastGenerated!]: newCode }));
        }
    };

    const handleFormSubmit = (formData: FormData) => {
        const formAction = formData.get('formAction');

        if (formAction === 'render') {
            startRenderingTransition(async () => {
                dispatch({ type: 'RENDER_START' });
                const validatedFields = RenderDiagramSchema.safeParse({
                    plantUmlCode: formData.get('plantUmlCode'),
                    diagramType: formData.get('diagramType'),
                });
                if (!validatedFields.success) {
                    dispatch({ type: 'GENERATION_FAILURE', payload: 'Invalid data for re-rendering.' });
                    return;
                }
                try {
                     const response = await fetch('/api/generate-diagrams', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            proposal: {}, // Dummy data, not used for rendering
                            diagramToGenerate: validatedFields.data.diagramType,
                            intent: 'update_diagram',
                            plantUmlCode: validatedFields.data.plantUmlCode
                        }),
                    });

                    const result = await response.json();
                    if (!response.ok) throw new Error(result.message);

                    dispatch({ type: 'RENDER_SUCCESS', payload: { imageUrl: result.imageUrl, currentPlantUmlCode: validatedFields.data.plantUmlCode, diagramType: validatedFields.data.diagramType } });
                } catch (e: any) {
                    dispatch({ type: 'GENERATION_FAILURE', payload: e.message || 'Error re-rendering diagram' });
                }
            });
            return;
        }

        const validatedFields = GenerateDiagramSchema.safeParse({
            proposalJson: formData.get('proposalJson'),
            diagramToGenerate: formData.get('diagramToGenerate'),
        });

        if (!validatedFields.success) {
            dispatch({ type: 'GENERATION_FAILURE', payload: validatedFields.error.flatten().fieldErrors.proposalJson?.[0] || 'Invalid data.' });
            return;
        }

        const { proposalJson, diagramToGenerate } = validatedFields.data;
        let proposalData;
        try {
            proposalData = JSON.parse(proposalJson);
        } catch (e) {
            dispatch({ type: 'GENERATION_FAILURE', payload: 'Invalid JSON format. Please check the content.' });
            return;
        }

        const validatedProposal = ProjectProposalSchema.safeParse(proposalData);
        if (!validatedProposal.success) {
            dispatch({ type: 'GENERATION_FAILURE', payload: 'The proposal data does not match the required structure.' });
            return;
        }
        
        setGeneratingDiagram(diagramToGenerate);
        startGeneratingTransition(async () => {
            dispatch({ type: 'GENERATION_START', payload: { diagramType: diagramToGenerate } });

            try {
                if (!user) throw new Error("User not authenticated");
                
                const response = await fetch('/api/generate-diagrams', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        proposal: validatedProposal.data,
                        diagramToGenerate,
                    }),
                });

                const result = await response.json();
                if (!response.ok) throw new Error(result.message);

                await deductCredit(user.id, 1);
                
                dispatch({
                    type: 'GENERATION_SUCCESS',
                    payload: {
                        plantUmlCodes: { ...state.plantUmlCodes, [diagramToGenerate]: result.plantUmlCode },
                        imageUrl: result.imageUrl,
                        currentPlantUmlCode: result.plantUmlCode,
                        lastGenerated: diagramToGenerate,
                    }
                });
                await fetchUser();
            } catch (e: any) {
                console.error(e);
                const errorMessage = e.message || 'An error occurred while generating the diagram.';
                dispatch({ type: 'GENERATION_FAILURE', payload: errorMessage });
            } finally {
                setGeneratingDiagram(null);
            }
        });
    };

    return {
        state,
        isGenerating,
        isRendering,
        generatingDiagram,
        proposalJson,
        setProposalJson,
        editedCodes,
        handleCodeChange,
        handleFormSubmit,
    };
}
