
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { type ProjectProposal, type SectionName, type DiagramType, type PresentationSlide, SectionNameSchema, DiagramTypeSchema } from '@/ai/schemas';
import type { EvaluateReportOutput } from '@/ai/flows/evaluate-report';
import { toast } from '@/hooks/use-toast';
import { AGENTS } from '@/lib/agents';
import type { AgentPrompt } from '@/lib/agents';
import { type ProposalTemplateKey, templates as proposalTemplates } from '@/lib/proposal-templates';
import { PRESENTATION_GENERATION_TEMPLATES } from '@/lib/presentation-generation-templates';


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

export type ControlState = {
    formality: number;
    tone: string;
    wordCount: string;
};
export type GuidelineState = {
    checked: Record<number, boolean>;
    custom: string[];
};

export interface ContextSelection {
  sections: Partial<Record<SectionName, boolean>>;
  diagrams: Partial<Record<DiagramType, boolean>>;
  externalContext: boolean;
}


export interface BuilderState {
  projectIdea: string;
  proposal: ProjectProposal | null;
  sections: { [key in SectionName]?: string };
  diagrams: { [key in DiagramType]?: { plantUmlCode: string; imageUrl: string } };
  evaluation?: EvaluateReportOutput;
  presentation?: { history: PresentationHistoryEntry[] };
  codeGenerator: CodeGenerationState;
  externalContext?: { fileName: string; content: string };
  
  // UI States
  selectedTemplate: ProposalTemplateKey;
  selectedReportTemplateId: string;
  selectedPresentationTemplateId: string; // New state
  customGuidelines: string[];
  controlState: Record<SectionName, ControlState>;
  guidelineState: Record<string, GuidelineState>;
  customGuidelineInput: Record<string, string>;
  activePresentationId: string | null;
  contextSelection: Record<string, ContextSelection>;
}

interface BuilderActions {
    // Basic Actions
    newSession: () => void;
    loadState: (state: Partial<BuilderState>) => void;
    setProjectIdea: (idea: string) => void;
    // Proposal Actions
    setProposal: (proposal: ProjectProposal | null) => void;
    handleProposalUpdate: (path: string, value: any) => void;
    // Report & Diagram Actions
    setSection: (key: SectionName, content: string) => void;
    setAllSections: (sections: { [key in SectionName]?: string }) => void;
    handleSectionUpdate: (key: SectionName, value: string) => void;
    setEvaluation: (evaluation: EvaluateReportOutput | undefined) => void;
    setDiagram: (key: DiagramType, data: { plantUmlCode: string; imageUrl: string }) => void;
    handleDiagramCodeUpdate: (key: DiagramType, code: string) => void;
    // Code Generator Actions
    setCodePrompt: (prompt: string) => void;
    setGeneratedCode: (code: Partial<CodeGenerationState>) => void;
    // Presentation Actions
    addPresentationToHistory: (entry: PresentationHistoryEntry) => void;
    setActivePresentationId: (id: string | null) => void;
    // Context Actions
    setExternalContext: (fileName: string, content: string) => void;
    removeExternalContext: () => void;
    toggleContextSelection: (itemKey: string, contextType: 'sections' | 'diagrams' | 'externalContext', contextKey: SectionName | DiagramType | null, isSelected: boolean) => void;
    // UI State Actions
    handleTemplateChange: (key: ProposalTemplateKey) => void;
    setSelectedReportTemplateId: (id: string) => void;
    setSelectedPresentationTemplateId: (id: string) => void; // New action
    handleAddCustomGuideline: () => void;
    handleRemoveCustomGuideline: (index: number) => void;
    setCustomGuidelineInput: (value: string) => void;
    handleControlChange: (section: SectionName, field: keyof ControlState, value: string | number) => void;
    handleGuidelineToggle: (itemKey: string, guidelineIndex: number, isChecked: boolean) => void;
    setCustomGuidelineInputForItem: (itemKey: string, value: string) => void;
    handleAddCustomGuidelineForItem: (itemKey: string) => void;
    handleRemoveCustomGuidelineForItem: (itemKey: string, index: number) => void;
}

