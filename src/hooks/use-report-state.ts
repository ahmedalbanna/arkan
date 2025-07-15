
'use client';

import { useState, useEffect, useCallback, useReducer, useTransition, useRef } from 'react';
import { ProjectProposalSchema, SectionNameSchema, DiagramTypeSchema, type ProjectProposal, type SectionName, type DiagramType } from '@/ai/schemas';
import { add, format } from 'date-fns';
import { useToast } from './use-toast';
import { useLocalization } from '@/context/LocalizationContext';
import type { EvaluateReportOutput } from '@/ai/flows/evaluate-report';
import { deductCredit } from '@/services/credit-service';
import { useAuth } from '@/context/AuthContext';
import { AGENTS } from '@/lib/agents';
import { saveAs } from 'file-saver';
import { useBuilderState } from '@/context/BuilderStateContext';


// 1. Define State and Action Types
export interface ReportState {
  sections: { [key in SectionName]?: string };
  diagrams: { [key in DiagramType]?: { plantUmlCode: string; imageUrl: string; } };
  presentation?: { slides: any[] };
  evaluation?: EvaluateReportOutput;
  externalContext?: { fileName: string; content: string };
  contextSelections: Record<string, Record<string, boolean>>;
  lastGenerated: SectionName | DiagramType | 'presentation' | 'evaluation' | null;
  error?: string;
}

export type ReportAction =
  | { type: 'SET_STATE'; payload: Partial<ReportState> }
  | { type: 'GENERATION_START'; payload: { item?: string } }
  | { type: 'GENERATION_SUCCESS'; payload: Partial<Omit<ReportState, 'proposal' | 'proposalJson'>> }
  | { type: 'GENERATION_ERROR'; payload: { error: string, item?: string } };


// 2. Initial State
export const initialState: ReportState = {
  sections: {},
  diagrams: {},
  contextSelections: {},
  lastGenerated: null,
};

// 3. Reducer Function
const reportReducer = (state: ReportState, action: ReportAction): ReportState => {
  switch (action.type) {
    case 'SET_STATE':
        const { ...restOfPayload } = action.payload;
        return { ...state, ...restOfPayload };
    case 'GENERATION_START':
      return { ...state, error: undefined, lastGenerated: action.payload.item as any };
    case 'GENERATION_SUCCESS':
        // When new content is generated, clear the old evaluation
        const { evaluation, ...restOfSuccessPayload } = action.payload;
        if (action.payload.lastGenerated !== 'evaluation') {
            return { ...state, ...restOfSuccessPayload, error: undefined, evaluation: undefined };
        }
        return { ...state, ...action.payload, error: undefined };
    case 'GENERATION_ERROR':
        return { ...state, error: action.payload.error, lastGenerated: action.payload.item as any };
    default:
      return state;
  }
};


