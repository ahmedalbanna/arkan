/**
 * Hook Factory لأدوات المقترحات
 * يوفر طريقة مبسطة لإنشاء hooks أدوات المقترحات
 */

import { z } from 'zod';
import { useTextProcessor } from '../writing-tools/use-text-processor';

export interface ProposalConfig {
    toolName: string;
    apiEndpoint: string;
    schema: z.ZodType;
    defaultValues: any;
    successMessage?: string;
    errorMessage?: string;
    enableFileUpload?: boolean;
    acceptedFileTypes?: string[];
    proposalType?: 'business' | 'academic' | 'technical' | 'creative';
    customFeatures?: {
        getProposalSections?: () => string[];
        validateProposalStructure?: (data: any) => boolean;
        getProposalTemplate?: (type: string) => any;
        formatProposalOutput?: (data: any) => any;
    };
}

/**
 * Hook Factory لأدوات المقترحات البسيطة
 * @param config إعدادات الأداة
 * @returns Hook جاهز للاستخدام
 */
export function createProposalToolHook(config: ProposalConfig) {
    return function useProposalToolLogic() {
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

        // تنسيق ناتج المقترح
        const formatProposalOutput = (data: any) => {
            if (config.customFeatures?.formatProposalOutput) {
                return config.customFeatures.formatProposalOutput(data);
            }

            // تنسيق افتراضي للمقترحات
            if (data.proposal) {
                return {
                    title: data.title || 'Untitled Proposal',
                    sections: data.sections || [],
                    content: data.proposal,
                    metadata: {
                        type: config.proposalType || 'business',
                        createdAt: new Date().toISOString(),
                        wordCount: data.proposal?.length || 0,
                    }
                };
            }

            return data;
        };

        const proposalOutput = textProcessor.mutation.data ? formatProposalOutput(textProcessor.mutation.data) : null;

        return {
            // النموذج والحالة
            form: textProcessor.form,
            isProcessing: textProcessor.isProcessing,

            // النصوص والمحتوى
            originalText: textProcessor.originalText,
            processedText: textProcessor.processedText,
            proposalContent: proposalOutput,

            // النسخ
            isCopied: textProcessor.isCopied,
            handleCopy: () => textProcessor.copyToClipboard(proposalOutput?.content || textProcessor.processedText),

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
            formatProposalOutput,
            getProposalSections: config.customFeatures?.getProposalSections,
            validateProposalStructure: config.customFeatures?.validateProposalStructure,
            getProposalTemplate: config.customFeatures?.getProposalTemplate,

            // الطفرة
            mutation: textProcessor.mutation,
        };
    };
}

/**
 * Hook Factory لأدوات المقترحات المتقدمة
 * @param config إعدادات الأداة
 * @param advancedFeatures ميزات متقدمة
 * @returns Hook جاهز للاستخدام مع ميزات متقدمة
 */
export function createAdvancedProposalToolHook(
    config: ProposalConfig,
    advancedFeatures?: {
        getProposalWorkflow?: () => Array<{ step: string; description: string; required: boolean }>;
        getProposalValidation?: (data: any) => { isValid: boolean; errors: string[] };
        getProposalExportFormats?: () => Array<{ format: string; label: string; extension: string }>;
        getProposalPreview?: (data: any) => { title: string; summary: string; sections: string[] };
        getProposalMetrics?: (data: any) => { wordCount: number; sectionCount: number; completeness: number };
    }
) {
    return function useAdvancedProposalToolLogic() {
        const baseHook = createProposalToolHook(config)();

        return {
            ...baseHook,

            // الميزات المتقدمة
            getProposalWorkflow: advancedFeatures?.getProposalWorkflow,
            getProposalValidation: advancedFeatures?.getProposalValidation,
            getProposalExportFormats: advancedFeatures?.getProposalExportFormats,
            getProposalPreview: advancedFeatures?.getProposalPreview,
            getProposalMetrics: advancedFeatures?.getProposalMetrics,
        };
    };
}

/**
 * أمثلة على الاستخدام:
 *
 * // أداة مقترح بسيطة
 * const useProposalGenerator = createProposalToolHook({
 *   toolName: 'proposal-generator',
 *   apiEndpoint: '/api/proposals/generate',
 *   schema: z.object({
 *     title: z.string().min(5),
 *     description: z.string().min(20),
 *     budget: z.number().min(0),
 *     timeline: z.string().min(1)
 *   }),
 *   defaultValues: { title: '', description: '', budget: 0, timeline: '' },
 *   proposalType: 'business',
 *   successMessage: 'Proposal generated successfully!',
 * });
 *
 * // أداة مقترح متقدمة
 * const useAdvancedProposalGenerator = createAdvancedProposalToolHook(
 *   config,
 *   {
 *     getProposalWorkflow: () => [
 *       { step: 'research', description: 'Research and analysis', required: true },
 *       { step: 'outline', description: 'Create proposal outline', required: true },
 *       { step: 'draft', description: 'Write initial draft', required: true },
 *       { step: 'review', description: 'Review and refine', required: false }
 *     ],
 *     getProposalValidation: (data) => ({
 *       isValid: data.sections?.length >= 3,
 *       errors: data.sections?.length < 3 ? ['At least 3 sections required'] : []
 *     }),
 *     getProposalExportFormats: () => [
 *       { format: 'pdf', label: 'PDF Document', extension: '.pdf' },
 *       { format: 'docx', label: 'Word Document', extension: '.docx' },
 *       { format: 'html', label: 'Web Page', extension: '.html' }
 *     ],
 *     getProposalPreview: (data) => ({
 *       title: data.title || 'Untitled',
 *       summary: data.summary || 'No summary available',
 *       sections: data.sections || []
 *     }),
 *     getProposalMetrics: (data) => ({
 *       wordCount: data.content?.length || 0,
 *       sectionCount: data.sections?.length || 0,
 *       completeness: Math.min(100, (data.sections?.length || 0) * 20)
 *     })
 *   }
 * );
 */
