
'use server';

/**
 * @fileOverview An AI agent for generating a quiz from a block of text.
 */

import { ai } from '@/ai/genkit';
import { GenerateQuizInputSchema, GenerateQuizOutputSchema, type GenerateQuizInput, type GenerateQuizOutput } from '@/ai/schemas';

const multipleChoiceQuizPrompt = ai.definePrompt({
    name: 'multipleChoiceQuizPrompt',
    input: { schema: GenerateQuizInputSchema },
    output: { schema: GenerateQuizOutputSchema },
    model: 'ollama/gemma:2b',
    prompt: `You are an expert educator and quiz creator. Your task is to generate a multiple-choice quiz based on the provided text.

**Instructions:**
1.  Read the source text carefully to understand its key concepts and facts.
2.  Generate exactly {{{numQuestions}}} unique multiple-choice questions.
3.  Ensure the questions cover different aspects of the text.
4.  For each question, provide 4 distinct options.
5.  One option must be the correct answer.
6.  The correct answer must be one of the provided options.
7.  The output for each question must match the 'MultipleChoiceQuestionSchema'.

**Source Text:**
---
{{{text}}}
---
`,
});

const trueFalseQuizPrompt = ai.definePrompt({
    name: 'trueFalseQuizPrompt',
    input: { schema: GenerateQuizInputSchema },
    output: { schema: GenerateQuizOutputSchema },
    model: 'ollama/gemma:2b',
    prompt: `You are an expert educator and quiz creator. Your task is to generate a true/false quiz based on the provided text.

**Instructions:**
1.  Read the source text carefully to understand its key concepts and facts.
2.  Generate exactly {{{numQuestions}}} unique true/false questions.
3.  Ensure the questions cover different aspects of the text.
4.  Create a statement that is either true or false based on the text.
5.  The 'answer' must be either 'True' or 'False'.
6.  The 'options' array must be exactly ['True', 'False'].
7.  The output for each question must match the 'TrueFalseQuestionSchema'.

**Source Text:**
---
{{{text}}}
---
`,
});

const directQuestionQuizPrompt = ai.definePrompt({
    name: 'directQuestionQuizPrompt',
    input: { schema: GenerateQuizInputSchema },
    output: { schema: GenerateQuizOutputSchema },
    model: 'ollama/gemma:2b',
    prompt: `You are an expert educator and quiz creator. Your task is to generate a direct question quiz based on the provided text.

**Instructions:**
1.  Read the source text carefully to understand its key concepts and facts.
2.  Generate exactly {{{numQuestions}}} unique direct questions.
3.  Ensure the questions cover different aspects of the text.
4.  Ask a direct, open-ended question based on the text.
5.  Provide a concise, ideal answer in the 'answer' field.
6.  The output for each question must match the 'DirectQuestionSchema'.

**Source Text:**
---
{{{text}}}
---
`,
});

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
