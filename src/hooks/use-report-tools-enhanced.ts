/**
 * Hook محسن لأدوات التقارير يستخدم النظام الجديد من src/core
 */

'use client';

import { useLocalization } from '@/context/LocalizationContext';
import {
    createAdvancedReportToolHook,
    createReportToolHook
} from '@/core';
import { z } from 'zod';

// مخططات التحقق من البيانات
const reportGeneratorSchema = z.object({
    topic: z.string().min(5, 'Topic must be at least 5 characters long.'),
    type: z.enum(['business', 'technical', 'academic', 'research', 'financial']).optional(),
    length: z.enum(['short', 'medium', 'long']).optional(),
    sections: z.array(z.string()).optional(),
    includeCharts: z.boolean().optional(),
    includeReferences: z.boolean().optional(),
});

const documentWriterSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters long.'),
    type: z.enum(['proposal', 'report', 'memo', 'letter', 'email']).optional(),
    audience: z.string().optional(),
    purpose: z.string().optional(),
    keyPoints: z.array(z.string()).optional(),
});

const aiResearcherSchema = z.object({
    query: z.string().min(10, 'Query must be at least 10 characters long.'),
    depth: z.enum(['shallow', 'medium', 'deep']).optional(),
    sources: z.array(z.string()).optional(),
    language: z.string().optional(),
});

const topicExplainerSchema = z.object({
    topic: z.string().min(3, 'Topic must be at least 3 characters long.'),
    level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    format: z.enum(['article', 'summary', 'outline', 'faq']).optional(),
    length: z.enum(['short', 'medium', 'long']).optional(),
});

const sessionPlanGeneratorSchema = z.object({
    topic: z.string().min(5, 'Topic must be at least 5 characters long.'),
    duration: z.number().min(15).max(480).optional(), // 15 minutes to 8 hours
    audience: z.string().optional(),
    objectives: z.array(z.string()).optional(),
    format: z.enum(['workshop', 'presentation', 'training', 'meeting']).optional(),
});

