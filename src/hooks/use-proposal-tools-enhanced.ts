/**
 * Hook محسن لأدوات المقترحات يستخدم النظام الجديد من src/core
 */

'use client';

import { useLocalization } from '@/context/LocalizationContext';
import {
    createAdvancedProposalToolHook,
    createProposalToolHook
} from '@/core';
import { z } from 'zod';

// مخططات التحقق من البيانات
const proposalModeGeneratorSchema = z.object({
    projectDescription: z.string().min(10, 'Project description must be at least 10 characters long.'),
    keyDeliverables: z.array(z.string()).min(1, 'At least one key deliverable is required.'),
    budget: z.number().min(0).optional(),
    timeline: z.string().optional(),
    targetAudience: z.string().optional(),
    objectives: z.array(z.string()).optional(),
});

const proposalGenerationToolsSchema = z.object({
    type: z.enum(['business', 'technical', 'academic', 'research', 'funding']).optional(),
    title: z.string().min(5, 'Title must be at least 5 characters long.'),
    description: z.string().min(20, 'Description must be at least 20 characters long.'),
    requirements: z.array(z.string()).optional(),
    benefits: z.array(z.string()).optional(),
});

const proposalActionsSchema = z.object({
    action: z.enum(['create', 'update', 'delete', 'duplicate', 'export']).optional(),
    proposalId: z.string().optional(),
    data: z.any().optional(),
});

