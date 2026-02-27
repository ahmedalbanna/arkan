
export interface IAiService {
    generateText(prompt: string, options?: any): Promise<string>;
    runFlow<TInput, TOutput>(flow: (input: TInput) => Promise<TOutput>, input: TInput, flowName?: string): Promise<TOutput>;
    retrieveContext(query: string, options?: any): Promise<{ context: string; sources: any[] }>;
    generateChapterWithRAG(input: any): Promise<any>;
    generateSectionWithRAG(input: any): Promise<any>;
}

export const IAiServiceToken = Symbol("IAiService");