const getInitialGuidelineStates = (): Record<string, GuidelineState> => {
    const initialState: Record<string, GuidelineState> = {};
    const allItemKeys = [
      ...SectionNameSchema.options, 
      ...DiagramTypeSchema.options, 
      'presentation', 
      'proposal'
    ];

    allItemKeys.forEach(itemKey => {
      let agent;
      if (itemKey === 'proposal') {
          agent = AGENTS.find(a => a.id === 'generate-proposal-report');
      } else if (itemKey === 'presentation') {
          agent = AGENTS.find(a => a.id === 'generate-presentation');
      } else {
          agent = AGENTS.find(a => a.id.includes(itemKey));
      }

      if (agent && typeof agent.prompt === 'object' && agent.prompt.guidelines) {
          const checked: Record<number, boolean> = {};
          agent.prompt.guidelines.forEach((g, index) => {
              checked[index] = g.isDefault;
          });
          initialState[itemKey] = { checked, custom: [] };
      } else {
          initialState[itemKey] = { checked: {}, custom: [] };
      }
    });

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
  sections: {},
  diagrams: {},
  evaluation: undefined,
  presentation: { history: [] },
  codeGenerator: { prompt: '', html: '', css: '', javascript: '' },
  externalContext: undefined,
  selectedTemplate: 'default',
  selectedReportTemplateId: 'software-report',
  selectedPresentationTemplateId: 'software-presentation', // New state
  customGuidelines: [],
  controlState: getInitialControlState(),
  guidelineState: getInitialGuidelineStates(),
  customGuidelineInput: {},
  activePresentationId: null,
  contextSelection: {},
};


