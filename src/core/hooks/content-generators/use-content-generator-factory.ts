/**
 * Hook Factory لمولدات المحتوى
 * يوفر طريقة مبسطة لإنشاء hooks مولدات المحتوى
 */

import { z } from 'zod';
import { useTextProcessor } from '../writing-tools/use-text-processor';

export interface ContentGeneratorConfig {
    toolName: string;
    apiEndpoint: string;
    schema: z.ZodType;
    defaultValues: any;
    successMessage?: string;
    errorMessage?: string;
    enableFileUpload?: boolean;
    acceptedFileTypes?: string[];
    outputFormat?: 'text' | 'json' | 'html' | 'markdown';
    customFeatures?: {
        formatOutput?: (data: any) => any;
        validateInput?: (data: any) => boolean;
        getProgressSteps?: () => string[];
    };
}

/**
 * Hook Factory لمولدات المحتوى البسيطة
 * @param config إعدادات المولد
 * @returns Hook جاهز للاستخدام
 */
export function createContentGeneratorHook(config: ContentGeneratorConfig) {
    return function useContentGeneratorLogic() {
        const textProcessor = useTextProcessor({
            toolName: config.toolName,
            apiEndpoint: config.apiEndpoint,
            schema: config.schema,
            defaultValues: config.defaultValues,
            successMessage: config.successMessage || `${config.toolName} generated successfully!`,
            errorMessage: config.errorMessage || `Failed to generate ${config.toolName}`,
            enableFileUpload: config.enableFileUpload ?? true,
            acceptedFileTypes: config.acceptedFileTypes || ['application/pdf', 'text/plain', 'text/markdown'],
        });

        // تنسيق الناتج حسب النوع المحدد
        const formatOutput = (data: any) => {
            if (config.customFeatures?.formatOutput) {
                return config.customFeatures.formatOutput(data);
            }

            switch (config.outputFormat) {
                case 'json':
                    return typeof data === 'string' ? JSON.parse(data) : data;
                case 'html':
                    return data.html || data;
                case 'markdown':
                    return data.markdown || data;
                default:
                    return data.text || data.content || data;
            }
        };

        const processedOutput = textProcessor.mutation.data ? formatOutput(textProcessor.mutation.data) : null;

        return {
            // النموذج والحالة
            form: textProcessor.form,
            isProcessing: textProcessor.isProcessing,

            // النصوص
            originalText: textProcessor.originalText,
            processedText: textProcessor.processedText,
            generatedContent: processedOutput,

            // النسخ
            isCopied: textProcessor.isCopied,
            handleCopy: (generatedContent: any) => textProcessor.copyToClipboard(processedOutput || textProcessor.processedText),

            // رفع الملفات
            isUploading: textProcessor.isUploading,
            getRootProps: textProcessor.getRootProps,
            getInputProps: textProcessor.getInputProps,
            isDragActive: textProcessor.isDragActive,

            // المعالجة
            onSubmit: textProcessor.handleSubmit,
            reset: textProcessor.reset,

            // النتائج والوظائف المساعدة
            results: textProcessor.mutation.data,
            formatOutput,
            validateInput: config.customFeatures?.validateInput,
            getProgressSteps: config.customFeatures?.getProgressSteps,

            // الطفرة
            mutation: textProcessor.mutation,
        };
    };
}

/**
 * Hook Factory لمولدات المحتوى المتقدمة
 * @param config إعدادات المولد
 * @param advancedFeatures ميزات متقدمة
 * @returns Hook جاهز للاستخدام مع ميزات متقدمة
 */
export function createAdvancedContentGeneratorHook(
    config: ContentGeneratorConfig,
    advancedFeatures?: {
        getGenerationSteps?: () => string[];
        getProgressPercentage?: (step: number, totalSteps: number) => number;
        validateGeneratedContent?: (content: any) => boolean;
        getContentPreview?: (content: any) => string;
        getExportOptions?: () => Array<{ format: string; label: string; extension: string }>;
    }
) {
    return function useAdvancedContentGeneratorLogic() {
        const baseHook = createContentGeneratorHook(config)();

        return {
            ...baseHook,

            // الميزات المتقدمة
            getGenerationSteps: advancedFeatures?.getGenerationSteps,
            getProgressPercentage: advancedFeatures?.getProgressPercentage,
            validateGeneratedContent: advancedFeatures?.validateGeneratedContent,
            getContentPreview: advancedFeatures?.getContentPreview,
            getExportOptions: advancedFeatures?.getExportOptions,
        };
    };
}

/**
 * أمثلة على الاستخدام:
 *
 * // مولد بسيط
 * const useQuizGenerator = createContentGeneratorHook({
 *   toolName: 'quiz-generator',
 *   apiEndpoint: '/api/generate/quiz',
 *   schema: z.object({
 *     topic: z.string().min(5),
 *     difficulty: z.enum(['easy', 'medium', 'hard']),
 *     questionCount: z.number().min(1).max(20)
 *   }),
 *   defaultValues: { topic: '', difficulty: 'medium', questionCount: 5 },
 *   outputFormat: 'json',
 *   successMessage: 'Quiz generated successfully!',
 * });
 *
 * // مولد متقدم
 * const useAdvancedQuizGenerator = createAdvancedContentGeneratorHook(
 *   config,
 *   {
 *     getGenerationSteps: () => ['Analyzing topic', 'Generating questions', 'Creating answers', 'Finalizing quiz'],
 *     getProgressPercentage: (step, total) => (step / total) * 100,
 *     validateGeneratedContent: (content) => content.questions?.length > 0,
 *     getContentPreview: (content) => `Quiz with ${content.questions?.length || 0} questions`,
 *     getExportOptions: () => [
 *       { format: 'json', label: 'JSON', extension: '.json' },
 *       { format: 'pdf', label: 'PDF', extension: '.pdf' },
 *       { format: 'docx', label: 'Word', extension: '.docx' }
 *     ]
 *   }
 * );
 */
