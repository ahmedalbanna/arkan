
'use server';

/**
 * @fileOverview An AI agent for generating a quiz from a block of text.
 */

import { ai } from '@/ai/genkit';
import { directQuestionQuizPrompt, multipleChoiceQuizPrompt, trueFalseQuizPrompt } from '@/ai/prompts/generate-quiz';
import { GenerateQuizInputSchema, GenerateQuizOutputSchema, type GenerateQuizInput, type GenerateQuizOutput } from '@/ai/schemas';

const generateQuizFlow = ai.defineFlow({
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
}, async (input) => {
    let promptToUse;
    switch (input.questionType) {
        case 'multiple-choice':
            promptToUse = multipleChoiceQuizPrompt;
            break;
        case 'true-false':
            promptToUse = trueFalseQuizPrompt;
            break;
        case 'direct-question':
            promptToUse = directQuestionQuizPrompt;
            break;
        default:
            // This should not happen due to Zod validation, but it's good practice.
            throw new Error(`Unsupported question type: ${input.questionType}`);
    }
    const { output } = await promptToUse(input);
    if (!output) {
        throw new Error("Quiz generation failed.");
    }
    return output;
});

export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
    const validation = GenerateQuizInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for generateQuiz: ${validation.error.message}`);
    }
    return generateQuizFlow(validation.data);
}
