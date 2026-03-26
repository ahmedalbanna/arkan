
import { Result } from "@/infrastructure/utils/result";
import { AiError } from "../errors/AiErrors";

export interface IAiService {
    generateText(prompt: string, options?: any): Promise<Result<string, AiError>>;
    runFlow<TInput, TOutput>(flow: (input: TInput) => Promise<TOutput>, input: TInput, flowName?: string): Promise<Result<TOutput, AiError>>;
    retrieveContext(query: string, options?: any): Promise<Result<{ context: string; sources: any[] }, AiError>>;
    generateChapterWithRAG(input: any): Promise<Result<any, AiError>>;
    generateSectionWithRAG(input: any): Promise<Result<any, AiError>>;
}

export const IAiServiceToken = Symbol("IAiService");
