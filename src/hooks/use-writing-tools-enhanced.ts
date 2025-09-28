/**
 * Hook محسن لأدوات الكتابة يستخدم النظام الجديد من src/core
 */

'use client';

import { useLocalization } from '@/context/LocalizationContext';
import {
    createAdvancedWritingToolHook,
    createContentGeneratorHook,
    createWritingToolHook
} from '@/core';
import { z } from 'zod';

// مخططات التحقق من البيانات
const paraphraserSchema = z.object({
    text: z.string().min(10, 'Text must be at least 10 characters long.'),
    style: z.enum(['formal', 'casual', 'academic', 'creative']).optional(),
    length: z.enum(['shorter', 'same', 'longer']).optional(),
});

const summarizerSchema = z.object({
    text: z.string().min(20, 'Text must be at least 20 characters long.'),
    length: z.enum(['short', 'medium', 'long']).optional(),
    focus: z.string().optional(),
});

const grammarCheckerSchema = z.object({
    text: z.string().min(5, 'Text must be at least 5 characters long.'),
    language: z.string().optional(),
});

const textStylistSchema = z.object({
    text: z.string().min(10, 'Text must be at least 10 characters long.'),
    style: z.enum(['professional', 'casual', 'academic', 'creative', 'technical']),
    tone: z.enum(['formal', 'friendly', 'authoritative', 'conversational']).optional(),
});

const ideaGeneratorSchema = z.object({
    topic: z.string().min(3, 'Topic must be at least 3 characters long.'),
    type: z.enum(['brainstorm', 'outline', 'keywords', 'questions']).optional(),
    count: z.number().min(1).max(20).optional(),
});

const citationGeneratorSchema = z.object({
    text: z.string().min(10, 'Text must be at least 10 characters long.'),
    style: z.enum(['apa', 'mla', 'chicago', 'harvard']).optional(),
    sources: z.array(z.string()).optional(),
});

