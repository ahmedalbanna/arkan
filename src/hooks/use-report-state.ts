
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
  // This hook now only manages UI state, like which item is currently being generated.
  // The actual data (sections, diagrams) is now managed by the global BuilderState.
}

export function useReportState() {
  const { state: builderState, dispatch: builderDispatch } = useBuilderState();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isGenerating, startTransition] = useTransition();
  const [generatingItem, setGeneratingItem] = useState<string | null>(null);

  const { toast } = useToast();
  const { user, fetchUser } = useAuth();
  
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  
  // Action handlers now dispatch to the global builder context
  const handleSectionUpdate = (key: SectionName, value: string) => builderDispatch({ type: 'UPDATE_SECTION', payload: { key, value } });
  const handleDiagramCodeUpdate = (key: DiagramType, code: string) => builderDispatch({ type: 'UPDATE_DIAGRAM_CODE', payload: { key, code }});
  
  const handleDiagramUpdate = (diagramType: DiagramType) => {
    const code = builderState.diagrams?.[diagramType]?.plantUmlCode;
    if (!code) {
        toast({ title: 'Update Failed', description: 'Could not find code to update diagram.', variant: 'destructive' });
        return;
    }
    const formData = new FormData();
    if(builderState.proposalJson) formData.set('proposalJson', builderState.proposalJson);
    formData.set('itemToGenerate', diagramType);
    formData.set('intent', 'update_diagram');
    formData.set('plantUmlCode', code);
    handleSubmit(formData);
  };
  
  const toggleContextSelection = (parentKey: string, contextKey: string) => builderDispatch({ type: 'TOGGLE_CONTEXT_SELECTION', payload: { parentKey, contextKey } });
  const setExternalContext = (fileName: string, content: string) => builderDispatch({ type: 'SET_EXTERNAL_CONTEXT', payload: { fileName, content } });
  const removeExternalContext = () => builderDispatch({ type: 'REMOVE_EXTERNAL_CONTEXT' });
  
  const handleSubmit = (formData: FormData) => {
    const item = (formData.get('itemToGenerate') || formData.get('diagramToUpdate')) as string;
    if (!item) return;

    if (builderState.externalContext) {
      formData.set('externalContextContent', builderState.externalContext.content);
    }
    
    setGeneratingItem(item);
    builderDispatch({ type: 'GENERATION_START', payload: { item } });
    startTransition(async () => {
      try {
        if (!user) throw new Error("User not authenticated.");

        const isDiagram = DiagramTypeSchema.options.includes(item as DiagramType);
        const endpoint = isDiagram ? '/api/generate-diagrams' : '/api/generate-report';
        
        const otherDiagrams: Record<string, string> = {};
        if (builderState.contextSelections[item]) {
            for (const fullContextKey in builderState.contextSelections[item]) {
                if (builderState.contextSelections[item][fullContextKey]) {
                     if (fullContextKey.startsWith('diagram_')) {
                        const contextKey = fullContextKey.substring(8) as DiagramType;
                        if (builderState.diagrams?.[contextKey]) {
                            otherDiagrams[contextKey] = builderState.diagrams[contextKey]!.plantUmlCode;
                        }
                    }
                }
            }
        }
        
        const otherSections: Record<string, string> = {};
        if (builderState.contextSelections[item]) {
            for (const fullContextKey in builderState.contextSelections[item]) {
                if (builderState.contextSelections[item][fullContextKey]) {
                    if (fullContextKey.startsWith('section_')) {
                        const contextKey = fullContextKey.substring(8) as SectionName;
                        if (builderState.sections?.[contextKey]) {
                            otherSections[contextKey] = builderState.sections[contextKey]!;
                        }
                    }
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
                externalContextContent: builderState.externalContext?.content,
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
              diagrams: { ...builderState.diagrams, [item as DiagramType]: { plantUmlCode: result.plantUmlCode, imageUrl: result.imageUrl } },
              lastGenerated: item as DiagramType,
            }});
        } else {
            builderDispatch({ type: 'GENERATION_SUCCESS', payload: {
                sections: { ...builderState.sections, [item as SectionName]: Object.values(result)[0] as string },
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
    state: builderState, // Pass the global state through
    proposal: builderState.proposal,
    isLoaded,
    generatingItem,
    isAnythingGenerating: builderState.isAnythingGenerating,
    handleSectionUpdate,
    handleDiagramCodeUpdate,
    handleDiagramUpdate,
    handleSubmit,
    contextSelections: builderState.contextSelections,
    toggleContextSelection,
    setExternalContext,
    removeExternalContext,
  };
}
