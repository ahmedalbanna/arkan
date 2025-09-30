/**
 * Hook Factory لأدوات التقارير
 * يوفر طريقة مبسطة لإنشاء hooks أدوات التقارير
 */

import { z } from 'zod';
import { useTextProcessor } from '../writing-tools/use-text-processor';

export interface ReportConfig {
    toolName: string;
    apiEndpoint: string;
    schema: z.ZodType;
    defaultValues: any;
    successMessage?: string;
    errorMessage?: string;
    enableFileUpload?: boolean;
    acceptedFileTypes?: string[];
    reportType?: 'analytical' | 'summary' | 'evaluation' | 'research' | 'technical';
    customFeatures?: {
        getReportSections?: () => string[];
        validateReportStructure?: (data: any) => boolean;
        getReportTemplate?: (type: string) => any;
        formatReportOutput?: (data: any) => any;
    };
}

/**
 * Hook Factory لأدوات التقارير البسيطة
 * @param config إعدادات الأداة
 * @returns Hook جاهز للاستخدام
 */
export function createReportToolHook(config: ReportConfig) {
    return function useReportToolLogic() {
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

        // تنسيق ناتج التقرير
        const formatReportOutput = (data: any) => {
            if (config.customFeatures?.formatReportOutput) {
                return config.customFeatures.formatReportOutput(data);
            }

            // تنسيق افتراضي للتقارير
            if (data.report) {
                return {
                    title: data.title || 'Untitled Report',
                    sections: data.sections || [],
                    content: data.report,
                    metadata: {
                        type: config.reportType || 'analytical',
                        createdAt: new Date().toISOString(),
                        wordCount: data.report?.length || 0,
                        pageCount: Math.ceil((data.report?.length || 0) / 500), // تقدير عدد الصفحات
                    }
                };
            }

            return data;
        };

        const reportOutput = textProcessor.mutation.data ? formatReportOutput(textProcessor.mutation.data) : null;

        return {
            // النموذج والحالة
            form: textProcessor.form,
            isProcessing: textProcessor.isProcessing,

            // النصوص والمحتوى
            originalText: textProcessor.originalText,
            processedText: textProcessor.processedText,
            reportContent: reportOutput,

            // النسخ
            isCopied: textProcessor.isCopied,
            handleCopy: () => textProcessor.copyToClipboard(reportOutput?.content || textProcessor.processedText),

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
            formatReportOutput,
            getReportSections: config.customFeatures?.getReportSections,
            validateReportStructure: config.customFeatures?.validateReportStructure,
            getReportTemplate: config.customFeatures?.getReportTemplate,

            // الطفرة
            mutation: textProcessor.mutation,
        };
    };
}

/**
 * Hook Factory لأدوات التقارير المتقدمة
 * @param config إعدادات الأداة
 * @param advancedFeatures ميزات متقدمة
 * @returns Hook جاهز للاستخدام مع ميزات متقدمة
 */
export function createAdvancedReportToolHook(
    config: ReportConfig,
    advancedFeatures?: {
        getReportWorkflow?: () => Array<{ step: string; description: string; required: boolean }>;
        getReportValidation?: (data: any) => { isValid: boolean; errors: string[] };
        getReportExportFormats?: () => Array<{ format: string; label: string; extension: string }>;
        getReportPreview?: (data: any) => { title: string; summary: string; sections: string[] };
        getReportMetrics?: (data: any) => { wordCount: number; sectionCount: number; completeness: number };
        getReportCharts?: (data: any) => Array<{ type: string; title: string; data: any }>;
    }
) {
    return function useAdvancedReportToolLogic() {
        const baseHook = createReportToolHook(config)();

        return {
            ...baseHook,

            // الميزات المتقدمة
            getReportWorkflow: advancedFeatures?.getReportWorkflow,
            getReportValidation: advancedFeatures?.getReportValidation,
            getReportExportFormats: advancedFeatures?.getReportExportFormats,
            getReportPreview: advancedFeatures?.getReportPreview,
            getReportMetrics: advancedFeatures?.getReportMetrics,
            getReportCharts: advancedFeatures?.getReportCharts,
        };
    };
}

/**
 * أمثلة على الاستخدام:
 *
 * // أداة تقرير بسيطة
 * const useReportGenerator = createReportToolHook({
 *   toolName: 'report-generator',
 *   apiEndpoint: '/api/reports/generate',
 *   schema: z.object({
 *     title: z.string().min(5),
 *     data: z.string().min(20),
 *     analysisType: z.enum(['summary', 'detailed', 'comparative']),
 *     includeCharts: z.boolean().default(true)
 *   }),
 *   defaultValues: { title: '', data: '', analysisType: 'summary', includeCharts: true },
 *   reportType: 'analytical',
 *   successMessage: 'Report generated successfully!',
 * });
 *
 * // أداة تقرير متقدمة
 * const useAdvancedReportGenerator = createAdvancedReportToolHook(
 *   config,
 *   {
 *     getReportWorkflow: () => [
 *       { step: 'data-analysis', description: 'Analyze input data', required: true },
 *       { step: 'structure', description: 'Create report structure', required: true },
 *       { step: 'content', description: 'Generate report content', required: true },
 *       { step: 'visualization', description: 'Add charts and graphs', required: false },
 *       { step: 'review', description: 'Review and finalize', required: false }
 *     ],
 *     getReportValidation: (data) => ({
 *       isValid: data.sections?.length >= 2 && data.content?.length > 100,
 *       errors: [
 *         ...(data.sections?.length < 2 ? ['At least 2 sections required'] : []),
 *         ...(data.content?.length <= 100 ? ['Content too short'] : [])
 *       ]
 *     }),
 *     getReportExportFormats: () => [
 *       { format: 'pdf', label: 'PDF Document', extension: '.pdf' },
 *       { format: 'docx', label: 'Word Document', extension: '.docx' },
 *       { format: 'html', label: 'Web Page', extension: '.html' },
 *       { format: 'xlsx', label: 'Excel Spreadsheet', extension: '.xlsx' }
 *     ],
 *     getReportPreview: (data) => ({
 *       title: data.title || 'Untitled Report',
 *       summary: data.summary || 'No summary available',
 *       sections: data.sections || []
 *     }),
 *     getReportMetrics: (data) => ({
 *       wordCount: data.content?.length || 0,
 *       sectionCount: data.sections?.length || 0,
 *       completeness: Math.min(100, (data.sections?.length || 0) * 25)
 *     }),
 *     getReportCharts: (data) => data.charts || []
 *   }
 * );
 */
