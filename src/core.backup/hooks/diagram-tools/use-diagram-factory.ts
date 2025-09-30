/**
 * Hook Factory لأدوات المخططات
 * يوفر طريقة مبسطة لإنشاء hooks أدوات المخططات
 */

import { z } from 'zod';
import { useTextProcessor } from '../writing-tools/use-text-processor';

export interface DiagramConfig {
    toolName: string;
    apiEndpoint: string;
    schema: z.ZodType;
    defaultValues: any;
    successMessage?: string;
    errorMessage?: string;
    enableFileUpload?: boolean;
    acceptedFileTypes?: string[];
    diagramType?: 'flowchart' | 'uml' | 'mindmap' | 'sequence' | 'architecture' | 'network';
    customFeatures?: {
        getDiagramTypes?: () => string[];
        validateDiagramStructure?: (data: any) => boolean;
        getDiagramTemplate?: (type: string) => any;
        formatDiagramOutput?: (data: any) => any;
    };
}

/**
 * Hook Factory لأدوات المخططات البسيطة
 * @param config إعدادات الأداة
 * @returns Hook جاهز للاستخدام
 */
export function createDiagramToolHook(config: DiagramConfig) {
    return function useDiagramToolLogic() {
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

        // تنسيق ناتج المخطط
        const formatDiagramOutput = (data: any) => {
            if (config.customFeatures?.formatDiagramOutput) {
                return config.customFeatures.formatDiagramOutput(data);
            }

            // تنسيق افتراضي للمخططات
            if (data.diagram) {
                return {
                    title: data.title || 'Untitled Diagram',
                    type: config.diagramType || 'flowchart',
                    content: data.diagram,
                    metadata: {
                        createdAt: new Date().toISOString(),
                        nodeCount: data.nodes?.length || 0,
                        edgeCount: data.edges?.length || 0,
                        complexity: data.complexity || 'medium'
                    },
                    nodes: data.nodes || [],
                    edges: data.edges || [],
                    layout: data.layout || 'auto'
                };
            }

            return data;
        };

        const diagramOutput = textProcessor.mutation.data ? formatDiagramOutput(textProcessor.mutation.data) : null;

        return {
            // النموذج والحالة
            form: textProcessor.form,
            isProcessing: textProcessor.isProcessing,

            // النصوص والمحتوى
            originalText: textProcessor.originalText,
            processedText: textProcessor.processedText,
            diagramContent: diagramOutput,

            // النسخ
            isCopied: textProcessor.isCopied,
            handleCopy: () => textProcessor.copyToClipboard(diagramOutput?.content || textProcessor.processedText),

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
            formatDiagramOutput,
            getDiagramTypes: config.customFeatures?.getDiagramTypes,
            validateDiagramStructure: config.customFeatures?.validateDiagramStructure,
            getDiagramTemplate: config.customFeatures?.getDiagramTemplate,

            // الطفرة
            mutation: textProcessor.mutation,
        };
    };
}

/**
 * Hook Factory لأدوات المخططات المتقدمة
 * @param config إعدادات الأداة
 * @param advancedFeatures ميزات متقدمة
 * @returns Hook جاهز للاستخدام مع ميزات متقدمة
 */
