if (typeof window !== 'undefined') {
    throw new Error('GenkitAiService cannot be imported in the browser. It depends on server-only Genkit infrastructure.');
}

import { injectable, inject } from "tsyringe";
import { IAiService } from "../../domain/services/IAiService";
import { ai } from "./Genkit";
import { executeWithQueue } from "./model-request-queue";
import { selectModel } from "./model-selector";
import { generateRequestId } from "./model-performance-monitor";

import { Result } from "@/infrastructure/utils/result";
import { AiError } from "../../domain/errors/AiErrors";
import { generateChapterContentWithRAG } from "../flows/generation/generate-chapter-content-rag";
import { generateReportSectionWithRAG } from "../flows/generation/generate-report-section-rag";
import { IRetrievalServiceToken } from "../../domain/services/IRetrievalService";
import type { IRetrievalService, RetrievalOptions, RetrievalResult } from "../../domain/services/IRetrievalService";

@injectable()
export class GenkitAiService implements IAiService {
    constructor(
        @inject(IRetrievalServiceToken) private retrievalService: IRetrievalService
    ) {}

    async generateText(prompt: string, options?: any): Promise<Result<string, AiError>> {
        try {
            const result = await ai.generate({
                prompt,
                ...options
            });
            return Result.ok(result.text);
        } catch (error: any) {
            return Result.fail(AiError.generationFailed(error.message));
        }
    }

    /**
     * Post-processes AI output to remove common conversational prefixes from small models.
     */
    private cleanAiOutput(text: string): string {
        if (!text) return text;
        
        // List of common conversational prefixes used by small models like Gemma/Phi
        const patterns = [
            /^Sure,? (here is|here's) the [^:]+:?\s*/i,
            /^Sure,? here (is|'s) [^:]+:?\s*/i,
            /^Certainly!? [^:]+:?\s*/i,
            /^As requested,? [^:]+:?\s*/i,
            /^I have [^:]+ below:?\s*/i,
            /^The following is [^:]+:?\s*/i,
            /^Ok,? (here is|here's) [^:]+:?\s*/i,
            /^Below is the [^:]+:?\s*/i,
            /^Sure,? I can [^:]+:?\s*/i,
        ];

        let cleaned = text.trim();
        // Run multiple passes to catch nested filler
        for (let i = 0; i < 2; i++) {
            for (const pattern of patterns) {
                cleaned = cleaned.replace(pattern, '');
            }
            cleaned = cleaned.trim();
        }
        return cleaned;
    }

    async runFlow<TInput, TOutput>(flow: any, input: TInput, flowName?: string): Promise<Result<TOutput, AiError>> {
        const primaryModel = flowName ? selectModel({ flowName }) : null;
        const modelsToTry = primaryModel 
            ? [primaryModel, "ollama/phi4-mini:latest", "ollama/gemma:2b"] 
            : [null]; // null means direct execution without queue manager model selection
        
        // Remove duplicates while preserving order
        const uniqueModels = Array.from(new Set(modelsToTry));
        let lastError: any;

        for (const model of uniqueModels) {
            try {
                let result: any;
                if (!model) {
                    result = await flow(input);
                } else {
                    result = await executeWithQueue(
                        generateRequestId(),
                        model,
                        flowName,
                        () => flow(input)
                    );
                }

                // Post-process string outputs to remove conversational filler
                if (result && typeof result === 'object') {
                    for (const key in result) {
                        if (typeof result[key] === 'string') {
                            result[key] = this.cleanAiOutput(result[key]);
                        }
                    }
                } else if (typeof result === 'string') {
                    result = this.cleanAiOutput(result);
                }

                return Result.ok(result as TOutput);
            } catch (error: any) {
                lastError = error;
                console.warn(`Flow execution failed for model ${model || 'default'} in ${flowName || 'unnamed flow'}. Error: ${error.message}`);
                
                // If it's a validation error or user error, don't retry with other models
                if (error.message?.includes('validation') || error.status === 400) {
                    break;
                }
                
                // Continue to next model in the tiered fallback list
                continue;
            }
        }

        return Result.fail(AiError.generationFailed(lastError?.message || 'Flow execution failed after all fallback attempts'));
    }

    async retrieveContext(query: string, options?: RetrievalOptions): Promise<Result<RetrievalResult, AiError>> {
        return this.retrievalService.retrieveContext(query, options);
    }

    async generateChapterWithRAG(input: any): Promise<Result<any, AiError>> {
        try {
            const result = await generateChapterContentWithRAG(input);
            return Result.ok(result);
        } catch (error: any) {
            return Result.fail(AiError.generationFailed(error.message));
        }
    }

    async generateSectionWithRAG(input: any): Promise<Result<any, AiError>> {
        try {
            const result = await generateReportSectionWithRAG(input);
            return Result.ok(result);
        } catch (error: any) {
            return Result.fail(AiError.generationFailed(error.message));
        }
    }
}
