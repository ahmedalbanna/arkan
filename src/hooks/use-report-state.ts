
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


const STORAGE_KEY = 'arkan-report-generator-state-v2';
const PROPOSAL_STORAGE_KEY = 'arkan-proposal-state';

// 1. Define State and Action Types
export interface ReportState {
  sections: { [key in SectionName]?: string };
  diagrams: { [key in DiagramType]?: { plantUmlCode: string; imageUrl: string; } };
  presentation?: { slides: any[] };
  evaluation?: EvaluateReportOutput;
  externalContext?: { fileName: string; content: string };
  proposal: ProjectProposal | null;
  proposalJson: string;
  contextSelections: Record<string, Record<string, boolean>>;
  lastGenerated: 'proposal' | SectionName | DiagramType | 'presentation' | 'evaluation' | null;
  error?: string;
}

export type ReportAction =
  | { type: 'SET_STATE'; payload: Partial<ReportState> }
  | { type: 'SET_PROPOSAL'; payload: ProjectProposal | null }
  | { type: 'SET_PROPOSAL_JSON'; payload: string }
  | { type: 'UPDATE_PROPOSAL_FIELD'; payload: { path: string; value: any } }
  | { type: 'UPDATE_SECTION'; payload: { key: SectionName; value: string } }
  | { type: 'UPDATE_DIAGRAM_CODE'; payload: { key: DiagramType; code: string } }
  | { type: 'NEW_SESSION' }
  | { type: 'TOGGLE_CONTEXT_SELECTION'; payload: { parentKey: string; contextKey: string } }
  | { type: 'SET_EXTERNAL_CONTEXT'; payload: { fileName: string; content: string } }
  | { type: 'REMOVE_EXTERNAL_CONTEXT' }
  | { type: 'GENERATION_START'; payload: { item?: string } }
  | { type: 'GENERATION_SUCCESS'; payload: Partial<ReportState> }
  | { type: 'GENERATION_ERROR'; payload: { error: string, item?: string } };


// 2. Initial State
export const initialState: ReportState = {
  sections: {},
  diagrams: {},
  proposal: null,
  proposalJson: '',
  contextSelections: {},
  lastGenerated: null,
};

// 3. Reducer Function
const reportReducer = (state: ReportState, action: ReportAction): ReportState => {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, ...action.payload };
    case 'SET_PROPOSAL':
        const proposalJson = action.payload ? JSON.stringify(action.payload, null, 2) : '';
        return { ...state, proposal: action.payload, proposalJson, lastGenerated: 'proposal' };
    case 'SET_PROPOSAL_JSON':
        try {
            const parsed = JSON.parse(action.payload);
            const validated = ProjectProposalSchema.parse(parsed);
            return { ...state, proposalJson: action.payload, proposal: validated, error: undefined };
        } catch {
            return { ...state, proposalJson: action.payload, proposal: null, error: 'Invalid proposal JSON structure.' };
        }
    case 'UPDATE_PROPOSAL_FIELD':
      {
        if (!state.proposal) return state;
        const newProposal = JSON.parse(JSON.stringify(state.proposal));
        
        const set = (obj: any, path: string, value: any) => {
            const keys = path.split('.');
            let current = obj;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
        };
        set(newProposal, action.payload.path, action.payload.value);

        if (action.payload.path.startsWith('timeline')) {
          try {
              let currentDate = new Date(newProposal.timeline.startDate);
              if (isNaN(currentDate.getTime())) { currentDate = new Date(); }
              newProposal.timeline.endDate = format(newProposal.timeline.phases.reduce((acc: any, phase: { durationWeeks: any; }) => add(acc, { weeks: Number(phase.durationWeeks || 0) }), currentDate), 'yyyy-MM-dd');
          } catch (error) { console.error("Error calculating timeline:", error); }
        }

        if (action.payload.path.startsWith('budget.breakdown')) {
          newProposal.budget.totalAmount = newProposal.budget.breakdown.reduce((acc: number, item: { cost: number }) => acc + Number(item.cost || 0), 0);
        }
        
        return { ...state, proposal: newProposal, proposalJson: JSON.stringify(newProposal, null, 2) };
      }
    case 'UPDATE_SECTION':
        return { ...state, sections: { ...state.sections, [action.payload.key]: action.payload.value }};
    case 'UPDATE_DIAGRAM_CODE':
        return { ...state, diagrams: { ...state.diagrams, [action.payload.key]: { ...state.diagrams![action.payload.key]!, plantUmlCode: action.payload.code } }};
    case 'NEW_SESSION':
      localStorage.removeItem(STORAGE_KEY);
      return { ...initialState };
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
      return { ...rest, evaluation: state.evaluation };
    case 'GENERATION_START':
      return { ...state, error: undefined, lastGenerated: action.payload.item as any };
    case 'GENERATION_SUCCESS':
        // When new content is generated, clear the old evaluation
        const { evaluation, ...restOfPayload } = action.payload;
        if (action.payload.lastGenerated !== 'evaluation') {
            return { ...state, ...restOfPayload, error: undefined, evaluation: undefined };
        }
        return { ...state, ...action.payload, error: undefined };
    case 'GENERATION_ERROR':
        return { ...state, error: action.payload.error, lastGenerated: action.payload.item as any };
    default:
      return state;
  }
};


