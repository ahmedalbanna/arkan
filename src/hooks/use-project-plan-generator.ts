import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useBuilderStore } from '@/hooks';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks';
import { useGenerateProjectPlan } from '@/hooks/use-project-plan';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { summarizeProposalForPlanApi } from '@/services';

export function useProjectPlanGenerator() {
    const { toast } = useToast();
    const { firebaseUser, userProfile } = useAuth();
    const { proposal, projectIdea } = useBuilderStore();
    const [description, setDescription] = useState('');
    const [deliverables, setDeliverables] = useState('');

    const planGenerationMutation = useGenerateProjectPlan();

    useEffect(() => {
        // Pre-fill from proposal if available
        if (proposal) {
            setDescription(String(proposal.objective) || '');
            setDeliverables(Array.isArray(proposal.expected_outcome) ? proposal.expected_outcome.join('\n') : String(proposal.expected_outcome) || '');
        } else if (projectIdea) {
            setDescription(projectIdea);
        }
    }, [proposal, projectIdea]);

    const suggestionMutation = useMutation({
        mutationFn: async () => {
            const token = await getAuthenticatedToken(firebaseUser);
            return summarizeProposalForPlanApi(proposal, token);
        },
        onSuccess: (data) => {
            const parts = data.summary.split("Key Deliverables:");
            setDescription(parts[0]?.replace('Project Summary:', '').trim() || '');
            setDeliverables(parts[1]?.trim() || '');
            toast({ title: "Suggestion Applied", description: "The AI has filled in the details from your proposal." });
        },
        onError: (error: Error) => {
            toast({ title: 'Suggestion Failed', description: error.message, variant: 'destructive' });
        }
    });

    const handleGeneratePlan = async () => {
        if (!firebaseUser) {
            toast({ title: "Authentication Required", variant: 'destructive' });
            return;
        }
        if (!description || !deliverables) {
            toast({
                title: 'Cannot Generate Plan',
                description: 'Please provide a project description and at least one deliverable.',
                variant: 'destructive',
            });
            return;
        }
        planGenerationMutation.mutate({ projectDescription: description, keyDeliverables: deliverables });
    };

    const creditCost = 2;
    const isProcessing = planGenerationMutation.isPending || suggestionMutation.isPending;
    const canGenerate = (!!description.trim() && !!deliverables.trim()) && !isProcessing && (userProfile?.credits ?? 0) >= creditCost;

    return {
        description,
        setDescription,
        deliverables,
        setDeliverables,
        handleGeneratePlan,
        handleGetSuggestion: suggestionMutation.mutate,
        planGenerationMutation,
        isProcessing,
        canGenerate,
        creditCost,
        proposal, // Pass proposal through for disabled state check
    };
}
