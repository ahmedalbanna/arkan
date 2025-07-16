
'use client';

import React, { createContext, useContext, useReducer, ReactNode, useMemo, useEffect } from 'react';
import { type ProjectProposal, type SectionName, type DiagramType, type PresentationSlide } from '@/ai/schemas';
import type { EvaluateReportOutput } from '@/ai/flows/evaluate-report';
import { useToast } from '@/hooks/use-toast';
import { saveAs } from 'file-saver';
import { generateProposal } from '@/ai/flows/generate-proposal';
import { z } from 'zod';
import { useAuth } from './AuthContext';
import { deductCredit } from '@/services/credit-service';

// --- STATE AND ACTION TYPES ---
export interface BuilderState {
  proposal: ProjectProposal | null;
  proposalJson: string;
  sections: { [key in SectionName]?: string };
  diagrams: { [key in DiagramType]?: { plantUmlCode: string; imageUrl: string } };
  evaluation?: EvaluateReportOutput;
  presentation?: { slides: PresentationSlide[] };
  externalContext?: { fileName: string; content: string };
  contextSelections: Record<string, Record<string, boolean>>;
  isGeneratingProposal: boolean;
  isAnythingGenerating: boolean;
  lastGenerated: SectionName | DiagramType | 'proposal' | 'presentation' | 'evaluate' | null;
  error?: string;
}

export type BuilderAction =
  | { type: 'NEW_SESSION' }
  | { type: 'SET_STATE'; payload: Partial<BuilderState> }
  | { type: 'PROPOSAL_GENERATION_START' }
  | { type: 'PROPOSAL_GENERATION_SUCCESS'; payload: { proposal: ProjectProposal } }
  | { type: 'PROPOSAL_GENERATION_ERROR'; payload: { error: string } }
  | { type: 'UPDATE_PROPOSAL_JSON'; payload: string }
  | { type: 'UPDATE_SECTION'; payload: { key: SectionName; value: string } }
  | { type: 'UPDATE_DIAGRAM_CODE'; payload: { key: DiagramType; code: string } }
  | { type: 'GENERATION_START'; payload: { item?: string } }
  | { type: 'GENERATION_SUCCESS'; payload: Partial<Omit<BuilderState, 'proposal' | 'proposalJson' | 'isGeneratingProposal'>> }
  | { type: 'GENERATION_ERROR'; payload: { error: string; item?: string } }
  | { type: 'TOGGLE_CONTEXT_SELECTION'; payload: { parentKey: string; contextKey: string } }
  | { type: 'SET_EXTERNAL_CONTEXT'; payload: { fileName: string; content: string } }
  | { type: 'REMOVE_EXTERNAL_CONTEXT' }
  | { type: 'SET_PRESENTATION_SLIDES', payload: { slides: PresentationSlide[] } };


const initialState: BuilderState = {
  proposal: null,
  proposalJson: '',
  sections: {},
  diagrams: {},
  presentation: { slides: [] },
  contextSelections: {},
  isGeneratingProposal: false,
  isAnythingGenerating: false,
  lastGenerated: null,
};

// --- REDUCER ---
const builderReducer = (state: BuilderState, action: BuilderAction): BuilderState => {
  switch (action.type) {
    case 'NEW_SESSION':
      return { ...initialState };
    case 'SET_STATE':
        const newState = { ...state, ...action.payload };
        if (action.payload.proposal) {
            newState.proposalJson = JSON.stringify(action.payload.proposal, null, 2);
        }
        return newState;
    case 'PROPOSAL_GENERATION_START':
      return { ...state, isGeneratingProposal: true, error: undefined };
    case 'PROPOSAL_GENERATION_SUCCESS':
      return {
        ...state,
        proposal: action.payload.proposal,
        proposalJson: JSON.stringify(action.payload.proposal, null, 2),
        isGeneratingProposal: false,
        error: undefined,
        // Reset downstream artifacts when a new proposal is made
        sections: {},
        diagrams: {},
        evaluation: undefined,
        presentation: undefined,
      };
    case 'PROPOSAL_GENERATION_ERROR':
      return { ...state, isGeneratingProposal: false, error: action.payload.error };
    case 'UPDATE_PROPOSAL_JSON':
        let proposal = state.proposal;
        try {
            proposal = z.custom<ProjectProposal>().parse(JSON.parse(action.payload));
        } catch (e) {
            // Ignore parse errors, will be handled on use
        }
        return { ...state, proposal, proposalJson: action.payload };
    case 'UPDATE_SECTION':
        return { ...state, sections: { ...state.sections, [action.payload.key]: action.payload.value }};
    case 'UPDATE_DIAGRAM_CODE':
        if (!state.diagrams || !state.diagrams[action.payload.key]) return state;
        return {
            ...state,
            diagrams: {
                ...state.diagrams,
                [action.payload.key]: {
                    ...state.diagrams[action.payload.key]!,
                    plantUmlCode: action.payload.code
                }
            }
        };
    case 'GENERATION_START':
        return { ...state, isAnythingGenerating: true, error: undefined, lastGenerated: action.payload.item as any };
    case 'GENERATION_SUCCESS':
        const { evaluation, ...restOfPayload } = action.payload;
        if (action.payload.lastGenerated !== 'evaluation') {
            return { ...state, ...restOfPayload, isAnythingGenerating: false, error: undefined, evaluation: undefined };
        }
        return { ...state, ...action.payload, isAnythingGenerating: false, error: undefined };
    case 'GENERATION_ERROR':
        return { ...state, isAnythingGenerating: false, error: action.payload.error, lastGenerated: action.payload.item as any };
    case 'TOGGLE_CONTEXT_SELECTION':
        const { parentKey, contextKey } = action.payload;
        const newSelections = JSON.parse(JSON.stringify(state.contextSelections));
        if (!newSelections[parentKey]) newSelections[parentKey] = {};
        newSelections[parentKey][contextKey] = !newSelections[parentKey][contextKey];
        return { ...state, contextSelections: newSelections };
    case 'SET_EXTERNAL_CONTEXT':
        return { ...state, externalContext: action.payload };
    case 'REMOVE_EXTERNAL_CONTEXT':
        const { externalContext, ...rest } = state;
        return { ...rest };
    case 'SET_PRESENTATION_SLIDES':
        return { ...state, presentation: { slides: action.payload.slides } };
    default:
      return state;
  }
};


