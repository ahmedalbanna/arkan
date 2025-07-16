
'use client';

import React, { createContext, useContext, useReducer, ReactNode, useMemo, useEffect, useState, useCallback } from 'react';
import { type ProjectProposal, type SectionName, type DiagramType, type PresentationSlide, SectionNameSchema, DiagramTypeSchema } from '@/ai/schemas';
import type { EvaluateReportOutput } from '@/ai/flows/evaluate-report';
import { useToast } from '@/hooks/use-toast';
import { saveAs } from 'file-saver';
import { z } from 'zod';
import { useAuth } from './AuthContext';
import { deductCredit } from '@/services/credit-service';
import { templates as proposalTemplates, type ProposalTemplateKey, type ProposalTemplate } from '@/lib/proposal-templates';
import { AGENTS } from '@/lib/agents';
import type { AgentPrompt } from '@/lib/agents';
import { presentationConfig } from '@/lib/report-config';

// Local Storage Keys
const DOCUMENTS_KEY = 'arkan-documents';
const DIAGRAMS_KEY = 'arkan-diagrams';
const PRESENTATION_KEY = 'arkan-presentation-history';
const CODE_GENERATOR_KEY = 'arkan-code-generator';

export interface PresentationHistoryEntry {
    id: string;
    name: string;
    slides: PresentationSlide[];
}
export interface CodeGenerationState {
  prompt: string;
  html: string;
  css: string;
  javascript: string;
}

// Helper types for UI state
export type ControlState = {
    formality: number;
    tone: string;
    wordCount: string;
};
export type GuidelineState = {
    checked: Record<number, boolean>;
    custom: string[];
};

// --- STATE AND ACTION TYPES ---
export interface BuilderState {
  projectIdea: string;
  proposal: ProjectProposal | null;
  proposalJson: string;
  sections: { [key in SectionName]?: string };
  diagrams: { [key in DiagramType]?: { plantUmlCode: string; imageUrl: string } };
  evaluation?: EvaluateReportOutput;
  presentation?: { history: PresentationHistoryEntry[] };
  codeGenerator: CodeGenerationState;
  externalContext?: { fileName: string; content: string };
  contextSelections: Record<string, Record<string, boolean>>;
  isGeneratingProposal: boolean;
  isAnythingGenerating: boolean;
  lastGenerated: SectionName | DiagramType | 'proposal' | 'presentation' | 'evaluate' | 'code' | null;
  error?: string;
  isLoaded: boolean;
  
  // UI States now live in the global context
  selectedTemplate: ProposalTemplateKey;
  customGuidelines: string[];
  controlState: Record<SectionName, ControlState>;
  guidelineState: Record<string, GuidelineState>;
  activePresentationId: string | null;
}

export type BuilderAction =
  | { type: 'NEW_SESSION' }
  | { type: 'SET_STATE'; payload: Partial<BuilderState> }
  | { type: 'SET_PROJECT_IDEA'; payload: string }
  | { type: 'PROPOSAL_GENERATION_START' }
  | { type: 'PROPOSAL_GENERATION_SUCCESS'; payload: { proposal: ProjectProposal } }
  | { type: 'PROPOSAL_GENERATION_FAILURE'; payload: { error: string } }
  | { type: 'UPDATE_PROPOSAL_JSON'; payload: string }
  | { type: 'UPDATE_SECTION'; payload: { key: SectionName; value: string } }
  | { type: 'UPDATE_DIAGRAM_CODE'; payload: { key: DiagramType; code: string } }
  | { type: 'GENERATION_START'; payload: { item?: string } }
  | { type: 'GENERATION_SUCCESS'; payload: Partial<Omit<BuilderState, 'isAnythingGenerating'>> }
  | { type: 'GENERATION_FAILURE'; payload: { error: string; item?: string } }
  | { type: 'TOGGLE_CONTEXT_SELECTION'; payload: { parentKey: string; contextKey: string } }
  | { type: 'SET_EXTERNAL_CONTEXT'; payload: { fileName: string; content: string } }
  | { type: 'REMOVE_EXTERNAL_CONTEXT' }
  | { type: 'SET_CODE_GENERATOR_STATE', payload: Partial<CodeGenerationState> }
  | { type: 'SET_SELECTED_TEMPLATE', payload: ProposalTemplateKey }
  | { type: 'SET_CUSTOM_GUIDELINES', payload: string[] }
  | { type: 'SET_CONTROL_STATE', payload: { section: SectionName, field: keyof ControlState, value: string | number } }
  | { type: 'SET_GUIDELINE_STATE', payload: { itemKey: string, guidelineState: GuidelineState } }
  | { type: 'SET_ACTIVE_PRESENTATION', payload: string | null };

