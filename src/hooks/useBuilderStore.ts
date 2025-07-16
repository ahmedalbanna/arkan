
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { type ProjectProposal, type SectionName, type DiagramType, type PresentationSlide, SectionNameSchema, DiagramTypeSchema } from '@/ai/schemas';
import type { EvaluateReportOutput } from '@/ai/flows/evaluate-report';
import { toast } from '@/hooks/use-toast';
import { saveAs } from 'file-saver';
import { z } from 'zod';
import { deductCredit } from '@/services/credit-service';
import { templates as proposalTemplates, type ProposalTemplateKey, type ProposalTemplate } from '@/lib/proposal-templates';
import { AGENTS } from '@/lib/agents';
import type { AgentPrompt } from '@/lib/agents';
import { presentationConfig } from '@/lib/report-config';
import type { UserProfile } from '@/lib/db/queries';


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
  
  // UI States
  selectedTemplate: ProposalTemplateKey;
  customGuidelines: string[];
  controlState: Record<SectionName, ControlState>;
  guidelineState: Record<string, GuidelineState>;
  customGuidelineInput: Record<string, string>;
  activePresentationId: string | null;
  pdfFile: File | null;
  isUploading: boolean;
}

type AuthParams = [user: UserProfile, fetchUser: () => Promise<void>];

interface BuilderActions {
    // Basic Actions
    newSession: () => void;
    loadState: (state: Partial<BuilderState>) => void;
    setProjectIdea: (idea: string) => void;
    // Proposal Actions
    handleGenerateProposal: (...auth: AuthParams) => void;
    handleProposalUpdate: (path: string, value: any) => void;
    // Report & Diagram Actions
    handleGenerateReportSection: (section: SectionName, ...auth: AuthParams) => void;
    handleSectionUpdate: (key: SectionName, value: string) => void;
    handleEvaluateReport: (formData: FormData, ...auth: AuthParams) => void;
    handleGenerateDiagram: (diagramType: DiagramType, ...auth: AuthParams) => void;
    handleDiagramCodeUpdate: (key: DiagramType, code: string) => void;
    handleDiagramUpdate: (diagramType: DiagramType, ...auth: AuthParams) => void;
    // Code Generator Actions
    setCodePrompt: (prompt: string) => void;
    handleGenerateCode: (...auth: AuthParams) => void;
    // Presentation Actions
    handleGeneratePresentation: (...auth: AuthParams) => void;
    setActivePresentationId: (id: string | null) => void;
    // Context Actions
    toggleContextSelection: (parentKey: string, contextKey: string) => void;
    setExternalContext: (fileName: string, content: string) => void;
    removeExternalContext: () => void;
    // UI State Actions
    handleTemplateChange: (key: ProposalTemplateKey) => void;
    handleAddCustomGuideline: () => void;
    handleRemoveCustomGuideline: (index: number) => void;
    setCustomGuidelineInput: (value: string) => void;
    handleControlChange: (section: SectionName, field: keyof ControlState, value: string | number) => void;
    handleGuidelineToggle: (itemKey: string, guidelineIndex: number, isChecked: boolean) => void;
    setCustomGuidelineInputForItem: (itemKey: string, value: string) => void;
    handleAddCustomGuidelineForItem: (itemKey: string) => void;
    handleRemoveCustomGuidelineForItem: (itemKey: string, index: number) => void;
    setPdfFile: (file: File | null) => void;
    handlePdfUpload: (...auth: AuthParams) => void;
}

const getInitialGuidelineStates = (): Record<string, GuidelineState> => {
    const initialState: Record<string, GuidelineState> = {};
    AGENTS.forEach(agent => {
        const prompt = agent.prompt as AgentPrompt | undefined;
        if (prompt?.guidelines) {
            const checked: Record<number, boolean> = {};
            prompt.guidelines.forEach((g, index) => {
                checked[index] = g.isDefault;
            });
            const key = agent.id.replace('generate-', '');
            initialState[key] = { checked, custom: [] };
        }
    });
    // Add presentation specifically if not covered by agent loop logic
    if (!initialState['presentation']) {
        const presentationAgent = AGENTS.find(a => a.id === 'generate-presentation');
        const prompt = presentationAgent?.prompt as AgentPrompt | undefined;
        if (prompt?.guidelines) {
             const checked: Record<number, boolean> = {};
             prompt.guidelines.forEach((g, index) => {
                checked[index] = g.isDefault;
             });
             initialState['presentation'] = { checked, custom: [] };
        }
    }
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
  selectedTemplate: 'default',
  customGuidelines: [],
  controlState: getInitialControlState(),
  guidelineState: getInitialGuidelineStates(),
  customGuidelineInput: {},
  activePresentationId: null,
  pdfFile: null,
  isUploading: false,
};

