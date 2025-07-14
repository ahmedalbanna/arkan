
'use client';

import { useState, useReducer, useTransition, useEffect } from 'react';
import { z } from 'zod';
import { ProjectProposalSchema, DiagramTypeSchema, type DiagramType } from '@/ai/schemas';
import { generateUseCaseDiagram } from '@/ai/flows/generate-use-case-diagram';
import { generateClassDiagram } from '@/ai/flows/generate-class-diagram';
import { generateSequenceDiagram } from '@/ai/flows/generate-sequence-diagram';
import { generateActivityDiagram } from '@/ai/flows/generate-activity-diagram';
import { generateComponentDiagram } from '@/ai/flows/generate-component-diagram';
import { generateArchimateDiagram } from '@/ai/flows/generate-archimate-diagram';
import { generateErDiagram } from '@/ai/flows/generate-er-diagram';
import { deflateSync } from 'zlib';
import { AGENTS } from '@/lib/agents';
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

function encode64(data: Buffer): string {
  const B64_MAP = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';
  let r = '';
  for (let i = 0; i < data.length; i += 3) {
    const b1 = data[i];
    const b2 = i + 1 < data.length ? data[i + 1] : 0;
    const b3 = i + 2 < data.length ? data[i + 2] : 0;
    const c1 = b1 >> 2;
    const c2 = ((b1 & 3) << 4) | (b2 >> 4);
    const c3 = ((b2 & 15) << 2) | (b3 >> 6);
    const c4 = b3 & 63;
    r += B64_MAP.charAt(c1);
    r += B64_MAP.charAt(c2);
    if (i + 1 < data.length) r += B64_MAP.charAt(c3);
    if (i + 2 < data.length) r += B64_MAP.charAt(c4);
  }
  return r;
}

async function getPlantUmlImageUrl(plantUmlCode: string): Promise<string> {
    const compressed = deflateSync(Buffer.from(plantUmlCode, 'utf-8'));
    const encoded = encode64(compressed);
    const plantUmlUrl = `https://www.plantuml.com/plantuml/png/~1${encoded}`;
    return `/api/proxy-image?url=${encodeURIComponent(plantUmlUrl)}`;
}

const diagramAgentMap: Record<DiagramType, { flow: Function; agentId: string }> = {
  useCase: { flow: generateUseCaseDiagram, agentId: 'generate-use-case-diagram' },
  class: { flow: generateClassDiagram, agentId: 'generate-class-diagram' },
  sequence: { flow: generateSequenceDiagram, agentId: 'generate-sequence-diagram' },
  activity: { flow: generateActivityDiagram, agentId: 'generate-activity-diagram' },
  component: { flow: generateComponentDiagram, agentId: 'generate-component-diagram' },
  archimate: { flow: generateArchimateDiagram, agentId: 'generate-archimate-diagram' },
  er: { flow: generateErDiagram, agentId: 'generate-er-diagram' },
};

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
                    const imageUrl = await getPlantUmlImageUrl(validatedFields.data.plantUmlCode);
                    dispatch({ type: 'RENDER_SUCCESS', payload: { ...validatedFields.data, imageUrl, currentPlantUmlCode: validatedFields.data.plantUmlCode } });
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
        
        const agentInfo = diagramAgentMap[diagramToGenerate];
        if (!agentInfo) {
            dispatch({ type: 'GENERATION_FAILURE', payload: `No agent configured for diagram type '${diagramToGenerate}'.` });
            return;
        }
        
        const agent = AGENTS.find(a => a.id === agentInfo.agentId);
        if (!agent || !agent.isEnabled) {
            dispatch({ type: 'GENERATION_FAILURE', payload: `The agent for '${diagramToGenerate}' is not available or is disabled.` });
            return;
        }

        setGeneratingDiagram(diagramToGenerate);
        startGeneratingTransition(async () => {
            dispatch({ type: 'GENERATION_START', payload: { diagramType: diagramToGenerate } });

            try {
                if (!user) throw new Error("User not authenticated");
                await deductCredit(user.id, 1);

                const result = await agentInfo.flow({
                    proposal: validatedProposal.data,
                    prompt: typeof agent.prompt === 'string' ? agent.prompt : agent.prompt.base
                });

                const imageUrl = await getPlantUmlImageUrl(result.plantUmlCode);

                dispatch({
                    type: 'GENERATION_SUCCESS',
                    payload: {
                        plantUmlCodes: { ...state.plantUmlCodes, [diagramToGenerate]: result.plantUmlCode },
                        imageUrl,
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