const getInitialGuidelineStates = (): Record<string, GuidelineState> => {
    const initialState: Record<string, GuidelineState> = {};
    AGENTS.forEach(agent => {
        if (typeof agent.prompt === 'object' && agent.prompt.guidelines) {
            const checked: Record<number, boolean> = {};
            agent.prompt.guidelines.forEach((g, index) => {
                checked[index] = g.isDefault;
            });
            initialState[agent.id.replace('generate-', '')] = { checked, custom: [] };
        }
    });
     // Specific handling for presentation agent
    const presentationAgent = AGENTS.find(a => a.id === presentationConfig.presentation.agentId);
    const prompt = presentationAgent?.prompt as AgentPrompt | undefined;
    const checked: Record<number, boolean> = {};
    if (prompt?.guidelines) {
        prompt.guidelines.forEach((g, i) => {
            checked[i] = g.isDefault;
        });
    }
    initialState['presentation'] = { checked, custom: [] };
    return initialState;
};

const getInitialControlState = (): Record<SectionName, ControlState> => {
    const initial: Partial<Record<SectionName, ControlState>> = {};
    SectionNameSchema.options.forEach(key => {
        initial[key] = { formality: 50, tone: 'professional', wordCount: '300' };
    });
    return initial as Record<SectionName, ControlState>;
};

const initialState: BuilderState = {
  projectIdea: '',
  proposal: null,
  proposalJson: '',
  sections: {},
  diagrams: {},
  evaluation: undefined,
  presentation: { history: [] },
  codeGenerator: { prompt: '', html: '', css: '', javascript: '' },
  externalContext: undefined,
  contextSelections: {},
  isGeneratingProposal: false,
  isAnythingGenerating: false,
  lastGenerated: null,
  error: undefined,
  isLoaded: false,
  selectedTemplate: 'default',
  customGuidelines: [],
  controlState: getInitialControlState(),
  guidelineState: getInitialGuidelineStates(),
  activePresentationId: null,
};

