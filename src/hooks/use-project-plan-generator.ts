
import type { ProjectProposal } from '@/ai/schemas';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { createProjectPlanToolHook } from '@/core';
import { getAuthenticatedToken } from '@/core/utils/authUtils';
import { useBuilderStore, useToast } from '@/hooks';
import { useGenerateProjectPlan } from '@/hooks/use-project-plan';
import { summarizeProjectApi } from '@/services';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { z } from 'zod';

// مخطط التحقق من البيانات
const projectPlanSchema = z.object({
    projectDescription: z.string().min(10, 'Please provide a detailed project description.'),
    keyDeliverables: z.string().min(5, 'Please specify at least one key deliverable.'),
});

// القيم الافتراضية
const defaultValues = {
    projectDescription: '',
    keyDeliverables: '',
};

/**
 * Hook محسن لمولد خطط المشاريع
 * يستخدم النظام الجديد لتقليل التكرار وتحسين الأداء
 */
export function useProjectPlanGenerator() {
    const { toast } = useToast();
    const { t } = useLocalization();
    const { firebaseUser, userProfile } = useAuth();
    const { project } = useBuilderStore();
    const proposal = project?.proposal as ProjectProposal | null;
    const projectIdea = project?.projectIdea;

    const [description, setDescription] = useState('');
    const [deliverables, setDeliverables] = useState('');

    const projectPlanTool = createProjectPlanToolHook({
        toolName: 'project-plan-generator',
        apiEndpoint: '/api/generate-project-plan',
        schema: projectPlanSchema,
        defaultValues,
        successMessage: t('projectPlan.generator.successToast') || 'Project plan generated successfully!',
        errorMessage: t('projectPlan.generator.errorToast') || 'Failed to generate project plan',
        enableFileUpload: false,
        planType: 'business',
        customFeatures: {
            formatOutput: (data: any) => {
                if (data.projectPlan) {
                    return {
                        projectPlan: data.projectPlan,
                        metadata: {
                            phases: data.projectPlan.phases?.length || 0,
                            deliverables: data.projectPlan.deliverables?.length || 0,
                            estimatedDuration: data.projectPlan.estimatedDuration || 'Unknown',
                            complexity: data.projectPlan.complexity || 'medium',
                        }
                    };
                }
                return data;
            },
            validateInput: (data: any) => {
                return data.projectDescription?.length >= 10 &&
                    data.keyDeliverables?.length >= 5;
            },
            getPlanSections: () => [
                'Project Overview',
                'Objectives & Goals',
                'Timeline & Milestones',
                'Resource Requirements',
                'Risk Assessment',
                'Budget Planning',
                'Success Metrics'
            ],
            getTimeline: (data: any) => {
                return data.projectPlan?.timeline || [];
            },
            getMilestones: (data: any) => {
                return data.projectPlan?.milestones || [];
            }
        }
    })();

    const planGenerationMutation = useGenerateProjectPlan();

    useEffect(() => {
        // Pre-fill from proposal if available
        if (proposal) {
            setDescription(proposal?.proposedSolution?.overview || '');
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
    };

    const creditCost = 2;
    const isProcessing = planGenerationMutation.isPending || suggestionMutation.isPending;
    const canGenerate = (!!description.trim() && !!deliverables.trim()) && !isProcessing && (userProfile?.credits ?? 0) >= creditCost;

    return {
        // الترجمة
        t,

        // النموذج والحالة
        form: projectPlanTool.form,
        isProcessing: projectPlanTool.isProcessing || isProcessing,

        // النصوص والمحتوى
        originalText: projectPlanTool.originalText,
        processedText: projectPlanTool.processedText,
        generatedPlan: projectPlanTool.generatedPlan,

        // النسخ
        isCopied: projectPlanTool.isCopied,
        handleCopy: projectPlanTool.copyToClipboard,

        // المعالجة
        onSubmit: projectPlanTool.handleSubmit,
        reset: projectPlanTool.reset,

        // النتائج والوظائف المساعدة
        formatOutput: projectPlanTool.formatOutput,
        validateInput: projectPlanTool.validateInput,
        getPlanSections: projectPlanTool.getPlanSections,
        getTimeline: projectPlanTool.getTimeline,
        getMilestones: projectPlanTool.getMilestones,

        // الطفرة (للتوافق مع الكود الموجود)
        mutation: projectPlanTool.mutation,

        // الوظائف المخصصة للمشاريع
        description,
        setDescription,
        deliverables,
        setDeliverables,
        handleGeneratePlan,
        handleGetSuggestion,
        planGenerationMutation,
        canGenerate,
        creditCost,
        proposal,
    };
}
