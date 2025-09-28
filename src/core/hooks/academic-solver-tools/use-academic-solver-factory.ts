import { z } from 'zod';
import { useTextProcessor } from '../writing-tools/use-text-processor';

export interface AcademicSolverToolConfig {
    toolName: string;
    apiEndpoint: string;
    schema: z.ZodType;
    defaultValues: any;
    successMessage?: string;
    errorMessage?: string;
    enableFileUpload?: boolean;
    acceptedFileTypes?: string[];
    solverType?: 'math' | 'physics' | 'chemistry' | 'biology' | 'engineering' | 'general';
    customFeatures?: {
        formatOutput?: (data: any) => any;
        validateInput?: (data: any) => boolean;
        getSolutionSteps?: (data: any) => string[];
        getAnswer?: (data: any) => any;
        getExplanation?: (data: any) => string;
        getRelatedProblems?: (data: any) => any[];
    };
}

export function createAcademicSolverToolHook(config: AcademicSolverToolConfig) {
    return function useAcademicSolverToolLogic() {
        const textProcessor = useTextProcessor({
            toolName: config.toolName,
            apiEndpoint: config.apiEndpoint,
            schema: config.schema,
            defaultValues: config.defaultValues,
            successMessage: config.successMessage || `${config.toolName} solved successfully!`,
            errorMessage: config.errorMessage || `Failed to solve ${config.toolName}`,
            enableFileUpload: config.enableFileUpload ?? true,
            acceptedFileTypes: config.acceptedFileTypes || ['application/pdf', 'text/plain', 'text/markdown', 'image/jpeg', 'image/png'],
        });

        const rawResults = textProcessor.mutation.data;
        const processedOutput = config.customFeatures?.formatOutput ? config.customFeatures.formatOutput(rawResults) : rawResults;

        return {
            form: textProcessor.form,
            isProcessing: textProcessor.isProcessing,
            originalText: textProcessor.originalText,
            processedText: textProcessor.processedText,
            solution: processedOutput,
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
            getSolutionSteps: config.customFeatures?.getSolutionSteps,
            getAnswer: config.customFeatures?.getAnswer,
            getExplanation: config.customFeatures?.getExplanation,
            getRelatedProblems: config.customFeatures?.getRelatedProblems,
            solverType: config.solverType || 'general',
        };
    };
}

export function createAdvancedAcademicSolverToolHook(
    config: AcademicSolverToolConfig,
    customFeatures?: {
        formatOutput?: (data: any) => any;
        validateInput?: (data: any) => boolean;
        getSolutionSteps?: (data: any) => string[];
        getAnswer?: (data: any) => any;
        getExplanation?: (data: any) => string;
        getRelatedProblems?: (data: any) => any[];
        getDifficultyLevel?: (data: any) => 'easy' | 'medium' | 'hard';
        getTimeEstimate?: (data: any) => number;
        getRequiredConcepts?: (data: any) => string[];
        exportSolution?: (data: any, format: 'pdf' | 'latex' | 'markdown') => void;
    }
) {
    return function useAdvancedAcademicSolverToolLogic() {
        const textProcessor = useTextProcessor({
            toolName: config.toolName,
            apiEndpoint: config.apiEndpoint,
            schema: config.schema,
            defaultValues: config.defaultValues,
            successMessage: config.successMessage || `${config.toolName} solved successfully!`,
            errorMessage: config.errorMessage || `Failed to solve ${config.toolName}`,
            enableFileUpload: config.enableFileUpload ?? true,
            acceptedFileTypes: config.acceptedFileTypes || ['application/pdf', 'text/plain', 'text/markdown', 'image/jpeg', 'image/png'],
        });

        const rawResults = textProcessor.mutation.data;
        const processedOutput = customFeatures?.formatOutput ? customFeatures.formatOutput(rawResults) : rawResults;

        return {
            form: textProcessor.form,
            isProcessing: textProcessor.isProcessing,
            originalText: textProcessor.originalText,
            processedText: textProcessor.processedText,
            solution: processedOutput,
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
            getSolutionSteps: customFeatures?.getSolutionSteps,
            getAnswer: customFeatures?.getAnswer,
            getExplanation: customFeatures?.getExplanation,
            getRelatedProblems: customFeatures?.getRelatedProblems,
            getDifficultyLevel: customFeatures?.getDifficultyLevel,
            getTimeEstimate: customFeatures?.getTimeEstimate,
            getRequiredConcepts: customFeatures?.getRequiredConcepts,
            exportSolution: customFeatures?.exportSolution,
            solverType: config.solverType || 'general',
        };
    };
}
