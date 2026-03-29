import { injectable } from "tsyringe";
import { IAiService } from "../../domain/services/IAiService";
import { ai } from "./Genkit";
import { executeWithQueue } from "./model-request-queue";
import { selectModel } from "./model-selector";
import { generateRequestId } from "./model-performance-monitor";

import { Result } from "@/infrastructure/utils/result";
import { AiError } from "../../domain/errors/AiErrors";
import { generateChapterContentWithRAG } from "../flows/generation/generate-chapter-content-rag";
import { generateReportSectionWithRAG } from "../flows/generation/generate-report-section-rag";

@injectable()
export class GenkitAiService implements IAiService {
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
        try {
            let result: any;
            if (!flowName) {
                result = await flow(input);
            } else {
                const model = selectModel({ flowName });
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
            console.warn(`Queue or flow execution failed for ${flowName || 'unnamed flow'}`, error);
            try {
                const result = await flow(input);
                return Result.ok(result);
            } catch (fallbackError: any) {
                return Result.fail(AiError.generationFailed(fallbackError.message));
            }
        }
    }

    async retrieveContext(query: string, options?: any): Promise<Result<{ context: string; sources: any[] }, AiError>> {
        try {
            // Dynamic import to avoid circular dependencies with RAG module
            const { retrieveContext } = require('@/modules/rag/infrastructure/retrieval');
            const result = await retrieveContext(query, options);
            return Result.ok(result);
        } catch (error: any) {
            return Result.fail(AiError.internal(error.message));
        }
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
