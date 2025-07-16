
'use client';

import { useState, useReducer, useTransition, useEffect, useCallback } from 'react';
import { z } from 'zod';
import { DiagramTypeSchema, type DiagramType, SectionNameSchema, type SectionName } from '@/ai/schemas';
import { deductCredit } from '@/services/credit-service';
import { useAuth } from '@/context/AuthContext';
import { useToast } from './use-toast';
import { useBuilderState } from '@/context/BuilderStateContext';

const DIAGRAMS_KEY = 'arkan-diagrams';

export function useDiagramBuilder() {
    const { state: builderState, dispatch: builderDispatch } = useBuilderState();
    const [isGenerating, startTransition] = useTransition();
    const [generatingDiagram, setGeneratingDiagram] = useState<DiagramType | null>(null);

    const { user, fetchUser } = useAuth();
    const { toast } = useToast();

    // Load from local storage on initial mount
    useEffect(() => {
        try {
            const storedDiagrams = localStorage.getItem(DIAGRAMS_KEY);
            if (storedDiagrams) {
                const diagrams = JSON.parse(storedDiagrams);
                builderDispatch({ type: 'SET_STATE', payload: { diagrams } });
            }
        } catch (error) {
            console.error('Failed to load diagrams from localStorage', error);
        }
    }, [builderDispatch]);

    // Save to local storage whenever diagrams change
    useEffect(() => {
        try {
            if (builderState.diagrams && Object.keys(builderState.diagrams).length > 0) {
                localStorage.setItem(DIAGRAMS_KEY, JSON.stringify(builderState.diagrams));
            } else if (builderState.proposal === null) {
                // If the session is new (proposal is null), clear storage.
                localStorage.removeItem(DIAGRAMS_KEY);
            }
        } catch (error) {
            console.error('Failed to save diagrams to localStorage', error);
        }
    }, [builderState.diagrams, builderState.proposal]);


    const handleFormSubmit = (itemToGenerate: DiagramType, guidelines: string[]) => {
        const validatedFields = z.object({
            itemToGenerate: DiagramTypeSchema,
            guidelines: z.array(z.string()).optional(),
        }).safeParse({
            itemToGenerate,
            guidelines,
        });

        if (!validatedFields.success) {
            const error = validatedFields.error.flatten().fieldErrors;
            const errorMessage = Object.values(error).flat().join(', ');
            builderDispatch({ type: 'GENERATION_ERROR', payload: { error: `Invalid data: ${errorMessage}` } });
            toast({ title: "Validation Error", description: `Invalid data: ${errorMessage}`, variant: 'destructive' });
            return;
        }

        const proposalData = builderState.proposal;
        if (!proposalData) {
            builderDispatch({ type: 'GENERATION_ERROR', payload: { error: 'The proposal data is missing.' } });
            return;
        }

        setGeneratingDiagram(itemToGenerate);
        builderDispatch({ type: 'GENERATION_START', payload: { item: itemToGenerate } });

        startTransition(async () => {
            try {
                if (!user) throw new Error("User not authenticated");

                const otherDiagrams: Record<string, string> = {};
                const otherSections: Record<string, string> = {};

                if (builderState.contextSelections[itemToGenerate]) {
                    for (const fullContextKey in builderState.contextSelections[itemToGenerate]) {
                        if (builderState.contextSelections[itemToGenerate][fullContextKey]) {
                            if (fullContextKey.startsWith('diagram_')) {
                                const contextKey = fullContextKey.substring(8) as DiagramType;
                                if (builderState.diagrams?.[contextKey]) {
                                    otherDiagrams[contextKey] = builderState.diagrams[contextKey]!.plantUmlCode;
                                }
                            } else if (fullContextKey.startsWith('section_')) {
                                const contextKey = fullContextKey.substring(8) as SectionName;
                                if (builderState.sections?.[contextKey]) {
                                    otherSections[contextKey] = builderState.sections[contextKey]!;
                                }
                            }
                        }
                    }
                }

                const response = await fetch('/api/generate-diagrams', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        proposal: proposalData,
                        diagramToGenerate: itemToGenerate,
                        otherDiagrams,
                        otherSections,
                        guidelines: validatedFields.data.guidelines,
                        externalContextContent: builderState.externalContext?.content,
                    }),
                });

                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'API request failed');

                await deductCredit(user.id, 1);

                builderDispatch({ type: 'GENERATION_SUCCESS', payload: {
                    diagrams: { ...builderState.diagrams, [itemToGenerate]: { plantUmlCode: result.plantUmlCode, imageUrl: result.imageUrl } },
                    lastGenerated: itemToGenerate,
                }});

                toast({ title: "Diagram Generated", description: `Successfully created ${itemToGenerate} diagram.` });
                await fetchUser();
            } catch (e: any) {
                console.error(e);
                const errorMessage = e.message || 'An error occurred while generating the diagram.';
                builderDispatch({ type: 'GENERATION_ERROR', payload: { error: errorMessage, item: itemToGenerate } });
                toast({ title: "Generation Failed", description: errorMessage, variant: 'destructive' });
            } finally {
                setGeneratingDiagram(null);
            }
        });
    };

    const handleDiagramCodeUpdate = useCallback((key: DiagramType, code: string) => {
        builderDispatch({ type: 'UPDATE_DIAGRAM_CODE', payload: { key, code } });
    }, [builderDispatch]);

    const handleDiagramUpdate = (diagramType: DiagramType) => {
        const code = builderState.diagrams?.[diagramType]?.plantUmlCode;
        if (!code) {
            toast({ title: "Update Failed", description: "No code found for this diagram.", variant: "destructive" });
            return;
        }

        setGeneratingDiagram(diagramType);
        builderDispatch({ type: 'GENERATION_START', payload: { item: diagramType } });

        startTransition(async () => {
             try {
                const response = await fetch('/api/generate-diagrams', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ intent: 'update_diagram', plantUmlCode: code }),
                });

                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'API request failed');

                builderDispatch({ type: 'GENERATION_SUCCESS', payload: {
                    diagrams: { ...builderState.diagrams, [diagramType]: { plantUmlCode: result.plantUmlCode, imageUrl: result.imageUrl }},
                    lastGenerated: diagramType,
                }});

                toast({ title: "Diagram Updated", description: "Successfully re-rendered diagram." });

            } catch (e: any) {
                console.error(e);
                const errorMessage = e.message || 'An error occurred while updating the diagram.';
                builderDispatch({ type: 'GENERATION_ERROR', payload: { error: errorMessage, item: diagramType } });
                toast({ title: "Update Failed", description: errorMessage, variant: 'destructive' });
            } finally {
                setGeneratingDiagram(null);
            }
        });
    }

    const toggleContextSelection = (parentKey: string, contextKey: string) => builderDispatch({ type: 'TOGGLE_CONTEXT_SELECTION', payload: { parentKey, contextKey } });
    const setExternalContext = (fileName: string, content: string) => builderDispatch({ type: 'SET_EXTERNAL_CONTEXT', payload: { fileName, content } });
    const removeExternalContext = () => builderDispatch({ type: 'REMOVE_EXTERNAL_CONTEXT' });

    return {
        state: builderState,
        isAnythingGenerating: builderState.isAnythingGenerating || isGenerating,
        generatingDiagram,
        handleFormSubmit,
        handleDiagramCodeUpdate,
        handleDiagramUpdate,
        contextSelections: builderState.contextSelections,
        toggleContextSelection,
        setExternalContext,
        removeExternalContext,
    };
}
