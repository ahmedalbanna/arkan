
import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useBuilderStore } from '@/hooks';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks';
import { useGenerateProjectPlan } from '@/hooks/use-project-plan';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { summarizeProjectApi } from '@/services';
import { useLocalization } from '@/context/LocalizationContext';
import type { AnyProjectProposal } from '@/ai/schemas';

export function useProjectPlanGenerator() {
    const { toast } = useToast();
    const { t } = useLocalization();
    const { firebaseUser, userProfile } = useAuth();
    const { project } = useBuilderStore();
    const proposal = project?.proposal as AnyProjectProposal | null; // Cast for easier use
    const projectIdea = project?.projectIdea;

    const [description, setDescription] = useState('');
    const [deliverables, setDeliverables] = useState('');

    const planGenerationMutation = useGenerateProjectPlan();

    useEffect(() => {
        // Pre-fill from proposal if available
        if (proposal) {
            setDescription(String(proposal.proposedSolution?.overview) || '');
            const outcome = proposal.projectPlan?.keyDeliverables;
            setDeliverables(typeof outcome === 'string' ? outcome : '');
        } else if (projectIdea) {
            setDescription(projectIdea);
        }
    }, [proposal, projectIdea]);

    const suggestionMutation = useMutation({
        mutationFn: async () => {
            if (!proposal) throw new Error("A proposal is required to generate suggestions.");
            const token = await getAuthenticatedToken(firebaseUser);
            // The API expects `body` and `token` properties.
            return summarizeProjectApi({ body: { proposal, reportMarkdown: '' }, token });
        },
        onSuccess: (data: any) => {
            const summaryText = data.summary || '';
            const parts = summaryText.split("Key Deliverables:");
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

    const handleGetSuggestion = () => {
        suggestionMutation.mutate();
    }

    const creditCost = 2;
    const isProcessing = planGenerationMutation.isPending || suggestionMutation.isPending;
    const canGenerate = (!!description.trim() && !!deliverables.trim()) && !isProcessing && (userProfile?.credits ?? 0) >= creditCost;

    return {
        t,
        description,
        setDescription,
        deliverables,
        setDeliverables,
        handleGeneratePlan,
        handleGetSuggestion,
        planGenerationMutation,
        isProcessing,
        canGenerate,
        creditCost,
        proposal, // Pass proposal through for disabled state check
    };
}
