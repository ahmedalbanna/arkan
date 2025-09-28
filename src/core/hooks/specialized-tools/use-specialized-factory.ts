/**
 * Hook Factory للأدوات المتخصصة
 * يوفر طريقة مبسطة لإنشاء hooks الأدوات المتخصصة
 */

import { z } from 'zod';
import { useTextProcessor } from '../writing-tools/use-text-processor';

export interface SpecializedToolConfig {
    toolName: string;
    apiEndpoint: string;
    schema: z.ZodType;
    defaultValues: any;
    successMessage?: string;
    errorMessage?: string;
    enableFileUpload?: boolean;
    acceptedFileTypes?: string[];
    toolCategory?: 'research' | 'academic' | 'analysis' | 'documentation' | 'automation';
    customFeatures?: {
        getToolCapabilities?: () => string[];
        validateToolInput?: (data: any) => boolean;
        getToolTemplate?: (category: string) => any;
        formatToolOutput?: (data: any) => any;
    };
}

/**
 * Hook Factory للأدوات المتخصصة البسيطة
 * @param config إعدادات الأداة
 * @returns Hook جاهز للاستخدام
 */
export function createSpecializedToolHook(config: SpecializedToolConfig) {
    return function useSpecializedToolLogic() {
        const textProcessor = useTextProcessor({
            toolName: config.toolName,
            apiEndpoint: config.apiEndpoint,
            schema: config.schema,
            defaultValues: config.defaultValues,
            successMessage: config.successMessage || `${config.toolName} completed successfully!`,
            errorMessage: config.errorMessage || `Failed to process ${config.toolName}`,
            enableFileUpload: config.enableFileUpload ?? true,
            acceptedFileTypes: config.acceptedFileTypes || ['application/pdf', 'text/plain', 'text/markdown'],
        });

        // تنسيق ناتج الأداة المتخصصة
        const formatToolOutput = (data: any) => {
            if (config.customFeatures?.formatToolOutput) {
                return config.customFeatures.formatToolOutput(data);
            }

            // تنسيق افتراضي للأدوات المتخصصة
            return {
                title: data.title || `${config.toolName} Result`,
                content: data.content || data.result || data.output || data,
                metadata: {
                    category: config.toolCategory || 'analysis',
                    createdAt: new Date().toISOString(),
                    processingTime: data.processingTime || 0,
                    confidence: data.confidence || 0.8
                },
                rawData: data
            };
        };

        const toolOutput = textProcessor.mutation.data ? formatToolOutput(textProcessor.mutation.data) : null;

        return {
            // النموذج والحالة
            form: textProcessor.form,
            isProcessing: textProcessor.isProcessing,

            // النصوص والمحتوى
            originalText: textProcessor.originalText,
            processedText: textProcessor.processedText,
            toolResult: toolOutput,

            // النسخ
            isCopied: textProcessor.isCopied,
            handleCopy: () => textProcessor.copyToClipboard(toolOutput?.content || textProcessor.processedText),

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
            formatToolOutput,
            getToolCapabilities: config.customFeatures?.getToolCapabilities,
            validateToolInput: config.customFeatures?.validateToolInput,
            getToolTemplate: config.customFeatures?.getToolTemplate,

            // الطفرة
            mutation: textProcessor.mutation,
        };
    };
}

/**
 * Hook Factory للأدوات المتخصصة المتقدمة
 * @param config إعدادات الأداة
 * @param advancedFeatures ميزات متقدمة
 * @returns Hook جاهز للاستخدام مع ميزات متقدمة
 */
export function createAdvancedSpecializedToolHook(
    config: SpecializedToolConfig,
    advancedFeatures?: {
        getToolWorkflow?: () => Array<{ step: string; description: string; required: boolean }>;
        getToolValidation?: (data: any) => { isValid: boolean; errors: string[] };
        getToolExportFormats?: () => Array<{ format: string; label: string; extension: string }>;
        getToolPreview?: (data: any) => { title: string; summary: string; confidence: number };
        getToolMetrics?: (data: any) => { processingTime: number; confidence: number; accuracy: number };
        getToolSettings?: () => Array<{ setting: string; type: string; options: any[] }>;
        getToolHistory?: () => Array<{ id: string; timestamp: string; result: any }>;
    }
) {
    return function useAdvancedSpecializedToolLogic() {
        const baseHook = createSpecializedToolHook(config)();

        return {
            ...baseHook,

            // الميزات المتقدمة
            getToolWorkflow: advancedFeatures?.getToolWorkflow,
            getToolValidation: advancedFeatures?.getToolValidation,
            getToolExportFormats: advancedFeatures?.getToolExportFormats,
            getToolPreview: advancedFeatures?.getToolPreview,
            getToolMetrics: advancedFeatures?.getToolMetrics,
            getToolSettings: advancedFeatures?.getToolSettings,
            getToolHistory: advancedFeatures?.getToolHistory,
        };
    };
}

/**
 * أمثلة على الاستخدام:
 *
 * // أداة بحث بسيطة
 * const useAIResearcher = createSpecializedToolHook({
 *   toolName: 'ai-researcher',
 *   apiEndpoint: '/api/research/ai',
 *   schema: z.object({
 *     query: z.string().min(10),
 *     researchType: z.enum(['academic', 'market', 'technical']),
 *     depth: z.enum(['shallow', 'medium', 'deep'])
 *   }),
 *   defaultValues: { query: '', researchType: 'academic', depth: 'medium' },
 *   toolCategory: 'research',
 *   successMessage: 'Research completed successfully!',
 * });
 *
 * // أداة تحليل متقدمة
 * const useAdvancedDocumentAnalyzer = createAdvancedSpecializedToolHook(
 *   config,
 *   {
 *     getToolWorkflow: () => [
 *       { step: 'preprocessing', description: 'Preprocess input data', required: true },
 *       { step: 'analysis', description: 'Perform analysis', required: true },
 *       { step: 'extraction', description: 'Extract key insights', required: true },
 *       { step: 'validation', description: 'Validate results', required: false },
 *       { step: 'reporting', description: 'Generate report', required: false }
 *     ],
 *     getToolValidation: (data) => ({
 *       isValid: data.insights?.length > 0 && data.confidence > 0.5,
 *       errors: [
 *         ...(data.insights?.length === 0 ? ['No insights found'] : []),
 *         ...(data.confidence <= 0.5 ? ['Low confidence in results'] : [])
 *       ]
 *     }),
 *     getToolExportFormats: () => [
 *       { format: 'json', label: 'JSON Data', extension: '.json' },
 *       { format: 'csv', label: 'CSV Spreadsheet', extension: '.csv' },
 *       { format: 'pdf', label: 'PDF Report', extension: '.pdf' },
 *       { format: 'xlsx', label: 'Excel Workbook', extension: '.xlsx' }
 *     ],
 *     getToolPreview: (data) => ({
 *       title: data.title || 'Analysis Result',
 *       summary: data.summary || 'No summary available',
 *       confidence: data.confidence || 0
 *     }),
 *     getToolMetrics: (data) => ({
 *       processingTime: data.processingTime || 0,
 *       confidence: data.confidence || 0,
 *       accuracy: data.accuracy || 0
 *     }),
 *     getToolSettings: () => [
 *       { setting: 'analysisDepth', type: 'select', options: ['shallow', 'medium', 'deep'] },
 *       { setting: 'includeCharts', type: 'boolean', options: [true, false] },
 *       { setting: 'language', type: 'select', options: ['en', 'ar', 'fr', 'es'] }
 *     ],
 *     getToolHistory: () => [] // سيتم تنفيذها لاحقاً
 *   }
 * );
 */