// --- REDUCER ---
const builderReducer = (state: BuilderState, action: BuilderAction): BuilderState => {
  switch (action.type) {
    case 'NEW_SESSION':
      return { ...initialState, isLoaded: true };
    case 'SET_STATE': {
        const newState = { ...state, ...action.payload, isLoaded: true };
        if (action.payload.proposal) {
            newState.proposalJson = JSON.stringify(action.payload.proposal, null, 2);
        }
        return newState;
    }
    case 'SET_PROJECT_IDEA':
      return { ...state, projectIdea: action.payload };
    case 'PROPOSAL_GENERATION_START':
      return { ...state, isGeneratingProposal: true, error: undefined, lastGenerated: 'proposal' };
    case 'PROPOSAL_GENERATION_SUCCESS':
      return {
        ...state,
        proposal: action.payload.proposal,
        proposalJson: JSON.stringify(action.payload.proposal, null, 2),
        isGeneratingProposal: false,
        error: undefined,
        sections: {},
        diagrams: {},
        evaluation: undefined,
        presentation: { history: [] },
      };
    case 'PROPOSAL_GENERATION_FAILURE':
      return { ...state, isGeneratingProposal: false, error: action.payload.error };
    case 'UPDATE_PROPOSAL_JSON': {
        let proposal = state.proposal;
        try {
            proposal = z.custom<ProjectProposal>().parse(JSON.parse(action.payload));
        } catch (e) {
            // Ignore parse errors
        }
        return { ...state, proposal, proposalJson: action.payload };
    }
    case 'UPDATE_SECTION':
        return { ...state, sections: { ...state.sections, [action.payload.key]: action.payload.value }};
    case 'UPDATE_DIAGRAM_CODE':
        if (!state.diagrams || !state.diagrams[action.payload.key]) return state;
        return { ...state, diagrams: { ...state.diagrams, [action.payload.key]: { ...state.diagrams[action.payload.key]!, plantUmlCode: action.payload.code }}};
    case 'GENERATION_START':
        return { ...state, isAnythingGenerating: true, error: undefined, lastGenerated: action.payload.item as any };
    case 'GENERATION_SUCCESS':
        return { ...state, ...action.payload, isAnythingGenerating: false, error: undefined };
    case 'GENERATION_FAILURE':
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
        const { externalContext, ...rest } = state;
        return { ...rest };
    }
    case 'SET_CODE_GENERATOR_STATE':
        return { ...state, codeGenerator: { ...state.codeGenerator, ...action.payload }};
    case 'SET_SELECTED_TEMPLATE':
        return { ...state, selectedTemplate: action.payload };
    case 'SET_CUSTOM_GUIDELINES':
        return { ...state, customGuidelines: action.payload };
    case 'SET_CONTROL_STATE':
        return {...state, controlState: {...state.controlState, [action.payload.section]: { ...state.controlState[action.payload.section], [action.payload.field]: action.payload.value }}};
    case 'SET_GUIDELINE_STATE':
        return {...state, guidelineState: {...state.guidelineState, [action.payload.itemKey]: action.payload.guidelineState}};
    case 'SET_ACTIVE_PRESENTATION':
        return {...state, activePresentationId: action.payload};
    default:
      return state;
  }
};


// --- CONTEXT AND PROVIDER ---
type BuilderStateContextType = {
    state: BuilderState;
    dispatch: React.Dispatch<BuilderAction>;
    setProjectIdea: (idea: string) => void;
    handleGenerateProposal: () => void;
    handleProposalUpdate: (path: string, value: any) => void;
    handleNewSession: () => void;
    handleSaveProjectFile: () => void;
    handleLoadProjectFile: (file: File | null) => void;
    handleGenerateReportSection: (section: SectionName) => void;
    handleSectionUpdate: (key: SectionName, value: string) => void;
    handleEvaluateReport: (formData: FormData) => void;
    handleGenerateDiagram: (diagramType: DiagramType, guidelines: string[]) => void;
    handleDiagramCodeUpdate: (key: DiagramType, code: string) => void;
    handleDiagramUpdate: (diagramType: DiagramType) => void;
    setCodePrompt: (prompt: string) => void;
    handleGenerateCode: () => void;
    handleGeneratePresentation: (guidelines: string[]) => void;
    setActivePresentationId: (id: string | null) => void;
    toggleContextSelection: (parentKey: string, contextKey: string) => void;
    setExternalContext: (fileName: string, content: string) => void;
    removeExternalContext: () => void;
    templates: Record<ProposalTemplateKey, ProposalTemplate>;
    handleTemplateChange: (key: ProposalTemplateKey) => void;
    customGuidelines: string[];
    handleAddCustomGuideline: () => void;
    handleRemoveCustomGuideline: (index: number) => void;
    customGuidelineInput: string;
    setCustomGuidelineInput: (value: string) => void;
    controlState: Record<SectionName, ControlState>;
    handleControlChange: (section: SectionName, field: keyof ControlState, value: string | number) => void;
    guidelineState: Record<string, GuidelineState>;
    handleGuidelineToggle: (itemKey: string, guidelineIndex: number, isChecked: boolean) => void;
    setCustomGuidelineInput: (itemKey: string, value: string) => void;
    handleAddCustomGuideline: (itemKey: string) => void;
    handleRemoveCustomGuideline: (itemKey: string, index: number) => void;
    onGuidelineToggle: (index: number, checked: boolean) => void;
    onCustomGuidelineChange: (value: string) => void;
    onAddCustomGuideline: () => void;
    onRemoveCustomGuideline: (index: number) => void;
};

