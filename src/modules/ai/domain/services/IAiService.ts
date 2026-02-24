
export interface IAiService {
    generateText(prompt: string, options?: any): Promise<string>;
    runFlow<TInput, TOutput>(flow: (input: TInput) => Promise<TOutput>, input: TInput): Promise<TOutput>;
}

export const IAiServiceToken = Symbol("IAiService");