export function useWritingToolsEnhanced() {
    const { t } = useLocalization();

    // Paraphraser Hook
    const useParaphraser = createWritingToolHook({
        toolName: 'paraphraser',
        apiEndpoint: '/api/writing-tools/paraphraser',
        schema: paraphraserSchema,
        defaultValues: {
            text: '',
            style: 'formal',
            length: 'same',
        },
        successMessage: t('writingTools.paraphraser.successToast') || 'Text paraphrased successfully!',
        errorMessage: t('writingTools.paraphraser.errorToast') || 'Failed to paraphrase text',
        enableFileUpload: true,
        acceptedFileTypes: ['text/plain', 'text/markdown'],
    });

    // Summarizer Hook
    const useSummarizer = createWritingToolHook({
        toolName: 'summarizer',
        apiEndpoint: '/api/writing-tools/summarizer',
        schema: summarizerSchema,
        defaultValues: {
            text: '',
            length: 'medium',
            focus: '',
        },
        successMessage: t('writingTools.summarizer.successToast') || 'Text summarized successfully!',
        errorMessage: t('writingTools.summarizer.errorToast') || 'Failed to summarize text',
        enableFileUpload: true,
        acceptedFileTypes: ['text/plain', 'text/markdown', 'application/pdf'],
    });

    // Grammar Checker Hook
    const useGrammarChecker = createWritingToolHook({
        toolName: 'grammar-checker',
        apiEndpoint: '/api/writing-tools/grammar-checker',
        schema: grammarCheckerSchema,
        defaultValues: {
            text: '',
            language: 'en',
        },
        successMessage: t('writingTools.grammarChecker.successToast') || 'Grammar checked successfully!',
        errorMessage: t('writingTools.grammarChecker.errorToast') || 'Failed to check grammar',
        enableFileUpload: true,
        acceptedFileTypes: ['text/plain', 'text/markdown'],
    });

    // Text Stylist Hook
    const useTextStylist = createAdvancedWritingToolHook({
        toolName: 'text-stylist',
        apiEndpoint: '/api/writing-tools/text-stylist',
        schema: textStylistSchema,
        defaultValues: {
            text: '',
            style: 'professional',
            tone: 'formal',
        },
        successMessage: t('writingTools.textStylist.successToast') || 'Text styled successfully!',
        errorMessage: t('writingTools.textStylist.errorToast') || 'Failed to style text',
        enableFileUpload: true,
        acceptedFileTypes: ['text/plain', 'text/markdown'],
        customFeatures: {
            formatOutput: (data: any) => {
                if (data.styledText) {
                    return {
                        originalText: data.originalText,
                        styledText: data.styledText,
                        style: data.style,
                        tone: data.tone,
                        suggestions: data.suggestions || [],
                        metadata: {
                            wordCount: data.wordCount || 0,
                            readabilityScore: data.readabilityScore || 0,
                            styleScore: data.styleScore || 0,
                        }
                    };
                }
                return data;
            },
            validateInput: (data: any) => {
                return data.text?.length >= 10;
            },
            getStyleSuggestions: () => [
                'professional', 'casual', 'academic', 'creative', 'technical'
            ],
            getToneSuggestions: () => [
                'formal', 'friendly', 'authoritative', 'conversational'
            ],
        }
    });

    // Idea Generator Hook
    const useIdeaGenerator = createContentGeneratorHook({
        toolName: 'idea-generator',
        apiEndpoint: '/api/writing-tools/idea-generator',
        schema: ideaGeneratorSchema,
        defaultValues: {
            topic: '',
            type: 'brainstorm',
            count: 5,
        },
        successMessage: t('writingTools.ideaGenerator.successToast') || 'Ideas generated successfully!',
        errorMessage: t('writingTools.ideaGenerator.errorToast') || 'Failed to generate ideas',
        enableFileUpload: false,
        customFeatures: {
            formatOutput: (data: any) => {
                if (data.ideas) {
                    return {
                        topic: data.topic,
                        ideas: data.ideas,
                        type: data.type,
                        count: data.ideas.length,
                        metadata: {
                            generatedAt: new Date().toISOString(),
                            quality: data.quality || 'good',
                        }
                    };
                }
                return data;
            },
            validateInput: (data: any) => {
                return data.topic?.length >= 3;
            },
            getIdeaTypes: () => [
                'brainstorm', 'outline', 'keywords', 'questions'
            ],
            getIdeaCount: (data: any) => data.ideas?.length || 0,
        }
    });

    // Citation Generator Hook
    const useCitationGenerator = createWritingToolHook({
        toolName: 'citation-generator',
        apiEndpoint: '/api/writing-tools/citation-generator',
        schema: citationGeneratorSchema,
        defaultValues: {
            text: '',
            style: 'apa',
            sources: [],
        },
        successMessage: t('writingTools.citationGenerator.successToast') || 'Citations generated successfully!',
        errorMessage: t('writingTools.citationGenerator.errorToast') || 'Failed to generate citations',
        enableFileUpload: true,
        acceptedFileTypes: ['text/plain', 'text/markdown'],
    });

    // Plagiarism Checker Hook
    const usePlagiarismChecker = createWritingToolHook({
        toolName: 'plagiarism-checker',
        apiEndpoint: '/api/writing-tools/plagiarism-checker',
        schema: z.object({
            text: z.string().min(20, 'Text must be at least 20 characters long.'),
            language: z.string().optional(),
        }),
        defaultValues: {
            text: '',
            language: 'en',
        },
        successMessage: t('writingTools.plagiarismChecker.successToast') || 'Plagiarism check completed!',
        errorMessage: t('writingTools.plagiarismChecker.errorToast') || 'Failed to check plagiarism',
        enableFileUpload: true,
        acceptedFileTypes: ['text/plain', 'text/markdown'],
    });

    // Fact Checker Hook
    const useFactChecker = createWritingToolHook({
        toolName: 'fact-checker',
        apiEndpoint: '/api/writing-tools/fact-checker',
        schema: z.object({
            text: z.string().min(10, 'Text must be at least 10 characters long.'),
            sources: z.array(z.string()).optional(),
        }),
        defaultValues: {
            text: '',
            sources: [],
        },
        successMessage: t('writingTools.factChecker.successToast') || 'Fact check completed!',
        errorMessage: t('writingTools.factChecker.errorToast') || 'Failed to check facts',
        enableFileUpload: true,
        acceptedFileTypes: ['text/plain', 'text/markdown'],
    });

    // AI Detector Hook
    const useAIDetector = createWritingToolHook({
        toolName: 'ai-detector',
        apiEndpoint: '/api/writing-tools/ai-detector',
        schema: z.object({
            text: z.string().min(20, 'Text must be at least 20 characters long.'),
            model: z.string().optional(),
        }),
        defaultValues: {
            text: '',
            model: 'gpt-3.5-turbo',
        },
        successMessage: t('writingTools.aiDetector.successToast') || 'AI detection completed!',
        errorMessage: t('writingTools.aiDetector.errorToast') || 'Failed to detect AI content',
        enableFileUpload: true,
        acceptedFileTypes: ['text/plain', 'text/markdown'],
    });

    // Humanizer Hook
    const useHumanizer = createWritingToolHook({
        toolName: 'humanizer',
        apiEndpoint: '/api/writing-tools/humanizer',
        schema: z.object({
            text: z.string().min(10, 'Text must be at least 10 characters long.'),
            style: z.enum(['natural', 'conversational', 'professional']).optional(),
        }),
        defaultValues: {
            text: '',
            style: 'natural',
        },
        successMessage: t('writingTools.humanizer.successToast') || 'Text humanized successfully!',
        errorMessage: t('writingTools.humanizer.errorToast') || 'Failed to humanize text',
        enableFileUpload: true,
        acceptedFileTypes: ['text/plain', 'text/markdown'],
    });

    return {
        // Basic Writing Tools
        useParaphraser,
        useSummarizer,
        useGrammarChecker,
        useTextStylist,
        useIdeaGenerator,
        useCitationGenerator,

        // Advanced Writing Tools
        usePlagiarismChecker,
        useFactChecker,
        useAIDetector,
        useHumanizer,

        // Helper Functions
        getSupportedFileTypes: () => [
            'text/plain',
            'text/markdown',
            'application/pdf'
        ],

        getWritingToolCategories: () => [
            'basic',
            'advanced',
            'analysis',
            'generation'
        ],
    };
}