const BuilderStateContext = createContext<BuilderStateContextType | undefined>(undefined);

export const BuilderStateProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, dispatch] = useReducer(builderReducer, initialState);
    const { toast } = useToast();
    const { user, fetchUser } = useAuth();
    
    // --- Generic Local Storage Loader/Saver ---
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
            } else {
                 dispatch({ type: 'SET_STATE', payload: {} }); // To set isLoaded to true
            }
        } catch (error) {
            console.error('Failed to load state from localStorage', error);
            dispatch({ type: 'SET_STATE', payload: {} });
        }
    }, []);

    useEffect(() => {
        try {
            if (state.sections && Object.keys(state.sections).length > 0) localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(state.sections));
            if (state.diagrams && Object.keys(state.diagrams).length > 0) localStorage.setItem(DIAGRAMS_KEY, JSON.stringify(state.diagrams));
            if (state.presentation?.history && state.presentation.history.length > 0) localStorage.setItem(PRESENTATION_KEY, JSON.stringify(state.presentation.history));
            if (state.codeGenerator && state.codeGenerator.html) localStorage.setItem(CODE_GENERATOR_KEY, JSON.stringify(state.codeGenerator));
        } catch (error) {
            console.error('Failed to save state to localStorage', error);
        }
    }, [state.sections, state.diagrams, state.presentation, state.codeGenerator]);

    const setProjectIdea = useCallback((idea: string) => dispatch({ type: 'SET_PROJECT_IDEA', payload: idea }), []);

    // --- PROPOSAL LOGIC ---
    const [templates] = useState<Record<ProposalTemplateKey, ProposalTemplate>>(proposalTemplates);
    const [customGuidelineInput, setCustomGuidelineInput] = useState('');
    const handleTemplateChange = (key: ProposalTemplateKey) => dispatch({ type: 'SET_SELECTED_TEMPLATE', payload: key });
    const handleAddCustomGuideline = useCallback(() => {
        const newGuideline = customGuidelineInput.trim();
        if (newGuideline) {
            dispatch({ type: 'SET_CUSTOM_GUIDELINES', payload: [...state.customGuidelines, newGuideline] });
            setCustomGuidelineInput('');
        }
    }, [customGuidelineInput, state.customGuidelines]);
    const handleRemoveCustomGuideline = useCallback((indexToRemove: number) => {
        const newGuidelines = state.customGuidelines.filter((_, index) => index !== indexToRemove);
        dispatch({ type: 'SET_CUSTOM_GUIDELINES', payload: newGuidelines });
    }, [state.customGuidelines]);
    
    const handleGenerateProposal = useCallback(async () => {
        const currentTemplate = templates[state.selectedTemplate];
        let fullPrompt = currentTemplate.prompt;
        const allGuidelines = [...(currentTemplate.guidelines || []), ...state.customGuidelines];
        if (allGuidelines.length > 0) {
            fullPrompt += '\n\nAdditionally, please adhere to the following guidelines:\n' + allGuidelines.map(g => `- ${g}`).join('\n');
        }

        dispatch({ type: 'PROPOSAL_GENERATION_START' });
        try {
            if (!user) throw new Error("User not authenticated.");
            await deductCredit(user.id, 1);
            const response = await fetch('/api/generate-proposal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectIdea: state.projectIdea, prompt: fullPrompt })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'API request failed');
            dispatch({ type: 'PROPOSAL_GENERATION_SUCCESS', payload: { proposal: result } });
            await fetchUser();
        } catch (e: any) {
            dispatch({ type: 'PROPOSAL_GENERATION_FAILURE', payload: { error: e.message || 'An unexpected error occurred.' } });
        }
    }, [state.projectIdea, state.selectedTemplate, state.customGuidelines, templates, user, fetchUser]);

    const handleProposalUpdate = useCallback((path: string, value: any) => {
        if (!state.proposal) return;
        const newProposal = JSON.parse(JSON.stringify(state.proposal));
        let current = newProposal;
        const keys = path.split('.');
        for (let i = 0; i < keys.length - 1; i++) { current = current[keys[i]]; }
        current[keys[keys.length - 1]] = value;
        dispatch({ type: 'UPDATE_PROPOSAL_JSON', payload: JSON.stringify(newProposal, null, 2) });
    }, [state.proposal]);

    // --- REPORT & DIAGRAM LOGIC ---
    const handleControlChange = (section: SectionName, field: keyof ControlState, value: string | number) => dispatch({type: 'SET_CONTROL_STATE', payload: { section, field, value }});
    const [sectionCustomGuidelineInput, setSectionCustomGuidelineInput] = useState<Record<string, string>>({});
    const handleGuidelineToggle = (itemKey: string, guidelineIndex: number, isChecked: boolean) => {
        const newGuidelineState = { ...state.guidelineState[itemKey], checked: { ...state.guidelineState[itemKey].checked, [guidelineIndex]: isChecked }};
        dispatch({ type: 'SET_GUIDELINE_STATE', payload: { itemKey, guidelineState: newGuidelineState }});
    };
    const handleAddSectionCustomGuideline = (itemKey: string) => {
        const newGuideline = sectionCustomGuidelineInput[itemKey]?.trim();
        if (newGuideline) {
            const newGuidelineState = { ...state.guidelineState[itemKey], custom: [...state.guidelineState[itemKey].custom, newGuideline]};
            dispatch({ type: 'SET_GUIDELINE_STATE', payload: { itemKey, guidelineState: newGuidelineState }});
            setSectionCustomGuidelineInput(prev => ({ ...prev, [itemKey]: '' }));
        }
    };
    const handleRemoveSectionCustomGuideline = (itemKey: string, indexToRemove: number) => {
        const newCustom = state.guidelineState[itemKey].custom.filter((_, i) => i !== indexToRemove);
        const newGuidelineState = { ...state.guidelineState[itemKey], custom: newCustom };
        dispatch({ type: 'SET_GUIDELINE_STATE', payload: { itemKey, guidelineState: newGuidelineState }});
    };

    const handleSectionUpdate = useCallback((key: SectionName, value: string) => dispatch({ type: 'UPDATE_SECTION', payload: { key, value } }), []);
    
    const getSelectedGuidelines = (itemKey: string) => {
        const agent = AGENTS.find(a => a.id.includes(itemKey));
        const guidelineState = state.guidelineState[itemKey];
        if (!agent || !guidelineState) return [];
        const promptConfig = agent.prompt as AgentPrompt;
        if (typeof promptConfig === 'string' || !promptConfig.guidelines) return [];
        const guidelines: string[] = [];
        promptConfig.guidelines.forEach((g, index) => {
            if (guidelineState.checked[index]) guidelines.push(g.text);
        });
        guidelines.push(...guidelineState.custom);
        return guidelines;
    }
    
    const generateInstructionText = (controls: ControlState) => {
        let instructions = [];
        let formalityDesc = "balanced";
        if (controls.formality < 33) formalityDesc = "informal";
        else if (controls.formality > 66) formalityDesc = "very formal";
        instructions.push(`- The writing style should be ${formalityDesc}.`);
        if (controls.tone && controls.tone !== "none") instructions.push(`- Adopt a ${controls.tone} tone.`);
        if (controls.wordCount) instructions.push(`- The response should be approximately ${controls.wordCount} words long.`);
        return instructions.join('\n');
    };

    const handleGenerateRequest = useCallback(async (endpoint: string, body: object, itemKey: string) => {
        dispatch({ type: 'GENERATION_START', payload: { item: itemKey } });
        try {
            if (!user) throw new Error("User not authenticated.");
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'API request failed');
            if (itemKey !== 'evaluate') await deductCredit(user.id, 1);
            
            if (endpoint.includes('diagrams')) {
                dispatch({ type: 'GENERATION_SUCCESS', payload: { diagrams: { ...state.diagrams, [itemKey as DiagramType]: result }, lastGenerated: itemKey as DiagramType }});
            } else if (itemKey === 'evaluate') {
                dispatch({ type: 'GENERATION_SUCCESS', payload: { evaluation: result, lastGenerated: 'evaluate' }});
            } else {
                 dispatch({ type: 'GENERATION_SUCCESS', payload: { sections: { ...state.sections, [itemKey as SectionName]: Object.values(result)[0] as string }, lastGenerated: itemKey as SectionName }});
            }
            toast({ title: "Generation Successful!", description: `Successfully generated ${itemKey}.` });
            await fetchUser();
        } catch (e: any) {
            dispatch({ type: 'GENERATION_FAILURE', payload: { error: e.message || 'An unexpected error occurred.', item: itemKey } });
            toast({ title: "Generation Failed", description: e.message, variant: 'destructive' });
        }
    }, [user, fetchUser, state.diagrams, state.sections, toast]);

    const handleGenerateReportSection = useCallback((section: SectionName) => {
        const body = {
            proposal: state.proposal,
            sectionToGenerate: section,
            otherSections: Object.fromEntries(Object.entries(state.sections || {}).filter(([key, value]) => state.contextSelections[section]?.[key] && value)),
            otherDiagrams: Object.fromEntries(Object.entries(state.diagrams || {}).filter(([key, value]) => state.contextSelections[section]?.[key] && value).map(([key, value]) => [key, value.plantUmlCode])),
            guidelines: getSelectedGuidelines(section),
            instructionText: generateInstructionText(state.controlState[section]),
            externalContextContent: state.contextSelections[section]?.['external'] ? state.externalContext?.content : undefined,
        };
        handleGenerateRequest('/api/generate-report', body, section);
    }, [state.proposal, state.sections, state.diagrams, state.contextSelections, state.controlState, state.guidelineState, state.externalContext, handleGenerateRequest]);

    const handleEvaluateReport = useCallback((formData: FormData) => {
        const criteria = formData.getAll('acceptanceCriteria').map(String).filter(c => c.trim() !== '').join('\n');
        const body = {
            proposal: state.proposal,
            reportSections: state.sections,
            diagrams: Object.fromEntries(Object.entries(state.diagrams || {}).map(([key, value]) => [key, value.plantUmlCode])),
            acceptanceCriteria: criteria.split('\n'),
        };
        handleGenerateRequest('/api/generate-report', body, 'evaluate');
    }, [state.proposal, state.sections, state.diagrams, handleGenerateRequest]);

    // --- DIAGRAM LOGIC ---
    const handleGenerateDiagram = useCallback((diagramType: DiagramType, guidelines: string[]) => {
        const body = {
            proposal: state.proposal,
            diagramToGenerate: diagramType,
            otherSections: Object.fromEntries(Object.entries(state.sections || {}).filter(([key, value]) => state.contextSelections[diagramType]?.[`section_${key}`] && value)),
            otherDiagrams: Object.fromEntries(Object.entries(state.diagrams || {}).filter(([key, value]) => state.contextSelections[diagramType]?.[`diagram_${key}`] && value).map(([key, value]) => [key, value.plantUmlCode])),
            guidelines,
            externalContextContent: state.contextSelections[diagramType]?.['external'] ? state.externalContext?.content : undefined,
        };
        handleGenerateRequest('/api/generate-diagrams', body, diagramType);
    }, [state.proposal, state.sections, state.diagrams, state.contextSelections, state.externalContext, handleGenerateRequest]);
    const handleDiagramCodeUpdate = useCallback((key: DiagramType, code: string) => dispatch({ type: 'UPDATE_DIAGRAM_CODE', payload: { key, code } }), []);
    const handleDiagramUpdate = useCallback((diagramType: DiagramType) => {
        const code = state.diagrams?.[diagramType]?.plantUmlCode;
        if (!code) return;
        handleGenerateRequest('/api/generate-diagrams', { intent: 'update_diagram', plantUmlCode: code }, diagramType);
    }, [state.diagrams, handleGenerateRequest]);

    // --- CODE LOGIC ---
    const setCodePrompt = useCallback((prompt: string) => dispatch({ type: 'SET_CODE_GENERATOR_STATE', payload: { prompt } }), []);
    const handleGenerateCode = useCallback(async () => {
        dispatch({ type: 'GENERATION_START', payload: { item: 'code' } });
        try {
            if (!user) throw new Error("User not authenticated.");
            await deductCredit(user.id, 1);
            const response = await fetch('/api/generate-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: state.codeGenerator.prompt }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'API request failed');
            dispatch({ type: 'GENERATION_SUCCESS', payload: { codeGenerator: { ...state.codeGenerator, ...result }, lastGenerated: 'code' }});
            await fetchUser();
        } catch(e: any) {
            dispatch({ type: 'GENERATION_FAILURE', payload: { error: e.message || 'An error occurred.', item: 'code' }});
        }
    }, [user, fetchUser, state.codeGenerator.prompt]);

    // --- PRESENTATION LOGIC ---
    const [presentationGuidelineInput, setPresentationGuidelineInput] = useState('');
    const handlePresentationGuidelineToggle = (index: number, checked: boolean) => {
        const itemKey = 'presentation';
        const newGuidelineState = { ...state.guidelineState[itemKey], checked: { ...state.guidelineState[itemKey].checked, [index]: checked }};
        dispatch({ type: 'SET_GUIDELINE_STATE', payload: { itemKey, guidelineState: newGuidelineState }});
    };
    const handleAddPresentationCustomGuideline = () => {
        const itemKey = 'presentation';
        const newGuideline = presentationGuidelineInput.trim();
        if (newGuideline) {
            const newGuidelineState = { ...state.guidelineState[itemKey], custom: [...state.guidelineState[itemKey].custom, newGuideline]};
            dispatch({ type: 'SET_GUIDELINE_STATE', payload: { itemKey, guidelineState: newGuidelineState }});
            setPresentationGuidelineInput('');
        }
    };
    const handleRemovePresentationCustomGuideline = (index: number) => {
        const itemKey = 'presentation';
        const newCustom = state.guidelineState[itemKey].custom.filter((_, i) => i !== index);
        const newGuidelineState = { ...state.guidelineState[itemKey], custom: newCustom };
        dispatch({ type: 'SET_GUIDELINE_STATE', payload: { itemKey, guidelineState: newGuidelineState }});
    };
    
    const handleGeneratePresentation = useCallback((guidelines: string[]) => {
        const body = {
            proposal: state.proposal,
            sections: Object.fromEntries(Object.entries(state.sections || {}).filter(([key]) => state.contextSelections['presentation']?.[`section_${key}`])),
            diagrams: Object.fromEntries(Object.entries(state.diagrams || {}).filter(([key]) => state.contextSelections['presentation']?.[`diagram_${key}`]).map(([key, value]) => [key, value.plantUmlCode])),
            guidelines
        };
        handleGenerateRequest('/api/generate-presentation', body, 'presentation').then(() => {
            // After successful generation, set the new presentation as active
            const newHistory = state.presentation?.history || [];
            if(newHistory.length > 0) {
                 dispatch({ type: 'SET_ACTIVE_PRESENTATION', payload: newHistory[0].id });
            }
        });
    }, [state.proposal, state.sections, state.diagrams, state.contextSelections, handleGenerateRequest, state.presentation?.history]);
    const setActivePresentationId = useCallback((id: string | null) => dispatch({ type: 'SET_ACTIVE_PRESENTATION', payload: id }), []);


    // --- GENERIC/SESSION ACTIONS ---
    const handleNewSession = useCallback(() => {
        dispatch({ type: 'NEW_SESSION' });
        localStorage.removeItem(DOCUMENTS_KEY);
        localStorage.removeItem(DIAGRAMS_KEY);
        localStorage.removeItem(PRESENTATION_KEY);
        localStorage.removeItem(CODE_GENERATOR_KEY);
        localStorage.removeItem('arkan-agents-state');
        localStorage.removeItem('arkan-docx-styles');
        localStorage.removeItem('arkan-pptx-styles');
        toast({ title: 'New Session Started', description: 'All content has been cleared.' });
    }, [toast]);
    
    const handleSaveProjectFile = useCallback(() => {
        if (!state.proposal) return;
        const { isGeneratingProposal, isAnythingGenerating, isLoaded, ...stateToSave } = state;
        const blob = new Blob([JSON.stringify(stateToSave, null, 2)], { type: 'application/json;charset=utf-8' });
        saveAs(blob, `${state.proposal.title.replace(/[\s\W]/g, '_') || 'arkan_project'}.json`);
    }, [state]);

    const handleLoadProjectFile = useCallback((file: File | null) => {
        if (!file) return;
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
    }, [toast]);
    
    const toggleContextSelection = useCallback((parentKey: string, contextKey: string) => dispatch({ type: 'TOGGLE_CONTEXT_SELECTION', payload: { parentKey, contextKey } }), []);
    const setExternalContext = useCallback((fileName: string, content: string) => dispatch({ type: 'SET_EXTERNAL_CONTEXT', payload: { fileName, content } }), []);
    const removeExternalContext = useCallback(() => dispatch({ type: 'REMOVE_EXTERNAL_CONTEXT' }), []);


    const value = useMemo(() => ({ 
        state,
        dispatch,
        setProjectIdea,
        handleGenerateProposal,
        handleProposalUpdate,
        handleNewSession,
        handleSaveProjectFile,
        handleLoadProjectFile,
        handleGenerateReportSection,
        handleSectionUpdate,
        handleEvaluateReport,
        handleGenerateDiagram,
        handleDiagramCodeUpdate,
        handleDiagramUpdate,
        setCodePrompt,
        handleGenerateCode,
        handleGeneratePresentation,
        setActivePresentationId,
        toggleContextSelection,
        setExternalContext,
        removeExternalContext,
        templates,
        handleTemplateChange,
        customGuidelines: state.customGuidelines,
        handleAddCustomGuideline,
        handleRemoveCustomGuideline,
        customGuidelineInput,
        setCustomGuidelineInput,
        controlState: state.controlState,
        handleControlChange,
        guidelineState: state.guidelineState,
        handleGuidelineToggle,
        setCustomGuidelineInput: setSectionCustomGuidelineInput,
        handleAddCustomGuideline: handleAddSectionCustomGuideline,
        handleRemoveCustomGuideline: handleRemoveSectionCustomGuideline,
        onGuidelineToggle: handlePresentationGuidelineToggle,
        onCustomGuidelineChange: setPresentationGuidelineInput,
        onAddCustomGuideline: handleAddPresentationCustomGuideline,
        onRemoveCustomGuideline: handleRemovePresentationCustomGuideline,
    }), [state, dispatch, setProjectIdea, handleGenerateProposal, handleProposalUpdate, handleNewSession, handleSaveProjectFile, handleLoadProjectFile, handleGenerateReportSection, handleSectionUpdate, handleEvaluateReport, handleGenerateDiagram, handleDiagramCodeUpdate, handleDiagramUpdate, setCodePrompt, handleGenerateCode, handleGeneratePresentation, setActivePresentationId, toggleContextSelection, setExternalContext, removeExternalContext, templates, handleTemplateChange, state.customGuidelines, handleAddCustomGuideline, handleRemoveCustomGuideline, customGuidelineInput, state.controlState, handleControlChange, state.guidelineState, handleGuidelineToggle, setSectionCustomGuidelineInput, handleAddSectionCustomGuideline, handleRemoveSectionCustomGuideline, handlePresentationGuidelineToggle, setPresentationGuidelineInput, handleAddPresentationCustomGuideline, handleRemovePresentationCustomGuideline]);

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
