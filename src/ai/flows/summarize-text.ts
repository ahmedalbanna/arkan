
'use server';

/**
 * @fileOverview An AI agent for summarizing text.
 */

import { ai } from '@/ai/genkit';
import { SummarizeInputSchema, SummarizeLength, SummarizeOutputSchema, type SummarizeInput, type SummarizeOutput } from '@/ai/schemas';
import { validateJsonOutput, RECOMMENDED_TEMPERATURES } from '@/ai/utils/json-output-validator';
import z from 'zod';

const lengthDescriptions: Record<SummarizeLength, string> = {
    short: "a single, concise paragraph (approximately 50-100 words).",
    medium: "a few paragraphs, capturing the main points and key supporting details (approximately 150-300 words).",
    long: "a detailed summary, covering all significant topics and arguments (approximately 400-600 words).",
};

const summarizePrompt = ai.definePrompt({
    name: 'summarizeTextPrompt',
    input: { schema: z.object({ text: z.string(), instruction: z.string() }) },
    output: { schema: SummarizeOutputSchema },
    model: 'ollama/gemma:2b',
    config: {
        responseSchema: SummarizeOutputSchema,
        temperature: RECOMMENDED_TEMPERATURES.PRECISE,
    },
    prompt: `You are a professional text summarizer. You MUST respond with ONLY a valid JSON object.

**CRITICAL INSTRUCTIONS:**
1. Your ENTIRE response must be a valid JSON object
2. Do NOT include any text before or after the JSON
3. Do NOT use markdown code blocks or backticks
4. Follow this EXACT structure:
{
  "summary": "your summary text here"
}

**Task:**
- Read the text below carefully
- Create a summary that is {{{instruction}}}
- Output ONLY the JSON object with the "summary" field

**Text to Summarize:**
---
{{{text}}}
---

**JSON Output (remember: ONLY valid JSON, no extra text):**`,
});

const summarizeTextFlow = ai.defineFlow({
    name: 'summarizeTextFlow',
    inputSchema: SummarizeInputSchema,
    outputSchema: SummarizeOutputSchema
}, async (input) => {
    const instruction = lengthDescriptions[input.length] || lengthDescriptions.medium;
    
    try {
        const { output } = await summarizePrompt({ ...input, instruction });

        if (!output) {
            throw new Error("No output received from the model.");
        }

        // استخدام الدالة المساعدة للتحقق والتنظيف
        const validationResult = validateJsonOutput({
            schema: SummarizeOutputSchema,
            output,
            flowName: 'summarizeTextFlow',
            attemptRecovery: true,
            enableLogging: true,
            // Fallback: إذا فشل كل شيء، استخدم النص كملخص
            fallbackFn: (rawOutput) => {
                if (typeof rawOutput === 'string') {
                    return { summary: rawOutput };
                }
                return null;
            },
        });

        if (!validationResult.success) {
            throw new Error(validationResult.error || 'Failed to validate output');
        }

        return validationResult.data!;
    } catch (error) {
        console.error('Error in summarizeTextFlow:', error);
        throw new Error(`Failed to summarize text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
});

export async function summarizeText(input: SummarizeInput): Promise<SummarizeOutput> {
    const validation = SummarizeInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for summarizeText: ${validation.error.message}`);
    }
    
    try {
        return await summarizeTextFlow(validation.data);
    } catch (error) {
        console.error('Error in summarizeText:', error);
        throw error;
    }
}
