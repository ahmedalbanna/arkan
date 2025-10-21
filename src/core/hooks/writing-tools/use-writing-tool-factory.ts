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
