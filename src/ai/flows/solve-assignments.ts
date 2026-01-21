'use server';

/**
 * @fileOverview An AI agent for solving assignments by extracting questions and generating answers.
 */

import { ai } from '@/ai/genkit';
import { SolveAssignmentsInputSchema, SolveAssignmentsOutputSchema, type SolveAssignmentsInput, type SolveAssignmentsOutput } from '@/ai/schemas';

const solveAssignmentsFlow = ai.defineFlow({
    name: 'solveAssignmentsFlow',
    inputSchema: SolveAssignmentsInputSchema,
    outputSchema: SolveAssignmentsOutputSchema
}, async (input) => {
    const { text } = input;

    const solvePrompt = ai.definePrompt({
        name: 'solveAssignmentsPrompt',
        input: { schema: SolveAssignmentsInputSchema },
        output: { schema: SolveAssignmentsOutputSchema },

        prompt: `You are an expert academic assistant specialized in solving assignments. Your task is to:

1. Carefully analyze the provided text/document
2. Extract all questions, problems, or tasks present
3. Provide comprehensive, well-structured answers for each question
4. Format the output in clear markdown with proper headings and structure

**Guidelines:**
- Identify questions even if they're not explicitly numbered (look for question words, instructions, prompts)
- Provide detailed, academic-quality answers
- Use proper formatting with headers, bullet points, and numbered lists where appropriate
- Include explanations and reasoning in your answers
- If mathematical problems are present, show step-by-step solutions
- Maintain academic integrity while providing educational guidance

**Input Text/Document:**
---
{{{text}}}
---

**Assignment Solutions:**

Please format your response as markdown with the following structure:
- Use ## for question headings
- Use clear, numbered sections if multiple questions
- Provide comprehensive answers with explanations
- Include relevant examples where helpful`,
        config: {
            temperature: 0.7,
            maxOutputTokens: 4000,
        }
    });

    const { output } = await solvePrompt({flow: "solve-assignments", text });
    if (!output) {
        throw new Error("Failed to solve assignments.");
    }

    return output;
});

export async function solveAssignments(input: SolveAssignmentsInput): Promise<SolveAssignmentsOutput> {
    const validation = SolveAssignmentsInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for solveAssignments: ${validation.error.message}`);
    }
    return solveAssignmentsFlow(validation.data);
}
