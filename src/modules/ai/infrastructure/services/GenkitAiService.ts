
import { injectable } from "tsyringe";
import { IAiService } from "../../domain/services/IAiService";
import { ai } from "@/ai/genkit";
import { executeWithQueue } from "@/ai/model-request-queue";
import { selectModel } from "@/ai/model-selector";
import { generateRequestId } from "@/ai/model-performance-monitor";

@injectable()
export class GenkitAiService implements IAiService {
    async generateText(prompt: string, options?: any): Promise<string> {
        // Simple text generation wrapper
        const result = await ai.generate({
            prompt,
            ...options
        });
        return result.text;
    }

    async runFlow<TInput, TOutput>(flow: any, input: TInput, flowName?: string): Promise<TOutput> {
        // If no flowName is provided, execute the flow directly without queue
        if (!flowName) {
            return flow(input);
        }
        
        // Use the request queue for better resource management and consistency
        try {
            const model = selectModel({ flowName });
            return await executeWithQueue(
                generateRequestId(),
                model,
                flowName,
                () => flow(input)
            );
        } catch (error) {
            // Fallback to direct execution if queue fails
            console.warn(`Queue execution failed for ${flowName}, falling back to direct execution`, error);
            return flow(input);
        }
    }

    async retrieveContext(query: string, options?: any): Promise<{ context: string; sources: any[] }> {
        // Dynamic import to avoid circular dependencies and client bundle issues
        const { retrieveContext } = require('@/modules/rag/infrastructure/retrieval');
        return retrieveContext(query, options);
    }

    async generateChapterWithRAG(input: any): Promise<any> {
        const { generateChapterContentWithRAG } = require('@/ai/flows/generate-chapter-content-rag');
        return generateChapterContentWithRAG(input);
    }

    async generateSectionWithRAG(input: any): Promise<any> {
        const { generateReportSectionWithRAG } = require('@/ai/flows/generate-report-section-rag');
        return generateReportSectionWithRAG(input);
    }
}