// Helper function to extract selected guidelines for a specific item
const getSelectedGuidelines = (itemKey: string, state: BuilderState): string[] => {
    const agentIdSuffix = itemKey;
    const agent = AGENTS.find(a => a.id.endsWith(agentIdSuffix));
    const currentGuidelineState = state.guidelineState[itemKey];
    
    if (!agent || !currentGuidelineState) return state.guidelineState[itemKey]?.custom || [];

    const promptConfig = agent.prompt as AgentPrompt;
    if (typeof promptConfig === 'string' || !promptConfig.guidelines) {
        return currentGuidelineState.custom || [];
    }

    const guidelines: string[] = [];
    promptConfig.guidelines.forEach((g, index) => {
        if (currentGuidelineState.checked[index]) guidelines.push(g.text);
    });
    guidelines.push(...currentGuidelineState.custom);
    return guidelines;
};

// Helper function to generate instruction text from control state
const generateInstructionText = (controls: ControlState): string => {
    let instructions = [];
    let formalityDesc = "balanced";
    if (controls.formality < 33) formalityDesc = "informal";
    else if (controls.formality > 66) formalityDesc = "very formal";
    instructions.push(`- The writing style should be ${formalityDesc}.`);
    if (controls.tone && controls.tone !== "none") instructions.push(`- Adopt a ${controls.tone} tone.`);
    if (controls.wordCount) instructions.push(`- The response should be approximately ${controls.wordCount} words long.`);
    return instructions.join('\n');
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
        set(payload);
        toast({ title: 'Project Loaded', description: `Successfully loaded "${newState.proposal?.title || 'project'}".` });
      },
      setProjectIdea: (idea) => set({ projectIdea: idea }),
      
      // --- UNIVERSAL GENERATION HANDLER (internal) ---
      _handleGenerateRequest: async (endpoint: string, body: object, itemKey: string, auth: AuthParams, options: { creditCost?: number } = {}) => {
          const [user, fetchUser] = auth;
          const { creditCost = 1 } = options;

          set({ isAnythingGenerating: true, error: undefined, lastGenerated: itemKey as any });
          try {
              if (!user) throw new Error("User not authenticated.");
              if (creditCost > 0) {
                 await deductCredit(user.id, creditCost);
              }

              const response = await fetch(endpoint, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(body),
              });
              const result = await response.json();
              if (!response.ok) throw new Error(result.message || 'API request failed');
              
              if (endpoint.includes('diagrams')) {
                  set((state) => ({ diagrams: { ...state.diagrams, [itemKey as DiagramType]: result }}));
              } else if (itemKey === 'evaluate') {
                  set({ evaluation: result });
              } else if(itemKey === 'presentation') {
                  const newEntry: PresentationHistoryEntry = {
                      id: new Date().toISOString(),
                      name: `Presentation - ${new Date().toLocaleTimeString()}`,
                      slides: result.slides,
                  };
                  set(state => ({ presentation: { history: [newEntry, ...(state.presentation?.history || [])] }, activePresentationId: newEntry.id }));
              } else if (itemKey === 'code') {
                  set({ codeGenerator: { ...get().codeGenerator, ...result } });
              } else {
                  set(state => ({ sections: { ...state.sections, [itemKey as SectionName]: Object.values(result)[0] as string }}));
              }
              
              if (creditCost > 0) {
                  await fetchUser();
              }
              toast({ title: "Generation Successful!", description: `Successfully generated ${itemKey}.` });

          } catch (e: any) {
              set({ error: e.message || 'An unexpected error occurred.' });
              toast({ title: "Generation Failed", description: e.message, variant: "destructive" });
          } finally {
              set({ isAnythingGenerating: false });
          }
      },
      
      // --- PROPOSAL ACTIONS ---
      handleGenerateProposal: async (...auth) => {
          const { projectIdea, selectedTemplate, customGuidelines } = get();
          const currentTemplate = proposalTemplates[selectedTemplate];
          let fullPrompt = currentTemplate.prompt;
          const allGuidelines = [...(currentTemplate.guidelines || []), ...customGuidelines];
          if (allGuidelines.length > 0) {
              fullPrompt += '\n\nAdditionally, please adhere to the following guidelines:\n' + allGuidelines.map(g => `- ${g}`).join('\n');
          }

          set({ isGeneratingProposal: true, error: undefined, lastGenerated: 'proposal' });
          try {
              const [user, fetchUser] = auth;
              if (!user) throw new Error("User not authenticated.");
              await deductCredit(user.id, 1);
              const response = await fetch('/api/generate-proposal', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ projectIdea: projectIdea, prompt: fullPrompt })
              });
              const result = await response.json();
              if (!response.ok) throw new Error(result.message || 'API request failed');
              set({
                  proposal: result,
                  proposalJson: JSON.stringify(result, null, 2),
                  isGeneratingProposal: false,
                  error: undefined,
                  sections: {},
                  diagrams: {},
                  evaluation: undefined,
                  presentation: { history: [] },
              });
              await fetchUser();
              toast({ title: 'Proposal Generated', description: 'Your project proposal has been created successfully.' });
          } catch (e: any) {
              set({ isGeneratingProposal: false, error: e.message || 'An unexpected error occurred.' });
              toast({ title: 'Generation Failed', description: e.message, variant: 'destructive' });
          } finally {
              set({ isGeneratingProposal: false });
          }
      },
      handleProposalUpdate: (path, value) => {
          const { proposal } = get();
          if (!proposal) return;
          const newProposal = JSON.parse(JSON.stringify(proposal));
          let current = newProposal;
          const keys = path.split('.');
          for (let i = 0; i < keys.length - 1; i++) { current = current[keys[i]]; }
          current[keys[keys.length - 1]] = value;
          set({ proposal: newProposal, proposalJson: JSON.stringify(newProposal, null, 2) });
      },

      // --- REPORT, DIAGRAM, PRESENTATION ACTIONS ---
      handleGenerateReportSection: (section, ...auth) => {
          const state = get();
          const body = {
              proposal: state.proposal,
              sectionToGenerate: section,
              otherSections: Object.fromEntries(Object.entries(state.sections || {}).filter(([key, value]) => state.contextSelections[section]?.[key] && value)),
              otherDiagrams: Object.fromEntries(Object.entries(state.diagrams || {}).filter(([key, value]) => state.contextSelections[section]?.[key] && value).map(([key, value]) => [key, value.plantUmlCode])),
              guidelines: getSelectedGuidelines(section, state),
              instructionText: generateInstructionText(state.controlState[section]),
              externalContextContent: state.contextSelections[section]?.['external'] ? state.externalContext?.content : undefined,
          };
          state._handleGenerateRequest('/api/generate-report', body, section, auth);
      },
      handleSectionUpdate: (key, value) => set(state => ({ sections: { ...state.sections, [key]: value } })),
      
      handleEvaluateReport: (formData, ...auth) => {
          const state = get();
          const criteria = formData.get('acceptanceCriteria')?.toString() || '';
          if (!criteria.trim()) {
              toast({ title: "Evaluation Skipped", description: "Please provide acceptance criteria.", variant: 'destructive' });
              return;
          }
          const body = {
              proposal: state.proposal,
              reportSections: state.sections,
              diagrams: Object.fromEntries(Object.entries(state.diagrams || {}).map(([key, value]) => [key, value.plantUmlCode])),
              acceptanceCriteria: criteria.split('\n').filter(c => c.trim()),
          };
          state._handleGenerateRequest('/api/evaluate-report', body, 'evaluate', auth, {creditCost: 0}); // Assuming evaluation is free
      },

      handleGenerateDiagram: (diagramType, ...auth) => {
          const state = get();
          const body = {
              proposal: state.proposal,
              diagramToGenerate: diagramType,
              otherSections: Object.fromEntries(Object.entries(state.sections || {}).filter(([key, value]) => state.contextSelections[diagramType]?.[`section_${key}`] && value)),
              otherDiagrams: Object.fromEntries(Object.entries(state.diagrams || {}).filter(([key, value]) => state.contextSelections[diagramType]?.[`diagram_${key}`] && value).map(([key, value]) => [key, value.plantUmlCode])),
              guidelines: getSelectedGuidelines(diagramType, state),
              externalContextContent: state.contextSelections[diagramType]?.['external'] ? state.externalContext?.content : undefined,
          };
          state._handleGenerateRequest('/api/generate-diagrams', body, diagramType, auth);
      },

      handleDiagramCodeUpdate: (key, code) => set(state => ({ diagrams: { ...state.diagrams, [key]: { ...state.diagrams![key]!, plantUmlCode: code } } })),
      
      handleDiagramUpdate: (diagramType, ...auth) => {
          const { diagrams } = get();
          const code = diagrams?.[diagramType]?.plantUmlCode;
          if (!code) return;
          get()._handleGenerateRequest('/api/generate-diagrams', { intent: 'update_diagram', plantUmlCode: code }, diagramType, auth, {creditCost: 0});
      },

      handleGeneratePresentation: (...auth) => {
          const state = get();
          const body = {
              proposal: state.proposal,
              sections: Object.fromEntries(Object.entries(state.sections || {}).filter(([key]) => state.contextSelections['presentation']?.[`section_${key}`])),
              diagrams: Object.fromEntries(Object.entries(state.diagrams || {}).filter(([key]) => state.contextSelections['presentation']?.[`diagram_${key}`]).map(([key, value]) => [key, value.plantUmlCode])),
              guidelines: getSelectedGuidelines('presentation', state),
          };
          state._handleGenerateRequest('/api/generate-presentation', body, 'presentation', auth);
      },
      setActivePresentationId: (id) => set({ activePresentationId: id }),
      
      // --- CODE GENERATOR ACTIONS ---
      setCodePrompt: (prompt) => set(state => ({ codeGenerator: { ...state.codeGenerator, prompt } })),
      handleGenerateCode: async (...auth) => {
          const { codeGenerator } = get();
          get()._handleGenerateRequest('/api/generate-code', { prompt: codeGenerator.prompt }, 'code', auth);
      },
      
      // --- CONTEXT ACTIONS ---
      toggleContextSelection: (parentKey, contextKey) => set(state => {
          const newSelections = JSON.parse(JSON.stringify(state.contextSelections));
          if (!newSelections[parentKey]) newSelections[parentKey] = {};
          newSelections[parentKey][contextKey] = !newSelections[parentKey][contextKey];
          return { contextSelections: newSelections };
      }),
      setExternalContext: (fileName, content) => set({ externalContext: { fileName, content } }),
      removeExternalContext: () => set({ externalContext: undefined, pdfFile: null }),
      
      // --- UI STATE ACTIONS ---
      handleTemplateChange: (key) => set({ selectedTemplate: key }),
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
      handleControlChange: (section, field, value) => set(state => ({ controlState: { ...state.controlState, [section]: { ...state.controlState[section], [field]: value } } })),
      handleGuidelineToggle: (itemKey, guidelineIndex, isChecked) => set(state => {
          const newGuidelineState = { ...state.guidelineState[itemKey], checked: { ...state.guidelineState[itemKey].checked, [guidelineIndex]: isChecked }};
          return { guidelineState: { ...state.guidelineState, [itemKey]: newGuidelineState }};
      }),
      setCustomGuidelineInputForItem: (itemKey, value) => set(state => ({ customGuidelineInput: { ...state.customGuidelineInput, [itemKey]: value } })),
      handleAddCustomGuidelineForItem: (itemKey) => {
          const { guidelineState, customGuidelineInput } = get();
          const newGuideline = customGuidelineInput[itemKey]?.trim();
          if (newGuideline) {
              const newGuidelineState = { ...guidelineState[itemKey], custom: [...(guidelineState[itemKey]?.custom || []), newGuideline]};
              set(state => ({
                  guidelineState: { ...state.guidelineState, [itemKey]: newGuidelineState },
                  customGuidelineInput: { ...state.customGuidelineInput, [itemKey]: '' }
              }));
          }
      },
      handleRemoveCustomGuidelineForItem: (itemKey, index) => set(state => {
          const newCustom = state.guidelineState[itemKey].custom.filter((_, i) => i !== index);
          const newGuidelineState = { ...state.guidelineState[itemKey], custom: newCustom };
          return { guidelineState: { ...state.guidelineState, [itemKey]: newGuidelineState }};
      }),
      setPdfFile: (file) => set({ pdfFile: file }),
      handlePdfUpload: async (...auth) => {
        const { pdfFile } = get();
        if (!pdfFile) return;

        set({ isUploading: true });
        const formData = new FormData();
        formData.append('file', pdfFile);

        try {
            const [user] = auth;
            if (!user) throw new Error("User not found for PDF upload.");
            await deductCredit(user.id, 1);

            const response = await fetch('/api/pdf-to-markdown', { method: 'POST', body: formData });
            if (!response.ok) {
                const errorResult = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
                throw new Error(errorResult.message);
            }
            const result = await response.json();
            set({ externalContext: { fileName: pdfFile.name, content: result.markdown } });
            await auth[1](); // fetchUser
            toast({ title: "Context Added", description: `Successfully processed ${pdfFile.name}.` });
        } catch (error: any) {
            toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
        } finally {
            set({ isUploading: false });
        }
    },
    }),
    {
      name: 'arkan-builder-state',
      storage: createJSONStorage(() => localStorage),
      // Only persist user-generated content, not transient UI state
      partialize: (state) => ({
        proposal: state.proposal,
        sections: state.sections,
        diagrams: state.diagrams,
        presentation: state.presentation,
        codeGenerator: state.codeGenerator,
        projectIdea: state.projectIdea,
      }),
      onRehydrateStorage: () => (state, error) => {
          if (state) {
              state.isGeneratingProposal = false;
              state.isAnythingGenerating = false;
              state.error = undefined;
              state.lastGenerated = null;
          }
      }
    }
  )
);
