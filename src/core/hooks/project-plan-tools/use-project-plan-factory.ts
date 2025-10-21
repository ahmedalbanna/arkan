
import { z } from 'zod';
import { useTextProcessor } from '../../../hooks/base/use-text-processor';

export interface ProjectPlanToolConfig {
    toolName: string;
    apiEndpoint: string;
    schema: z.ZodType;
    defaultValues: any;
    successMessage?: string;
    errorMessage?: string;
    enableFileUpload?: boolean;
    acceptedFileTypes?: string[];
    planType?: 'business' | 'technical' | 'academic' | 'research' | 'development';
    customFeatures?: {
        formatOutput?: (data: any) => any;
        validateInput?: (data: any) => boolean;
        getPlanSections?: () => string[];
        getTimeline?: (data: any) => any;
        getResourceRequirements?: (data: any) => any;
        getMilestones?: (data: any) => any;
    };
}

export function createProjectPlanToolHook(config: ProjectPlanToolConfig) {
    return function useProjectPlanToolLogic() {
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
        const processedOutput = (config.customFeatures?.formatOutput && rawResults) ? config.customFeatures.formatOutput(rawResults) : rawResults;

        return {
            form: textProcessor.form,
            isProcessing: textProcessor.isProcessing,
            originalText: textProcessor.originalText,
            processedText: textProcessor.processedText,
            generatedPlan: processedOutput,
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
            getPlanSections: config.customFeatures?.getPlanSections,
            getTimeline: config.customFeatures?.getTimeline,
            getResourceRequirements: config.customFeatures?.getResourceRequirements,
            getMilestones: config.customFeatures?.getMilestones,
            planType: config.planType || 'business',
        };
    };
}

export function createAdvancedProjectPlanToolHook(
    config: ProjectPlanToolConfig,
    customFeatures?: {
        formatOutput?: (data: any) => any;
        validateInput?: (data: any) => boolean;
        getPlanSections?: () => string[];
        getTimeline?: (data: any) => any;
        getResourceRequirements?: (data: any) => any;
        getMilestones?: (data: any) => any;
        getRiskAssessment?: (data: any) => any;
        getBudgetEstimate?: (data: any) => any;
        exportPlan?: (data: any, format: 'pdf' | 'docx' | 'xlsx') => void;
    }
) {
    return function useAdvancedProjectPlanToolLogic() {
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
        const processedOutput = (customFeatures?.formatOutput && rawResults) ? customFeatures.formatOutput(rawResults) : rawResults;

        return {
            form: textProcessor.form,
            isProcessing: textProcessor.isProcessing,
            originalText: textProcessor.originalText,
            processedText: textProcessor.processedText,
            generatedPlan: processedOutput,
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
            getPlanSections: customFeatures?.getPlanSections,
            getTimeline: customFeatures?.getTimeline,
            getResourceRequirements: customFeatures?.getResourceRequirements,
            getMilestones: customFeatures?.getMilestones,
            getRiskAssessment: customFeatures?.getRiskAssessment,
            getBudgetEstimate: customFeatures?.getBudgetEstimate,
            exportPlan: customFeatures?.exportPlan,
            planType: config.planType || 'business',
        };
    };
}
