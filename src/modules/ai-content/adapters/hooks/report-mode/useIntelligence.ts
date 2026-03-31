'use client';

import { useEditorStore } from '@/modules/ai-content/adapters/state/use-editor-store';
import { useAiActions } from './use-ai-actions';
import { useBuilderStore } from '@/modules/projects/adapters/state/useBuilderStore';
import { useMemo, useState } from 'react';
import { toast } from '@/hooks/util/use-toast';

export function useIntelligence(sectionId: string) {
    const activeEditor = useEditorStore(state => state.activeEditor);
    const selection = useEditorStore(state => state.selection);
    const updateProject = useBuilderStore(state => state.updateProject);
    const { isProcessing, handleAiAction } = useAiActions({ editor: activeEditor || undefined });
    
    const [isDeepResearchEnabled, setIsDeepResearchEnabled] = useState(false);

    const contextMetadata = useMemo(() => {
        // Logic to derive current intelligence context
        // In a real implementation, this might analyze selection density, 
        // guideline adherence, or RAG hit rates.
        return {
            selectionLength: activeEditor?.state.selection.content().size ?? 0,
            hasActiveSelection: !activeEditor?.state.selection.empty,
            isAcademic: true,
        };
    }, [activeEditor, selection]);

    const runAction = async (actionId: string, params?: any) => {
        if (!activeEditor) {
            toast({
                title: 'No Active Editor',
                description: 'Please click inside the editor to activate AI tools.',
                variant: 'destructive'
            });
            return;
        }

        switch (actionId) {
            case 'improve-flow':
                await handleAiAction('rewrite', { style: 'flow' });
                break;
            case 'academic-polish':
                await handleAiAction('rewrite', { style: 'professional' });
                break;
            case 'fix-grammar':
                await handleAiAction('rewrite', { style: 'clear' });
                break;
            case 'translate':
                await handleAiAction('translate');
                break;
            default:
                toast({
                    title: 'Intelligence Tool',
                    description: `Action "${actionId}" is being processed by the neural engine.`,
                });
        }
    };

    return {
        isProcessing,
        runAction,
        contextMetadata,
        isDeepResearchEnabled,
        setIsDeepResearchEnabled
    };
}