export function useReportState() {
  const [state, dispatch] = useReducer(reportReducer, initialState);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isGenerating, startTransition] = useTransition();
  const [generatingItem, setGeneratingItem] = useState<string | null>(null);

  const { toast } = useToast();
  const { user, fetchUser } = useAuth();
  
  // Load from local storage
  useEffect(() => {
    try {
      const savedReportState = localStorage.getItem(STORAGE_KEY);
      if (savedReportState) {
        dispatch({ type: 'SET_STATE', payload: JSON.parse(savedReportState) });
      } else {
        const savedProposalState = localStorage.getItem(PROPOSAL_STORAGE_KEY);
        if (savedProposalState) {
          const { proposal } = JSON.parse(savedProposalState);
          if (proposal) {
            dispatch({ type: 'SET_PROPOSAL', payload: proposal });
          }
        }
      }
    } catch (error) {
      console.error("Failed to load state from localStorage", error);
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save state to localStorage", error);
    }
  }, [state, isLoaded]);

  // Action handlers
  const handleProposalJsonChange = (json: string) => dispatch({ type: 'SET_PROPOSAL_JSON', payload: json });
  const handleProposalUpdate = (path: string, value: any) => dispatch({ type: 'UPDATE_PROPOSAL_FIELD', payload: { path, value } });
  const handleSectionUpdate = (key: SectionName, value: string) => dispatch({ type: 'UPDATE_SECTION', payload: { key, value } });
  const handleDiagramCodeUpdate = (key: DiagramType, code: string) => dispatch({ type: 'UPDATE_DIAGRAM_CODE', payload: { key, code }});
  
  const handleDiagramUpdate = (diagramType: DiagramType, code: string) => {
    const formData = new FormData();
    if(state.proposalJson) formData.set('proposalJson', state.proposalJson);
    formData.set('itemToGenerate', diagramType);
    formData.set('intent', 'update_diagram');
    formData.set('diagramToUpdate', diagramType);
    formData.set('plantUmlCode', code);
    handleSubmit(formData);
  };
  
  const toggleContextSelection = (parentKey: string, contextKey: string) => dispatch({ type: 'TOGGLE_CONTEXT_SELECTION', payload: { parentKey, contextKey } });
  const setExternalContext = (fileName: string, content: string) => dispatch({ type: 'SET_EXTERNAL_CONTEXT', payload: { fileName, content } });
  const removeExternalContext = () => dispatch({ type: 'REMOVE_EXTERNAL_CONTEXT' });
  
  const handleSubmit = (formData: FormData) => {
    const item = (formData.get('itemToGenerate') || formData.get('diagramToUpdate')) as string;
    if (!item) return;

    if (state.externalContext) {
      formData.set('externalContextContent', state.externalContext.content);
    }
    
    setGeneratingItem(item);
    dispatch({ type: 'GENERATION_START', payload: { item } });
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
                proposal: state.proposal,
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
             dispatch({ type: 'GENERATION_SUCCESS', payload: { evaluation: result, lastGenerated: 'evaluation' } });
        } else if (isDiagram) {
            dispatch({ type: 'GENERATION_SUCCESS', payload: {
              diagrams: { ...state.diagrams, [item as DiagramType]: { plantUmlCode: result.plantUmlCode, imageUrl: result.imageUrl } },
              lastGenerated: item as DiagramType,
            }});
        } else {
            dispatch({ type: 'GENERATION_SUCCESS', payload: {
                sections: { ...state.sections, [item as SectionName]: Object.values(result)[0] as string },
                lastGenerated: item as SectionName,
            }});
        }

        await fetchUser();
      } catch (e: any) {
        dispatch({ type: 'GENERATION_ERROR', payload: { error: e.message || 'An unexpected error occurred.' } });
      } finally {
        setGeneratingItem(null);
      }
    });
  };

  return {
    state,
    isLoaded,
    generatingItem,
    isAnythingGenerating: isGenerating,
    proposal: state.proposal,
    proposalJson: state.proposalJson,
    contextSelections: state.contextSelections,
    handleProposalJsonChange,
    handleProposalUpdate,
    handleSectionUpdate,
    handleDiagramCodeUpdate,
    handleDiagramUpdate,
    handleSubmit,
    toggleContextSelection,
    setExternalContext,
    removeExternalContext,
  };
}