export const useBuilderStore = create<BuilderState & BuilderActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // --- GENERIC ACTIONS ---
      newSession: () => {
        set(initialState);
        toast({ title: 'New Session Started', description: 'All content has been cleared.' });
      },
      loadState: (newState) => {
        const payload: Partial<BuilderState> = {};
        if (newState.proposal) payload.proposal = newState.proposal;
        if (newState.sections) payload.sections = newState.sections;
        if (newState.diagrams) payload.diagrams = newState.diagrams;
        if (newState.presentation) payload.presentation = newState.presentation;
        if (newState.codeGenerator) payload.codeGenerator = newState.codeGenerator;
        // Reset transient UI state on load
        payload.contextSelection = {};
        set(payload);
        toast({ title: 'Project Loaded', description: `Successfully loaded "${newState.proposal?.title || 'project'}".` });
      },
      setProjectIdea: (idea) => set({ projectIdea: idea }),
      
      // --- PROPOSAL ACTIONS ---
      setProposal: (proposal) => {
        set({
          proposal,
          // Clear downstream state when a new proposal is set
          sections: {},
          diagrams: {},
          evaluation: undefined,
          presentation: { history: [] },
          contextSelection: {},
        });
      },
      handleProposalUpdate: (path, value) => {
          const { proposal } = get();
          if (!proposal) return;
          const newProposal = JSON.parse(JSON.stringify(proposal));
          let current = newProposal;
          const keys = path.split('.');
          for (let i = 0; i < keys.length - 1; i++) { current = current[keys[i]]; }
          current[keys[keys.length - 1]] = value;
          set({ proposal: newProposal });
      },

      // --- REPORT, DIAGRAM, PRESENTATION ACTIONS ---
      setSection: (key, content) => set(state => ({ sections: { ...state.sections, [key]: content }})),
      setAllSections: (sections) => set(state => ({ sections: { ...state.sections, ...sections } })),
      handleSectionUpdate: (key, value) => set(state => ({ sections: { ...state.sections, [key]: value } })),
      setEvaluation: (evaluation) => set({ evaluation }),
      setDiagram: (key, data) => set(state => ({ diagrams: { ...state.diagrams, [key]: data } })),
      handleDiagramCodeUpdate: (key, code) => set(state => ({ diagrams: { ...state.diagrams!, [key]: { ...state.diagrams![key]!, plantUmlCode: code } } })),

      // --- PRESENTATION ACTIONS ---
      addPresentationToHistory: (entry) => {
          set(state => ({
              presentation: { history: [entry, ...(state.presentation?.history || [])] },
              activePresentationId: entry.id
          }));
      },
      setActivePresentationId: (id) => set({ activePresentationId: id }),
      
      // --- CODE GENERATOR ACTIONS ---
      setCodePrompt: (prompt) => set(state => ({ codeGenerator: { ...state.codeGenerator, prompt } })),
      setGeneratedCode: (code) => set(state => ({ codeGenerator: { ...state.codeGenerator, ...code }})),
      
      // --- CONTEXT ACTIONS ---
      setExternalContext: (fileName, content) => set({ externalContext: { fileName, content } }),
      removeExternalContext: () => set({ externalContext: undefined }),
      toggleContextSelection: (itemKey, contextType, contextKey, isSelected) => {
        set(state => {
          const newContextSelection = { ...state.contextSelection };
          if (!newContextSelection[itemKey]) {
            newContextSelection[itemKey] = { sections: {}, diagrams: {}, externalContext: false };
          }
          if (contextType === 'externalContext') {
            newContextSelection[itemKey].externalContext = isSelected;
          } else if (contextKey) {
            newContextSelection[itemKey][contextType][contextKey as any] = isSelected;
          }
          return { contextSelection: newContextSelection };
        });
      },
      
      // --- UI STATE ACTIONS ---
      handleTemplateChange: (key) => set({ selectedTemplate: key }),
      setSelectedReportTemplateId: (id) => set({ selectedReportTemplateId: id }),
      setSelectedPresentationTemplateId: (id) => set({ selectedPresentationTemplateId: id }), // New action
      handleAddCustomGuideline: () => {
          const { customGuidelines, customGuidelineInput } = get();
          const newGuideline = customGuidelineInput['proposal']?.trim();
          if (newGuideline) {
              set({
                  customGuidelines: [...customGuidelines, newGuideline],
                  customGuidelineInput: { ...customGuidelineInput, 'proposal': '' }
              });
          }
      },
      handleRemoveCustomGuideline: (index) => set(state => ({ customGuidelines: state.customGuidelines.filter((_, i) => i !== index) })),
      setCustomGuidelineInput: (value) => set(state => ({ customGuidelineInput: { ...state.customGuidelineInput, 'proposal': value }})),
      handleControlChange: (section, field, value) => set(state => ({ controlState: { ...state.controlState, [section]: { ...state.controlState[section]!, [field]: value } } })),
      
      handleGuidelineToggle: (itemKey, guidelineIndex, isChecked) => set(state => {
        const itemGuidelineState = state.guidelineState[itemKey] || { checked: {}, custom: [] };
        const newGuidelineState = {
            ...itemGuidelineState,
            checked: {
                ...itemGuidelineState.checked,
                [guidelineIndex]: isChecked,
            },
        };
        return {
            guidelineState: {
                ...state.guidelineState,
                [itemKey]: newGuidelineState,
            },
        };
      }),
      setCustomGuidelineInputForItem: (itemKey, value) => set(state => ({ customGuidelineInput: { ...state.customGuidelineInput, [itemKey]: value } })),
      handleAddCustomGuidelineForItem: (itemKey) => {
          const { guidelineState, customGuidelineInput } = get();
          const newGuideline = customGuidelineInput[itemKey]?.trim();
          if (newGuideline) {
              const itemState = guidelineState[itemKey] || { checked: {}, custom: [] };
              const newGuidelineState = { ...itemState, custom: [...itemState.custom, newGuideline]};
              set(state => ({
                  guidelineState: { ...state.guidelineState, [itemKey]: newGuidelineState },
                  customGuidelineInput: { ...state.customGuidelineInput, [itemKey]: '' }
              }));
          }
      },
      handleRemoveCustomGuidelineForItem: (itemKey, index) => set(state => {
          const itemState = state.guidelineState[itemKey]!;
          const newCustom = itemState.custom.filter((_, i) => i !== index);
          const newGuidelineState = { ...itemState, custom: newCustom };
          return { guidelineState: { ...state.guidelineState, [itemKey]: newGuidelineState }};
      }),
    }),
    {
      name: 'arkan-builder-state',
      storage: createJSONStorage(() => localStorage),
      // Only persist user-generated content, not transient UI state
      partialize: (state) => ({
        projectIdea: state.projectIdea,
        proposal: state.proposal,
        sections: state.sections,
        diagrams: state.diagrams,
        presentation: state.presentation,
        codeGenerator: state.codeGenerator,
        externalContext: state.externalContext,
      }),
    }
  )
);