export function useReportState() {
  const { state: builderState, dispatch: builderDispatch, isAnythingGenerating: isBuilderGenerating } = useBuilderState();
  const [state, dispatch] = useReducer(reportReducer, initialState);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isGenerating, startTransition] = useTransition();
  const [generatingItem, setGeneratingItem] = useState<string | null>(null);

  const { toast } = useToast();
  const { user, fetchUser } = useAuth();
  
  useEffect(() => {
    if (builderState) {
        dispatch({ type: 'SET_STATE', payload: builderState });
    }
    setIsLoaded(true);
  }, [builderState]);
  
  // Action handlers
  const handleSectionUpdate = (key: SectionName, value: string) => builderDispatch({ type: 'UPDATE_SECTION', payload: { key, value } });
  const handleDiagramCodeUpdate = (key: DiagramType, code: string) => builderDispatch({ type: 'UPDATE_DIAGRAM_CODE', payload: { key, code }});
  
  const handleDiagramUpdate = (diagramType: DiagramType, code: string) => {
    const formData = new FormData();
    if(builderState.proposalJson) formData.set('proposalJson', builderState.proposalJson);
    formData.set('itemToGenerate', diagramType);
    formData.set('intent', 'update_diagram');
    formData.set('diagramToUpdate', diagramType);
    formData.set('plantUmlCode', code);
    try {
 handleSubmit(formData);
    } catch (error) {
      console.error('Error updating diagram:', error);
      toast({ title: 'Error updating diagram', description: 'Failed to update the diagram. Please try again.', variant: 'destructive' });
    }

  };
  
  const toggleContextSelection = (parentKey: string, contextKey: string) => builderDispatch({ type: 'TOGGLE_CONTEXT_SELECTION', payload: { parentKey, contextKey } });
  const setExternalContext = (fileName: string, content: string) => builderDispatch({ type: 'SET_EXTERNAL_CONTEXT', payload: { fileName, content } });
  const removeExternalContext = () => builderDispatch({ type: 'REMOVE_EXTERNAL_CONTEXT' });
  
  const handleSubmit = (formData: FormData) => {
    const item = (formData.get('itemToGenerate') || formData.get('diagramToUpdate')) as string;
    if (!item) return;

    if (state.externalContext) {
      formData.set('externalContextContent', state.externalContext.content);
    }
    
    setGeneratingItem(item);
    builderDispatch({ type: 'GENERATION_START', payload: { item } });
    startTransition(async () => {
      try {
        if (!user) throw new Error("User not authenticated.");

        const isDiagram = DiagramTypeSchema.options.includes(item as DiagramType);
        const endpoint = isDiagram ? '/api/generate-diagrams' : '/api/generate-report';
        
        const otherDiagrams: Record<string, string> = {};
        if (state.contextSelections[item]) {
            for (const key in state.contextSelections[item]) {
                if (state.contextSelections[item][key] && state.diagrams?.[key as DiagramType]) {
                    otherDiagrams[key] = state.diagrams[key as DiagramType]!.plantUmlCode;
                }
            }
        }
        
        const otherSections: Record<string, string> = {};
        if (state.contextSelections[item]) {
            for (const key in state.contextSelections[item]) {
                if (state.contextSelections[item][key] && state.sections[key as SectionName]) {
                    otherSections[key] = state.sections[key as SectionName]!;
                }
            }
        }
        
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                proposal: builderState.proposal,
                sectionToGenerate: item,
                diagramToGenerate: item,
                otherSections,
                otherDiagrams,
                guidelines: formData.getAll('guidelines[]').map(String),
                instructionText: formData.get('instructionText'),
                externalContextContent: state.externalContext?.content,
                acceptanceCriteria: formData.get('acceptanceCriteria'),
                intent: formData.get('intent'),
                plantUmlCode: formData.get('plantUmlCode'),
            }),
        });
        
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || result.errors || 'API request failed');

        if (item !== 'evaluate') {
            await deductCredit(user.id, 1);
        }

        if (item === 'evaluate') {
             builderDispatch({ type: 'GENERATION_SUCCESS', payload: { evaluation: result, lastGenerated: 'evaluation' } });
        } else if (isDiagram) {
            builderDispatch({ type: 'GENERATION_SUCCESS', payload: {
              diagrams: { ...state.diagrams, [item as DiagramType]: { plantUmlCode: result.plantUmlCode, imageUrl: result.imageUrl } },
              lastGenerated: item as DiagramType,
            }});
        } else {
            builderDispatch({ type: 'GENERATION_SUCCESS', payload: {
                sections: { ...state.sections, [item as SectionName]: Object.values(result)[0] as string },
                lastGenerated: item as SectionName,
            }});
        }

        await fetchUser();
      } catch (e: any) {
        builderDispatch({ type: 'GENERATION_ERROR', payload: { error: e.message || 'An unexpected error occurred.' } });
      } finally {
        setGeneratingItem(null);
      }
    });
  };

  return {
    state,
    isLoaded,
    generatingItem,
    isAnythingGenerating: isBuilderGenerating,
    handleSectionUpdate,
    handleDiagramCodeUpdate,
    handleDiagramUpdate,
    handleSubmit,
    contextSelections: state.contextSelections,
    toggleContextSelection,
    setExternalContext,
    removeExternalContext,
  };
}
