

'use server';

/**
 * @fileOverview An AI agent for scaffolding a complete Next.js codebase.
 */

import { ai } from '@/ai/genkit';
import { CodebaseSchema, GenerateCodebaseInputSchema, type Codebase } from '@/ai/schemas';
import { z } from 'zod';

const generateCodebaseFlow = ai.defineFlow({
    name: 'generateCodebaseFlow',
    inputSchema: GenerateCodebaseInputSchema,
    outputSchema: CodebaseSchema,
}, async (input) => {
    const { output } = await codebasePrompt(input);
    if (!output) {
        throw new Error("Codebase generation failed.");
    }
    return output;
});


export async function generateCodebase(input: z.infer<typeof GenerateCodebaseInputSchema>): Promise<Codebase> {
    const validation = GenerateCodebaseInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for generateCodebase: ${validation.error.message}`);
    }
    return generateCodebaseFlow(validation.data);
}