export function useReportToolsEnhanced() {
    const { t } = useLocalization();

    // Report Generator Hook
    const useReportGenerator = createReportToolHook({
        toolName: 'report-generator',
        apiEndpoint: '/api/writing-tools/report-generator',
        schema: reportGeneratorSchema,
        defaultValues: {
            topic: '',
            type: 'business',
            length: 'medium',
            sections: [],
            includeCharts: true,
            includeReferences: true,
        },
        successMessage: t('writingTools.reportGenerator.successToast') || 'Report generated successfully!',
        errorMessage: t('writingTools.reportGenerator.errorToast') || 'Failed to generate report',
        enableFileUpload: true,
        acceptedFileTypes: ['text/plain', 'text/markdown', 'application/pdf'],
        customFeatures: {
            formatOutput: (data: any) => {
                if (data.report) {
                    return {
                        title: data.title,
                        report: data.report,
                        sections: data.sections || [],
                        metadata: {
                            wordCount: data.wordCount || 0,
                            pageCount: data.pageCount || 0,
                            type: data.type,
                            length: data.length,
                            generatedAt: new Date().toISOString(),
                        }
                    };
                }
                return data;
            },
            validateInput: (data: any) => {
                return data.topic?.length >= 5;
            },
            getReportTypes: () => [
                'business', 'technical', 'academic', 'research', 'financial'
            ],
            getReportSections: (type: string) => {
                const sectionsMap: Record<string, string[]> = {
                    business: ['Executive Summary', 'Introduction', 'Analysis', 'Recommendations', 'Conclusion'],
                    technical: ['Abstract', 'Introduction', 'Methodology', 'Results', 'Discussion', 'Conclusion'],
                    academic: ['Abstract', 'Introduction', 'Literature Review', 'Methodology', 'Results', 'Discussion', 'Conclusion', 'References'],
                    research: ['Abstract', 'Introduction', 'Background', 'Methodology', 'Findings', 'Analysis', 'Conclusion', 'References'],
                    financial: ['Executive Summary', 'Financial Overview', 'Analysis', 'Projections', 'Recommendations', 'Conclusion'],
                };
                return sectionsMap[type] || sectionsMap.business;
            },
        }
    });

    // Document Writer Hook
    const useDocumentWriter = createAdvancedReportToolHook({
        toolName: 'document-writer',
        apiEndpoint: '/api/writing-tools/document-writer',
        schema: documentWriterSchema,
        defaultValues: {
            title: '',
            type: 'report',
            audience: 'general',
            purpose: '',
            keyPoints: [],
        },
        successMessage: t('writingTools.documentWriter.successToast') || 'Document written successfully!',
        errorMessage: t('writingTools.documentWriter.errorToast') || 'Failed to write document',
        enableFileUpload: true,
        acceptedFileTypes: ['text/plain', 'text/markdown'],
        customFeatures: {
            formatOutput: (data: any) => {
                if (data.document) {
                    return {
                        title: data.title,
                        document: data.document,
                        type: data.type,
                        audience: data.audience,
                        purpose: data.purpose,
                        keyPoints: data.keyPoints || [],
                        metadata: {
                            wordCount: data.wordCount || 0,
                            readabilityScore: data.readabilityScore || 0,
                            tone: data.tone || 'professional',
                        }
                    };
                }
                return data;
            },
            validateInput: (data: any) => {
                return data.title?.length >= 3;
            },
            getDocumentTypes: () => [
                'proposal', 'report', 'memo', 'letter', 'email'
            ],
            getAudienceTypes: () => [
                'general', 'technical', 'executive', 'academic', 'public'
            ],
        }
    });

    // AI Researcher Hook
    const useAIResearcher = createAdvancedReportToolHook({
        toolName: 'ai-researcher',
        apiEndpoint: '/api/writing-tools/ai-researcher',
        schema: aiResearcherSchema,
        defaultValues: {
            query: '',
            depth: 'medium',
            sources: [],
            language: 'en',
        },
        successMessage: t('writingTools.aiResearcher.successToast') || 'Research completed successfully!',
        errorMessage: t('writingTools.aiResearcher.errorToast') || 'Failed to complete research',
        enableFileUpload: false,
        customFeatures: {
            formatOutput: (data: any) => {
                if (data.research) {
                    return {
                        query: data.query,
                        research: data.research,
                        sources: data.sources || [],
                        depth: data.depth,
                        language: data.language,
                        metadata: {
                            sourceCount: data.sourceCount || 0,
                            confidenceScore: data.confidenceScore || 0,
                            lastUpdated: data.lastUpdated || new Date().toISOString(),
                        }
                    };
                }
                return data;
            },
            validateInput: (data: any) => {
                return data.query?.length >= 10;
            },
            getResearchDepths: () => [
                'shallow', 'medium', 'deep'
            ],
            getSupportedLanguages: () => [
                'en', 'ar', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja'
            ],
        }
    });

    // Topic Explainer Hook
    const useTopicExplainer = createReportToolHook({
        toolName: 'topic-explainer',
        apiEndpoint: '/api/writing-tools/topic-explainer',
        schema: topicExplainerSchema,
        defaultValues: {
            topic: '',
            level: 'intermediate',
            format: 'article',
            length: 'medium',
        },
        successMessage: t('writingTools.topicExplainer.successToast') || 'Topic explained successfully!',
        errorMessage: t('writingTools.topicExplainer.errorToast') || 'Failed to explain topic',
        enableFileUpload: false,
        customFeatures: {
            formatOutput: (data: any) => {
                if (data.explanation) {
                    return {
                        topic: data.topic,
                        explanation: data.explanation,
                        level: data.level,
                        format: data.format,
                        length: data.length,
                        metadata: {
                            complexity: data.complexity || 'medium',
                            estimatedReadTime: data.estimatedReadTime || 0,
                            keyConcepts: data.keyConcepts || [],
                        }
                    };
                }
                return data;
            },
            validateInput: (data: any) => {
                return data.topic?.length >= 3;
            },
            getExplanationLevels: () => [
                'beginner', 'intermediate', 'advanced'
            ],
            getExplanationFormats: () => [
                'article', 'summary', 'outline', 'faq'
            ],
        }
    });

    // Session Plan Generator Hook
    const useSessionPlanGenerator = createReportToolHook({
        toolName: 'session-plan-generator',
        apiEndpoint: '/api/writing-tools/session-plan-generator',
        schema: sessionPlanGeneratorSchema,
        defaultValues: {
            topic: '',
            duration: 60, // 1 hour default
            audience: 'general',
            objectives: [],
            format: 'workshop',
        },
        successMessage: t('writingTools.sessionPlanGenerator.successToast') || 'Session plan generated successfully!',
        errorMessage: t('writingTools.sessionPlanGenerator.errorToast') || 'Failed to generate session plan',
        enableFileUpload: false,
        customFeatures: {
            formatOutput: (data: any) => {
                if (data.sessionPlan) {
                    return {
                        topic: data.topic,
                        sessionPlan: data.sessionPlan,
                        duration: data.duration,
                        audience: data.audience,
                        objectives: data.objectives || [],
                        format: data.format,
                        metadata: {
                            estimatedParticipants: data.estimatedParticipants || 0,
                            difficulty: data.difficulty || 'intermediate',
                            materials: data.materials || [],
                        }
                    };
                }
                return data;
            },
            validateInput: (data: any) => {
                return data.topic?.length >= 5 && data.duration >= 15;
            },
            getSessionFormats: () => [
                'workshop', 'presentation', 'training', 'meeting'
            ],
            getAudienceTypes: () => [
                'general', 'technical', 'executive', 'students', 'professionals'
            ],
        }
    });

    return {
        // Report Generation Tools
        useReportGenerator,
        useDocumentWriter,
        useAIResearcher,
        useTopicExplainer,
        useSessionPlanGenerator,

        // Helper Functions
        getReportCategories: () => [
            'business',
            'technical',
            'academic',
            'research',
            'financial'
        ],

        getDocumentTypes: () => [
            'proposal',
            'report',
            'memo',
            'letter',
            'email'
        ],

        getSupportedFileTypes: () => [
            'text/plain',
            'text/markdown',
            'application/pdf'
        ],
    };
}
