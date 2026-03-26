
import { injectable } from "tsyringe";
import { IAiService } from "../../domain/services/IAiService";
import { ai } from "@/ai/genkit";
import { executeWithQueue } from "@/ai/model-request-queue";
import { selectModel } from "@/ai/model-selector";
import { generateRequestId } from "@/ai/model-performance-monitor";

import { Result } from "@/infrastructure/utils/result";
import { AiError } from "../../domain/errors/AiErrors";

@injectable()
export class GenkitAiService implements IAiService {
    async generateText(prompt: string, options?: any): Promise<Result<string, AiError>> {
        try {
            // Simple text generation wrapper
            const result = await ai.generate({
                prompt,
                ...options
            });
            return Result.ok(result.text);
        } catch (error: any) {
            return Result.fail(AiError.generationFailed(error.message));
        }
    }

    async runFlow<TInput, TOutput>(flow: any, input: TInput, flowName?: string): Promise<Result<TOutput, AiError>> {
        try {
            // If no flowName is provided, execute the flow directly without queue
            if (!flowName) {
                const data = await flow(input);
                return Result.ok(data);
            }
            
            // Use the request queue for better resource management and consistency
            const model = selectModel({ flowName });
            const result = await executeWithQueue(
                generateRequestId(),
                model,
                flowName,
                () => flow(input)
            );
            return Result.ok(result as TOutput);
        } catch (error: any) {
            console.warn(`Queue or flow execution failed for ${flowName || 'unnamed flow'}`, error);
            try {
                // Fallback to direct execution if queue fails
                const result = await flow(input);
                return Result.ok(result);
            } catch (fallbackError: any) {
                return Result.fail(AiError.generationFailed(fallbackError.message));
            }
        }
    }

    async retrieveContext(query: string, options?: any): Promise<Result<{ context: string; sources: any[] }, AiError>> {
        try {
            // Dynamic import to avoid circular dependencies and client bundle issues
            const { retrieveContext } = require('@/modules/rag/infrastructure/retrieval');
            const result = await retrieveContext(query, options);
            return Result.ok(result);
        } catch (error: any) {
            return Result.fail(AiError.internal(error.message));
        }
    }

    async generateChapterWithRAG(input: any): Promise<Result<any, AiError>> {
        try {
            const { generateChapterContentWithRAG } = require('@/ai/flows/generate-chapter-content-rag');
            const result = await generateChapterContentWithRAG(input);
            return Result.ok(result);
        } catch (error: any) {
            return Result.fail(AiError.generationFailed(error.message));
        }
    }

    async generateSectionWithRAG(input: any): Promise<Result<any, AiError>> {
        try {
            const { generateReportSectionWithRAG } = require('@/ai/flows/generate-report-section-rag');
            const result = await generateReportSectionWithRAG(input);
            return Result.ok(result);
        } catch (error: any) {
            return Result.fail(AiError.generationFailed(error.message));
        }
    }
}
