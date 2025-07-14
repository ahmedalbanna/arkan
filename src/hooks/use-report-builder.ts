
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
  | { type: 'GENERATION_ERROR'; payload: { error: string, item?: string } }
  | { type: 'GENERATE_PROPOSAL', payload: { projectIdea: string, prompt: string } };


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
    case 'GENERATE_PROPOSAL':
        return { ...state, error: undefined, lastGenerated: 'proposal' };
    default:
      return state;
  }
};


export function useReportBuilder() {
  const [state, dispatch] = useReducer(reportReducer, initialState);
  const [isLoaded, setIsLoaded] = useState(false);
  const [generatingItem, setGeneratingItem] = useState<string | null>(null);
  const [isGenerating, startTransition] = useTransition();

  const { toast } = useToast();
  const { t } = useLocalization();
  const { user, fetchUser } = useAuth();
  
  // Load from local storage
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        dispatch({ type: 'SET_STATE', payload: JSON.parse(savedState) });
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

  
  const handleNewSession = () => dispatch({ type: 'NEW_SESSION' });

  const handleLoadProjectFile = (file: File | null) => {
    if (!file) return;

    if (file.type !== 'application/json') {
        toast({ title: 'Invalid File Type', description: 'Please upload a valid .json project file.', variant: 'destructive' });
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const content = e.target?.result;
            if (typeof content === 'string') {
                const parsedState = JSON.parse(content);
                // Basic validation
                if (parsedState.proposal) {
                    dispatch({ type: 'SET_STATE', payload: parsedState });
                    toast({ title: 'Project Loaded', description: `Successfully loaded "${parsedState.proposal.title}".` });
                } else {
                    throw new Error('Invalid project file structure.');
                }
            }
        } catch (error) {
            console.error('Failed to load project file:', error);
            toast({ title: 'Load Failed', description: 'The selected file could not be read or is corrupted.', variant: 'destructive' });
        }
    };
    reader.readAsText(file);
  }

  const handleSaveProjectFile = () => {
    if (!state.proposal) return;
    const projectData = {
        version: '1.0',
        generatedAt: new Date().toISOString(),
        ...state
    };
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json;charset=utf-8' });
    const fileName = `${state.proposal.title.replace(/[\s\W]/g, '_') || 'arkan_project'}.json`;
    saveAs(blob, fileName);
  };

  const handleGenerateProposal = async (projectIdea: string, prompt: string) => {
      startTransition(async () => {
          dispatch({ type: 'GENERATION_START', payload: { item: 'proposal' } });
          try {
              if (!user) throw new Error("User not authenticated.");

              const response = await fetch('/api/generate-proposal', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ projectIdea, prompt }),
              });
              const result = await response.json();
              if (!response.ok) throw new Error(result.message || 'API request failed');
              
              await deductCredit(user.id, 1);
              dispatch({ type: 'SET_PROPOSAL', payload: result });
              await fetchUser();
              toast({ title: 'Proposal Generated', description: 'Your project proposal has been created successfully.' });
          } catch (e: any) {
              dispatch({ type: 'GENERATION_ERROR', payload: { error: e.message || 'An error occurred', item: 'proposal' } });
              toast({ title: 'Generation Failed', description: e.message || 'An error occurred', variant: 'destructive' });
          }
      });
  };

  useEffect(() => {
    const originalDispatch = dispatch;
    (dispatch as any) = (action: ReportAction) => {
        if (action.type === 'GENERATE_PROPOSAL') {
            handleGenerateProposal(action.payload.projectIdea, action.payload.prompt);
        } else {
            originalDispatch(action);
        }
    };
  }, [handleGenerateProposal]);


  return {
    state,
    dispatch,
    isLoaded,
    isGeneratingProposal: isGenerating && generatingItem === 'proposal',
    isAnythingGenerating: isGenerating,
    handleNewSession,
    handleSaveProjectFile,
    handleLoadProjectFile,
  };
}
