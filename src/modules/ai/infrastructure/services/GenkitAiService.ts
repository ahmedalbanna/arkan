
import "reflect-metadata";
import { injectable } from "tsyringe";
import { IAiService } from "../../domain/services/IAiService";
import { ai } from "@/ai/genkit";

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

    async runFlow<TInput, TOutput>(flow: any, input: TInput): Promise<TOutput> {
        // Genkit flows are functions that can be called directly
        // or via ai.runFlow if they are registered.
        // For now, assuming they are the functions exported from @/ai/flows
        return flow(input);
    }
}
