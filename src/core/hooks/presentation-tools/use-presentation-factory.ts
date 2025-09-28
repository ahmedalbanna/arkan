import { z } from 'zod';
import { useTextProcessor } from '../writing-tools/use-text-processor';

export interface PresentationToolConfig {
    toolName: string;
    apiEndpoint: string;
    schema: z.ZodType;
    defaultValues: any;
    successMessage?: string;
    errorMessage?: string;
    enableFileUpload?: boolean;
    acceptedFileTypes?: string[];
    presentationType?: 'slides' | 'outline' | 'script' | 'template';
    customFeatures?: {
        formatOutput?: (data: any) => any;
        validateInput?: (data: any) => boolean;
        getPresentationSections?: () => string[];
        getSlideCount?: (data: any) => number;
        getEstimatedDuration?: (data: any) => number;
    };
}

export function createPresentationToolHook(config: PresentationToolConfig) {
    return function usePresentationToolLogic() {
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

        const rawResults = textProcessor.mutation.data;
        const processedOutput = config.customFeatures?.formatOutput ? config.customFeatures.formatOutput(rawResults) : rawResults;

        return {
            form: textProcessor.form,
            isProcessing: textProcessor.isProcessing,
            originalText: textProcessor.originalText,
            processedText: textProcessor.processedText,
            generatedPresentation: processedOutput,
            isUploading: textProcessor.isUploading,
            getRootProps: textProcessor.getRootProps,
            getInputProps: textProcessor.getInputProps,
            isDragActive: textProcessor.isDragActive,
            onSubmit: textProcessor.handleSubmit,
            reset: textProcessor.reset,
            mutation: textProcessor.mutation,
            isCopied: textProcessor.isCopied,
            copyToClipboard: textProcessor.copyToClipboard,
            formatOutput: config.customFeatures?.formatOutput,
            validateInput: config.customFeatures?.validateInput,
            getPresentationSections: config.customFeatures?.getPresentationSections,
            getSlideCount: config.customFeatures?.getSlideCount,
            getEstimatedDuration: config.customFeatures?.getEstimatedDuration,
            presentationType: config.presentationType || 'slides',
        };
    };
}

export function createAdvancedPresentationToolHook(
    config: PresentationToolConfig,
    customFeatures?: {
        formatOutput?: (data: any) => any;
        validateInput?: (data: any) => boolean;
        getPresentationSections?: () => string[];
        getSlideCount?: (data: any) => number;
        getEstimatedDuration?: (data: any) => number;
        getPresentationMetrics?: (data: any) => any;
        exportPresentation?: (data: any, format: 'pdf' | 'pptx' | 'html') => void;
    }
) {
    return function useAdvancedPresentationToolLogic() {
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

        const rawResults = textProcessor.mutation.data;
        const processedOutput = customFeatures?.formatOutput ? customFeatures.formatOutput(rawResults) : rawResults;

        return {
            form: textProcessor.form,
            isProcessing: textProcessor.isProcessing,
            originalText: textProcessor.originalText,
            processedText: textProcessor.processedText,
            generatedPresentation: processedOutput,
            isUploading: textProcessor.isUploading,
            getRootProps: textProcessor.getRootProps,
            getInputProps: textProcessor.getInputProps,
            isDragActive: textProcessor.isDragActive,
            onSubmit: textProcessor.handleSubmit,
            reset: textProcessor.reset,
            mutation: textProcessor.mutation,
            isCopied: textProcessor.isCopied,
            copyToClipboard: textProcessor.copyToClipboard,
            formatOutput: customFeatures?.formatOutput,
            validateInput: customFeatures?.validateInput,
            getPresentationSections: customFeatures?.getPresentationSections,
            getSlideCount: customFeatures?.getSlideCount,
            getEstimatedDuration: customFeatures?.getEstimatedDuration,
            getPresentationMetrics: customFeatures?.getPresentationMetrics,
            exportPresentation: customFeatures?.exportPresentation,
            presentationType: config.presentationType || 'slides',
        };
    };
}