export function useProposalToolsEnhanced() {
    const { t } = useLocalization();

    // Proposal Mode Generator Hook
    const useProposalModeGenerator = createProposalToolHook({
        toolName: 'proposal-mode-generator',
        apiEndpoint: '/api/writing-tools/proposal-mode-generator',
        schema: proposalModeGeneratorSchema,
        defaultValues: {
            projectDescription: '',
            keyDeliverables: [],
            budget: 0,
            timeline: '',
            targetAudience: '',
            objectives: [],
        },
        successMessage: t('writingTools.proposalModeGenerator.successToast') || 'Proposal generated successfully!',
        errorMessage: t('writingTools.proposalModeGenerator.errorToast') || 'Failed to generate proposal',
        enableFileUpload: true,
        acceptedFileTypes: ['text/plain', 'text/markdown', 'application/pdf'],
        customFeatures: {
            formatOutput: (data: any) => {
                if (data.proposal) {
                    return {
                        projectDescription: data.projectDescription,
                        proposal: data.proposal,
                        keyDeliverables: data.keyDeliverables || [],
                        budget: data.budget || 0,
                        timeline: data.timeline || '',
                        targetAudience: data.targetAudience || '',
                        objectives: data.objectives || [],
                        metadata: {
                            wordCount: data.wordCount || 0,
                            pageCount: data.pageCount || 0,
                            complexity: data.complexity || 'medium',
                            generatedAt: new Date().toISOString(),
                        }
                    };
                }
                return data;
            },
            validateInput: (data: any) => {
                return data.projectDescription?.length >= 10 &&
                    data.keyDeliverables?.length >= 1;
            },
            getProposalSections: () => [
                'Executive Summary',
                'Project Description',
                'Objectives',
                'Methodology',
                'Timeline',
                'Budget',
                'Deliverables',
                'Conclusion'
            ],
            getProposalTypes: () => [
                'business', 'technical', 'academic', 'research', 'funding'
            ],
            getBudgetRanges: () => [
                { min: 0, max: 10000, label: 'Under $10K' },
                { min: 10000, max: 50000, label: '$10K - $50K' },
                { min: 50000, max: 100000, label: '$50K - $100K' },
                { min: 100000, max: 500000, label: '$100K - $500K' },
                { min: 500000, max: 1000000, label: '$500K - $1M' },
                { min: 1000000, max: Infinity, label: 'Over $1M' },
            ],
        }
    });

    // Proposal Generation Tools Hook
    const useProposalGenerationTools = createAdvancedProposalToolHook({
        toolName: 'proposal-generation-tools',
        apiEndpoint: '/api/writing-tools/proposal-generation-tools',
        schema: proposalGenerationToolsSchema,
        defaultValues: {
            type: 'business',
            title: '',
            description: '',
            requirements: [],
            benefits: [],
        },
        successMessage: t('writingTools.proposalGenerationTools.successToast') || 'Proposal tools loaded successfully!',
        errorMessage: t('writingTools.proposalGenerationTools.errorToast') || 'Failed to load proposal tools',
        enableFileUpload: true,
        acceptedFileTypes: ['text/plain', 'text/markdown', 'application/pdf'],
        customFeatures: {
            formatOutput: (data: any) => {
                if (data.tools) {
                    return {
                        type: data.type,
                        title: data.title,
                        description: data.description,
                        requirements: data.requirements || [],
                        benefits: data.benefits || [],
                        tools: data.tools,
                        metadata: {
                            availableTypes: data.availableTypes || [],
                            lastUpdated: new Date().toISOString(),
                        }
                    };
                }
                return data;
            },
            validateInput: (data: any) => {
                return data.title?.length >= 5 &&
                    data.description?.length >= 20;
            },
            getProposalSections: () => [
                'Executive Summary',
                'Project Description',
                'Objectives',
                'Methodology',
                'Timeline',
                'Budget',
                'Deliverables',
                'Conclusion'
            ],
            getProposalTypes: () => [
                'business', 'technical', 'academic', 'research', 'funding'
            ],
            getAvailableTools: () => [
                'outline-generator',
                'content-writer',
                'budget-calculator',
                'timeline-creator',
                'risk-assessor',
                'quality-checker'
            ],
        }
    });

    // Proposal Actions Hook
    const useProposalActions = createProposalToolHook({
        toolName: 'proposal-actions',
        apiEndpoint: '/api/writing-tools/proposal-actions',
        schema: proposalActionsSchema,
        defaultValues: {
            action: 'create',
            proposalId: '',
            data: {},
        },
        successMessage: t('writingTools.proposalActions.successToast') || 'Proposal action completed successfully!',
        errorMessage: t('writingTools.proposalActions.errorToast') || 'Failed to complete proposal action',
        enableFileUpload: false,
        customFeatures: {
            formatOutput: (data: any) => {
                if (data.result) {
                    return {
                        action: data.action,
                        proposalId: data.proposalId,
                        result: data.result,
                        data: data.data || {},
                        metadata: {
                            timestamp: new Date().toISOString(),
                            success: data.success || true,
                        }
                    };
                }
                return data;
            },
            validateInput: (data: any) => {
                return data.action &&
                    (data.action === 'create' || data.proposalId?.length >= 1);
            },
            getAvailableActions: () => [
                'create', 'update', 'delete', 'duplicate', 'export'
            ],
            getActionRequirements: (action: string) => {
                const requirements: Record<string, string[]> = {
                    create: ['title', 'description'],
                    update: ['proposalId', 'data'],
                    delete: ['proposalId'],
                    duplicate: ['proposalId'],
                    export: ['proposalId', 'format'],
                };
                return requirements[action] || [];
            },
        }
    });

    return {
        // Proposal Tools
        useProposalModeGenerator,
        useProposalGenerationTools,
        useProposalActions,

        // Helper Functions
        getProposalTypes: () => [
            'business', 'technical', 'academic', 'research', 'funding'
        ],

        getProposalSections: () => [
            'Executive Summary',
            'Project Description',
            'Objectives',
            'Methodology',
            'Timeline',
            'Budget',
            'Deliverables',
            'Conclusion'
        ],

        getAvailableActions: () => [
            'create', 'update', 'delete', 'duplicate', 'export'
        ],

        getSupportedFileTypes: () => [
            'text/plain',
            'text/markdown',
            'application/pdf'
        ],

        getBudgetRanges: () => [
            { min: 0, max: 10000, label: 'Under $10K' },
            { min: 10000, max: 50000, label: '$10K - $50K' },
            { min: 50000, max: 100000, label: '$50K - $100K' },
            { min: 100000, max: 500000, label: '$100K - $500K' },
            { min: 500000, max: 1000000, label: '$500K - $1M' },
            { min: 1000000, max: Infinity, label: 'Over $1M' },
        ],
    };
}
