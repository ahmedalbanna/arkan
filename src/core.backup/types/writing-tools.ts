/**
 * الأنواع الخاصة بأدوات الكتابة
 * يوفر أنواع محددة لجميع أدوات معالجة النصوص
 */

import { z } from 'zod';

// مخططات التحقق الأساسية
export const TextInputSchema = z.object({
    text: z.string().min(5, 'النص يجب أن يكون على الأقل 5 أحرف'),
});

export const StyleInputSchema = z.object({
    text: z.string().min(10, 'النص يجب أن يكون على الأقل 10 أحرف'),
    style: z.string().optional(),
});

export const ModeInputSchema = z.object({
    text: z.string().min(10, 'النص يجب أن يكون على الأقل 10 أحرف'),
    mode: z.enum(['standard', 'creative', 'formal', 'casual']),
});

export const RatioInputSchema = z.object({
    text: z.string().min(10, 'النص يجب أن يكون على الأقل 10 أحرف'),
    ratio: z.number().min(10).max(90).default(50),
});

// أنواع النتائج
export interface TextProcessingResult {
    originalText: string;
    processedText: string;
    processingTime?: number;
    wordCount?: {
        original: number;
        processed: number;
    };
    metadata?: {
        tool: string;
        timestamp: string;
        model?: string;
    };
}

export interface GrammarCheckResult {
    originalText: string;
    correctedText: string;
    errors: GrammarError[];
    suggestions: GrammarSuggestion[];
}

export interface GrammarError {
    type: 'spelling' | 'grammar' | 'punctuation' | 'style';
    message: string;
    position: {
        start: number;
        end: number;
    };
    suggestion: string;
}

export interface GrammarSuggestion {
    type: 'improvement' | 'alternative' | 'clarification';
    message: string;
    position: {
        start: number;
        end: number;
    };
    suggestion: string;
}

export interface ParaphraseResult {
    originalText: string;
    paraphrasedText: string;
    mode: 'standard' | 'creative' | 'formal' | 'casual';
    changes: ParaphraseChange[];
}

export interface ParaphraseChange {
    type: 'word' | 'phrase' | 'sentence';
    original: string;
    changed: string;
    position: {
        start: number;
        end: number;
    };
}

export interface SummarizeResult {
    originalText: string;
    summarizedText: string;
    ratio: number;
    compression: {
        originalLength: number;
        summarizedLength: number;
        compressionRatio: number;
    };
    keyPoints: string[];
}

export interface StyleResult {
    originalText: string;
    styledText: string;
    style: string;
    changes: StyleChange[];
}

export interface StyleChange {
    type: 'tone' | 'vocabulary' | 'structure' | 'formality';
    description: string;
    examples: {
        before: string;
        after: string;
    }[];
}

// أنواع الأدوات
export type WritingToolType =
    | 'grammar-checker'
    | 'paraphraser'
    | 'summarizer'
    | 'text-stylist'
    | 'plagiarism-checker'
    | 'citation-generator'
    | 'fact-checker'
    | 'ai-detector'
    | 'humanizer'
    | 'idea-generator'
    | 'topic-explainer'
    | 'quiz-generator'
    | 'document-writer'
    | 'ai-researcher';

export interface WritingToolConfig {
    id: WritingToolType;
    name: string;
    description: string;
    icon: string;
    category: 'editing' | 'generation' | 'analysis' | 'research';
    requiresAuth: boolean;
    apiEndpoint: string;
    schema: z.ZodType;
    defaultValues: any;
    features: string[];
    limitations: string[];
}

// أنواع الملفات المدعومة
export interface SupportedFileType {
    extension: string;
    mimeType: string;
    maxSize: number; // بالبايت
    description: string;
}

export const SUPPORTED_FILE_TYPES: SupportedFileType[] = [
    {
        extension: '.pdf',
        mimeType: 'application/pdf',
        maxSize: 10 * 1024 * 1024, // 10MB
        description: 'ملفات PDF',
    },
    {
        extension: '.txt',
        mimeType: 'text/plain',
        maxSize: 5 * 1024 * 1024, // 5MB
        description: 'ملفات نصية',
    },
    {
        extension: '.md',
        mimeType: 'text/markdown',
        maxSize: 5 * 1024 * 1024, // 5MB
        description: 'ملفات Markdown',
    },
];