export function createAdvancedDiagramToolHook(
    config: DiagramConfig,
    advancedFeatures?: {
        getDiagramWorkflow?: () => Array<{ step: string; description: string; required: boolean }>;
        getDiagramValidation?: (data: any) => { isValid: boolean; errors: string[] };
        getDiagramExportFormats?: () => Array<{ format: string; label: string; extension: string }>;
        getDiagramPreview?: (data: any) => { title: string; type: string; nodeCount: number };
        getDiagramMetrics?: (data: any) => { nodeCount: number; edgeCount: number; complexity: string };
        getDiagramLayouts?: () => Array<{ layout: string; label: string; description: string }>;
        getDiagramStyles?: () => Array<{ style: string; label: string; preview: string }>;
    }
) {
    return function useAdvancedDiagramToolLogic() {
        const baseHook = createDiagramToolHook(config)();

        return {
            ...baseHook,

            // الميزات المتقدمة
            getDiagramWorkflow: advancedFeatures?.getDiagramWorkflow,
            getDiagramValidation: advancedFeatures?.getDiagramValidation,
            getDiagramExportFormats: advancedFeatures?.getDiagramExportFormats,
            getDiagramPreview: advancedFeatures?.getDiagramPreview,
            getDiagramMetrics: advancedFeatures?.getDiagramMetrics,
            getDiagramLayouts: advancedFeatures?.getDiagramLayouts,
            getDiagramStyles: advancedFeatures?.getDiagramStyles,
        };
    };
}

/**
 * أمثلة على الاستخدام:
 *
 * // أداة مخطط بسيطة
 * const useFlowchartGenerator = createDiagramToolHook({
 *   toolName: 'flowchart-generator',
 *   apiEndpoint: '/api/diagrams/flowchart',
 *   schema: z.object({
 *     description: z.string().min(10),
 *     processType: z.enum(['linear', 'branching', 'circular']),
 *     includeDecisionPoints: z.boolean().default(true)
 *   }),
 *   defaultValues: { description: '', processType: 'linear', includeDecisionPoints: true },
 *   diagramType: 'flowchart',
 *   successMessage: 'Flowchart generated successfully!',
 * });
 *
 * // أداة مخطط متقدمة
 * const useAdvancedUMLGenerator = createAdvancedDiagramToolHook(
 *   config,
 *   {
 *     getDiagramWorkflow: () => [
 *       { step: 'analysis', description: 'Analyze requirements', required: true },
 *       { step: 'design', description: 'Design diagram structure', required: true },
 *       { step: 'generation', description: 'Generate diagram code', required: true },
 *       { step: 'validation', description: 'Validate diagram syntax', required: false },
 *       { step: 'optimization', description: 'Optimize layout', required: false }
 *     ],
 *     getDiagramValidation: (data) => ({
 *       isValid: data.nodes?.length > 0 && data.edges?.length >= 0,
 *       errors: [
 *         ...(data.nodes?.length === 0 ? ['At least one node required'] : []),
 *         ...(data.edges?.some(edge => !edge.source || !edge.target) ? ['Invalid edge connections'] : [])
 *       ]
 *     }),
 *     getDiagramExportFormats: () => [
 *       { format: 'svg', label: 'SVG Vector', extension: '.svg' },
 *       { format: 'png', label: 'PNG Image', extension: '.png' },
       { format: 'pdf', label: 'PDF Document', extension: '.pdf' },
 *       { format: 'mermaid', label: 'Mermaid Code', extension: '.mmd' }
 *     ],
 *     getDiagramPreview: (data) => ({
 *       title: data.title || 'Untitled Diagram',
 *       type: data.type || 'flowchart',
 *       nodeCount: data.nodes?.length || 0
 *     }),
 *     getDiagramMetrics: (data) => ({
 *       nodeCount: data.nodes?.length || 0,
 *       edgeCount: data.edges?.length || 0,
 *       complexity: data.complexity || 'medium'
 *     }),
 *     getDiagramLayouts: () => [
 *       { layout: 'hierarchical', label: 'Hierarchical', description: 'Top-down tree structure' },
 *       { layout: 'force', label: 'Force-directed', description: 'Natural node positioning' },
 *       { layout: 'circular', label: 'Circular', description: 'Nodes in circular arrangement' }
 *     ],
 *     getDiagramStyles: () => [
 *       { style: 'default', label: 'Default', preview: 'Standard appearance' },
 *       { style: 'minimal', label: 'Minimal', preview: 'Clean and simple' },
 *       { style: 'colorful', label: 'Colorful', preview: 'Vibrant colors' }
 *     ]
 *   }
 * );
 */
