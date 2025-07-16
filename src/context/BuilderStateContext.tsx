
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

const DOCUMENTS_KEY = 'arkan-documents';
const DIAGRAMS_KEY = 'arkan-diagrams';
const PRESENTATION_KEY = 'arkan-presentation-history'; // Key now reflects history
const CODE_GENERATOR_KEY = 'arkan-code-generator';


export interface CodeGenerationState {
  prompt: string;
  html: string;
  css: string;
  javascript: string;
}
export interface PresentationHistoryEntry {
    id: string;
    name: string;
    slides: PresentationSlide[];
}

// --- STATE AND ACTION TYPES ---

/**
 * Represents the entire state of the document and diagram builder.
 * This state is managed globally and represents all user-generated content.
 */
export interface BuilderState {
  /** The user's initial project idea text for the proposal generator. */
  projectIdea: string;
  /** The full, parsed project proposal object. Null if not yet generated. */
  proposal: ProjectProposal | null;
  /** The raw JSON string of the project proposal. Used for display and editing. */
  proposalJson: string;
  /** A map of all generated report sections, keyed by section name. */
  sections: { [key in SectionName]?: string };
  /** A map of all generated diagrams, keyed by diagram type. */
  diagrams: { [key in DiagramType]?: { plantUmlCode: string; imageUrl: string } };
  /** The result of the last report evaluation. */
  evaluation?: EvaluateReportOutput;
  /** The generated presentation slides, stored as a history of generated presentations. */
  presentation?: { history: PresentationHistoryEntry[] };
  /** The state for the standalone code generator. */
  codeGenerator: CodeGenerationState;
  /** Content from an externally uploaded file (e.g., a PDF) to be used as context. */
  externalContext?: { fileName: string; content: string };
  /** Tracks which context items (sections, diagrams) are selected for a given generation task. */
  contextSelections: Record<string, Record<string, boolean>>;
  /** Flag indicating if the initial proposal generation is in progress. */
  isGeneratingProposal: boolean;
  /** Flag indicating if any generation (section, diagram, etc.) is in progress. */
  isAnythingGenerating: boolean;
  /** The key of the last item that was generated, used for UI feedback. */
  lastGenerated: SectionName | DiagramType | 'proposal' | 'presentation' | 'evaluate' | 'code' | null;
  /** Stores any error message from the last failed generation. */
  error?: string;
}

/**
 * Defines the actions that can be dispatched to update the builder state.
 */
export type BuilderAction =
  | { type: 'NEW_SESSION' }
  | { type: 'SET_STATE'; payload: Partial<BuilderState> }
  | { type: 'SET_PROJECT_IDEA'; payload: string }
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
  | { type: 'SET_CODE_GENERATOR_STATE', payload: CodeGenerationState };


const initialState: BuilderState = {
  projectIdea: '',
  proposal: null,
  proposalJson: '',
  sections: {},
  diagrams: {},
  presentation: { history: [] },
  codeGenerator: { prompt: '', html: '', css: '', javascript: '' },
  contextSelections: {},
  isGeneratingProposal: false,
  isAnythingGenerating: false,
  lastGenerated: null,
};

// --- REDUCER ---

/**
 * Manages state transitions for the builder context based on dispatched actions.
 * @param state - The current builder state.
 * @param action - The action to perform.
 * @returns The new builder state.
 */
