
import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useBuilderStore } from '@/hooks';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks';
import { useGenerateProjectPlan } from '@/hooks/use-project-plan';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { summarizeProjectApi } from '@/services';
import { useLocalization } from '@/context/LocalizationContext';

export function useProjectPlanGenerator() {
    const { toast } = useToast();
    const { t } = useLocalization();
    const { firebaseUser, userProfile } = useAuth();
    const { project } = useBuilderStore();
    const proposal = project?.proposal;
    const projectIdea = project?.projectIdea;

    const [description, setDescription] = useState('');
    const [deliverables, setDeliverables] = useState('');

    const planGenerationMutation = useGenerateProjectPlan();

    useEffect(() => {
        // Pre-fill from proposal if available
        if (proposal) {
            setDescription(String((proposal as any).objective) || '');
            setDeliverables(Array.isArray((proposal as any).expected_outcome) ? (proposal as any).expected_outcome.join('\n') : String((proposal as any).expected_outcome) || '');
        } else if (projectIdea) {
            setDescription(projectIdea);
        }
    }, [proposal, projectIdea]);

    const suggestionMutation = useMutation({
        mutationFn: async () => {
            if (!proposal) throw new Error("A proposal is required to generate suggestions.");
            const token = await getAuthenticatedToken(firebaseUser);
            // Assuming summarizeProjectApi is a valid function that calls the right endpoint.
            // The API it calls seems to be `/api/summarize-project`, which is actually summarizeFullProject.
            return summarizeProjectApi({ body: { proposal }, token });
        },
        onSuccess: (data: any) => { // Assuming data has a summary property
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
        t,
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
