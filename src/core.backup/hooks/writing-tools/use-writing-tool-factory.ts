/**
 * Hook Factory لإنشاء hooks أدوات الكتابة بسهولة
 * يوفر طريقة مبسطة لإنشاء hooks جديدة باستخدام النظام الأساسي
 */

import { z } from 'zod';
import { useTextProcessor } from './use-text-processor';

export interface WritingToolConfig {
    toolName: string;
    apiEndpoint: string;
    schema: z.ZodType;
    defaultValues: any;
    successMessage?: string;
    errorMessage?: string;
    enableFileUpload?: boolean;
    acceptedFileTypes?: string[];
    customFeatures?: string[];
}

/**
 * Hook Factory لإنشاء hooks أدوات الكتابة
 * @param config إعدادات الأداة
 * @returns Hook جاهز للاستخدام
 */
export function createWritingToolHook(config: WritingToolConfig) {
    return function useWritingToolLogic() {
        const textProcessor = useTextProcessor({
            toolName: config.toolName,
            apiEndpoint: config.apiEndpoint,
            schema: config.schema,
            defaultValues: config.defaultValues,
            successMessage: config.successMessage || `${config.toolName} completed successfully!`,
            errorMessage: config.errorMessage || `${config.toolName} failed`,
            enableFileUpload: config.enableFileUpload ?? true,
            acceptedFileTypes: config.acceptedFileTypes || ['application/pdf', 'text/plain', 'text/markdown'],
        });

        return {
            // النموذج والحالة
            form: textProcessor.form,
            isProcessing: textProcessor.isProcessing,

            // النصوص
            originalText: textProcessor.originalText,
            processedText: textProcessor.processedText,

            // النسخ
            isCopied: textProcessor.isCopied,
            handleCopy: () => textProcessor.copyToClipboard(textProcessor.processedText),

            // رفع الملفات
            isUploading: textProcessor.isUploading,
            getRootProps: textProcessor.getRootProps,
            getInputProps: textProcessor.getInputProps,
            isDragActive: textProcessor.isDragActive,

            // المعالجة
            onSubmit: textProcessor.handleSubmit,
            reset: textProcessor.reset,

            // الطفرة
            mutation: textProcessor.mutation,
        };
    };
}

/**
 * Hook Factory محسن مع ميزات إضافية
 * @param config إعدادات الأداة
 * @param customFeatures ميزات مخصصة إضافية
 * @returns Hook جاهز للاستخدام مع ميزات مخصصة
 */
export function createAdvancedWritingToolHook(
    config: WritingToolConfig,
    customFeatures?: {
        getScoreColor?: (score: number) => string;
        formatResults?: (data: any) => any;
        validateInput?: (data: any) => boolean;
    }
) {
    return function useAdvancedWritingToolLogic() {
        const textProcessor = useTextProcessor({
            toolName: config.toolName,
            apiEndpoint: config.apiEndpoint,
            schema: config.schema,
            defaultValues: config.defaultValues,
            successMessage: config.successMessage || `${config.toolName} completed successfully!`,
            errorMessage: config.errorMessage || `${config.toolName} failed`,
            enableFileUpload: config.enableFileUpload ?? true,
            acceptedFileTypes: config.acceptedFileTypes || ['application/pdf', 'text/plain', 'text/markdown'],
        });

        // الحصول على النتائج من الطفرة
        const rawResults = textProcessor.mutation.data;
        const results = customFeatures?.formatResults ? customFeatures.formatResults(rawResults) : rawResults;

        return {
            // النموذج والحالة
            form: textProcessor.form,
            isProcessing: textProcessor.isProcessing,

            // النصوص
            originalText: textProcessor.originalText,
            processedText: textProcessor.processedText,

            // النسخ
            isCopied: textProcessor.isCopied,
            handleCopy: () => textProcessor.copyToClipboard(textProcessor.processedText),

            // رفع الملفات
            isUploading: textProcessor.isUploading,
            getRootProps: textProcessor.getRootProps,
            getInputProps: textProcessor.getInputProps,
            isDragActive: textProcessor.isDragActive,

            // المعالجة
            onSubmit: textProcessor.handleSubmit,
            reset: textProcessor.reset,

            // النتائج والوظائف المساعدة
            results,
            getScoreColor: customFeatures?.getScoreColor,
            validateInput: customFeatures?.validateInput,

            // الطفرة
            mutation: textProcessor.mutation,
        };
    };
}

/**
 * أمثلة على الاستخدام:
 *
 * // مثال بسيط
 * const useSimpleTool = createWritingToolHook({
 *   toolName: 'simple-tool',
 *   apiEndpoint: '/api/simple-tool',
 *   schema: z.object({ text: z.string().min(10) }),
 *   defaultValues: { text: '' },
 * });
 *
 * // مثال متقدم
 * const useAdvancedTool = createAdvancedWritingToolHook(
 *   {
 *     toolName: 'advanced-tool',
 *     apiEndpoint: '/api/advanced-tool',
 *     schema: z.object({ text: z.string().min(10) }),
 *     defaultValues: { text: '' },
 *   },
 *   {
 *     getScoreColor: (score) => score > 50 ? 'text-green-500' : 'text-red-500',
 *     formatResults: (data) => ({ ...data, formatted: true }),
 *     validateInput: (data) => data.text.length > 0,
 *   }
 * );
 */