const builderReducer = (state: BuilderState, action: BuilderAction): BuilderState => {
  switch (action.type) {
    case 'NEW_SESSION':
      // Resets the entire state to its initial value.
      return { ...initialState };
    case 'SET_STATE': {
        // Sets the state from an external source, like loading a project file.
        const newState = { ...state, ...action.payload };
        if (action.payload.proposal) {
            // Ensures the JSON string representation is in sync with the proposal object.
            newState.proposalJson = JSON.stringify(action.payload.proposal, null, 2);
        }
        return newState;
    }
    case 'SET_PROJECT_IDEA':
      return { ...state, projectIdea: action.payload };
    case 'PROPOSAL_GENERATION_START':
      return { ...state, isGeneratingProposal: true, error: undefined };
    case 'PROPOSAL_GENERATION_SUCCESS':
      return {
        ...state,
        proposal: action.payload.proposal,
        proposalJson: JSON.stringify(action.payload.proposal, null, 2),
        isGeneratingProposal: false,
        error: undefined,
        // Reset downstream artifacts when a new proposal is made.
        sections: {},
        diagrams: {},
        evaluation: undefined,
        presentation: { history: [] }, // Reset presentation history
      };
    case 'PROPOSAL_GENERATION_ERROR':
      return { ...state, isGeneratingProposal: false, error: action.payload.error };
    case 'UPDATE_PROPOSAL_JSON': {
        // When the user edits the proposal JSON, try to parse it back into the object.
        let proposal = state.proposal;
        try {
            proposal = z.custom<ProjectProposal>().parse(JSON.parse(action.payload));
        } catch (e) {
            // Ignore parse errors, they will be handled on use.
        }
        return { ...state, proposal, proposalJson: action.payload };
    }
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
    case 'GENERATION_SUCCESS': {
        const { evaluation, ...restOfPayload } = action.payload;
        // If the generation was for an evaluation, we don't want to clear the previous evaluation result.
        if (action.payload.lastGenerated !== 'evaluation') {
            return { ...state, ...restOfPayload, isAnythingGenerating: false, error: undefined, evaluation: undefined };
        }
        return { ...state, ...action.payload, isAnythingGenerating: false, error: undefined };
    }
    case 'GENERATION_ERROR':
        return { ...state, isAnythingGenerating: false, error: action.payload.error, lastGenerated: action.payload.item as any };
    case 'TOGGLE_CONTEXT_SELECTION': {
        const { parentKey, contextKey } = action.payload;
        const newSelections = JSON.parse(JSON.stringify(state.contextSelections));
        if (!newSelections[parentKey]) newSelections[parentKey] = {};
        newSelections[parentKey][contextKey] = !newSelections[parentKey][contextKey];
        return { ...state, contextSelections: newSelections };
    }
    case 'SET_EXTERNAL_CONTEXT':
        return { ...state, externalContext: action.payload };
    case 'REMOVE_EXTERNAL_CONTEXT': {
        // Creates a new state object without the externalContext property.
        const { externalContext, ...rest } = state;
        return { ...rest };
    }
    case 'SET_CODE_GENERATOR_STATE':
        return { ...state, codeGenerator: action.payload };
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
    
    // Load persisted state from local storage on initial mount
    useEffect(() => {
        try {
            const storedSections = localStorage.getItem(DOCUMENTS_KEY);
            const storedDiagrams = localStorage.getItem(DIAGRAMS_KEY);
            const storedPresentationHistory = localStorage.getItem(PRESENTATION_KEY);
            const storedCode = localStorage.getItem(CODE_GENERATOR_KEY);

            const payload: Partial<BuilderState> = {};
            if (storedSections) payload.sections = JSON.parse(storedSections);
            if (storedDiagrams) payload.diagrams = JSON.parse(storedDiagrams);
            if (storedPresentationHistory) payload.presentation = { history: JSON.parse(storedPresentationHistory) };
            if (storedCode) payload.codeGenerator = JSON.parse(storedCode);

            if (Object.keys(payload).length > 0) {
                 dispatch({ type: 'SET_STATE', payload });
            }
        } catch (error) {
            console.error('Failed to load state from localStorage', error);
        }
    }, []);

    // Effect to save individual parts of the state to local storage when they change.
    useEffect(() => {
        try {
            if (state.sections && Object.keys(state.sections).length > 0) {
                localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(state.sections));
            }
            if (state.diagrams && Object.keys(state.diagrams).length > 0) {
                localStorage.setItem(DIAGRAMS_KEY, JSON.stringify(state.diagrams));
            }
            if (state.presentation && state.presentation.history && state.presentation.history.length > 0) {
                localStorage.setItem(PRESENTATION_KEY, JSON.stringify(state.presentation.history));
            }
            if (state.codeGenerator && state.codeGenerator.html) {
                 localStorage.setItem(CODE_GENERATOR_KEY, JSON.stringify(state.codeGenerator));
            }
        } catch (error) {
            console.error('Failed to save state to localStorage', error);
        }
    }, [state.sections, state.diagrams, state.presentation, state.codeGenerator]);

    /**
     * Initiates the AI generation of a new project proposal.
     * @param projectIdea - The user's initial idea.
     * @param prompt - The full prompt to send to the AI.
     */
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
    
    /**
     * Updates a specific field within the nested project proposal object.
     * @param path - A dot-separated string representing the path to the value (e.g., "timeline.phases.0.name").
     * @param value - The new value to set.
     */
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

    /**
     * Clears the entire application state and local storage to start fresh.
     */
    const handleNewSession = () => {
        dispatch({ type: 'NEW_SESSION' });
        // Also clear all related localStorage keys.
        localStorage.removeItem(DOCUMENTS_KEY);
        localStorage.removeItem(DIAGRAMS_KEY);
        localStorage.removeItem(PRESENTATION_KEY);
        localStorage.removeItem(CODE_GENERATOR_KEY);
        localStorage.removeItem('arkan-agents-state');
        localStorage.removeItem('arkan-docx-styles');
        localStorage.removeItem('arkan-pptx-styles');
        toast({ title: 'New Session Started', description: 'All content has been cleared.' });
    };

    /**
     * Saves the entire current builder state to a downloadable JSON file.
     */
    const handleSaveProjectFile = () => {
        if (!state.proposal) return;
        // Exclude ephemeral UI state from the saved file.
        const { isGeneratingProposal, isAnythingGenerating, ...stateToSave } = state;
        const blob = new Blob([JSON.stringify(stateToSave, null, 2)], { type: 'application/json;charset=utf-8' });
        const fileName = `${state.proposal.title.replace(/[\s\W]/g, '_') || 'arkan_project'}.json`;
        saveAs(blob, fileName);
    };

    /**
     * Loads a project state from a user-provided JSON file.
     * @param file - The file uploaded by the user.
     */
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