// --- CONTEXT AND PROVIDER ---
type BuilderStateContextType = {
    state: BuilderState;
    dispatch: React.Dispatch<BuilderAction>;
    handleGenerateProposal: (projectIdea: string, prompt: string) => void;
    handleProposalUpdate: (path: string, value: any) => void;
    handleNewSession: () => void;
    handleSaveProjectFile: () => void;
    handleLoadProjectFile: (file: File | null) => void;
    isLoaded: boolean;
};

const BuilderStateContext = createContext<BuilderStateContextType | undefined>(undefined);

export const BuilderStateProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, dispatch] = useReducer(builderReducer, initialState);
    const { toast } = useToast();
    const { user, fetchUser } = useAuth();
    
    // Proposal Generation
    const handleGenerateProposal = async (projectIdea: string, prompt: string) => {
        dispatch({ type: 'PROPOSAL_GENERATION_START' });
        try {
            if (!user) throw new Error("User not authenticated.");
            await deductCredit(user.id, 1);
            const result = await generateProposal({ projectIdea, prompt });
            dispatch({ type: 'PROPOSAL_GENERATION_SUCCESS', payload: { proposal: result } });
            await fetchUser();
        } catch (e: any) {
            dispatch({ type: 'PROPOSAL_GENERATION_ERROR', payload: { error: e.message || 'An unexpected error occurred.' } });
        }
    };
    
    // Proposal field update
    const handleProposalUpdate = (path: string, value: any) => {
        if (!state.proposal) return;
        const newProposal = JSON.parse(JSON.stringify(state.proposal));
        
        let current = newProposal;
        const keys = path.split('.');
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        
        dispatch({ type: 'SET_STATE', payload: { proposal: newProposal }});
    };

    // Session Management
    const handleNewSession = () => {
        dispatch({ type: 'NEW_SESSION' });
        // Also clear all related localStorage keys
        localStorage.removeItem('arkan-presentation');
        localStorage.removeItem('arkan-agents-state');
        localStorage.removeItem('arkan-docx-styles');
        localStorage.removeItem('arkan-pptx-styles');
        localStorage.removeItem('arkan-diagrams');
        toast({ title: 'New Session Started', description: 'All content has been cleared.' });
    };

    const handleSaveProjectFile = () => {
        if (!state.proposal) return;
        const { isGeneratingProposal, isAnythingGenerating, ...stateToSave } = state;
        const blob = new Blob([JSON.stringify(stateToSave, null, 2)], { type: 'application/json;charset=utf-8' });
        const fileName = `${state.proposal.title.replace(/[\s\W]/g, '_') || 'arkan_project'}.json`;
        saveAs(blob, fileName);
    };

    const handleLoadProjectFile = (file: File | null) => {
        if (!file) return;
        if (file.type !== 'application/json') {
            toast({ title: 'Invalid File Type', description: 'Please upload a valid .json project file.', variant: 'destructive' });
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const parsedState = JSON.parse(content);
                dispatch({ type: 'SET_STATE', payload: parsedState });
                toast({ title: 'Project Loaded', description: `Successfully loaded "${parsedState.proposal.title}".` });
            } catch (error) {
                toast({ title: 'Load Failed', description: 'The selected file is corrupted or not valid.', variant: 'destructive' });
            }
        };
        reader.readAsText(file);
    };

    const value = useMemo(() => ({ 
        state, 
        dispatch,
        handleGenerateProposal,
        handleProposalUpdate,
        handleNewSession,
        handleSaveProjectFile,
        handleLoadProjectFile,
        isLoaded: true,
    }), [state]);

    return (
        <BuilderStateContext.Provider value={value}>
            {children}
        </BuilderStateContext.Provider>
    );
};


// --- CUSTOM HOOK ---
export const useBuilderState = (): BuilderStateContextType => {
  const context = useContext(BuilderStateContext);
  if (context === undefined) {
    throw new Error('useBuilderState must be used within a BuilderStateProvider');
  }
  return context;
};
