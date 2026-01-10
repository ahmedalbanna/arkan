
'use server';

/**
 * @fileOverview A text generation AI agent.
 *
 * - generateText - A function that handles the text generation process.
 * - GenerateTextInput - The input type for the generateText function.
 * - GenerateTextOutput - The return type for the generateText function.
 */

import { ai } from '@/ai/genkit';
import { GenerateTextInputSchema, GenerateTextOutputSchema, type GenerateTextInput, type GenerateTextOutput } from '@/ai/schemas';
import { validateJsonOutput, getJsonPromptInstructions, RECOMMENDED_TEMPERATURES } from '@/ai/utils/json-output-validator';

// Note: This flow now needs to be called with a user-specific AI instance.
// The API route will handle creating this instance based on the user's stored keys.
export async function generateText(input: GenerateTextInput): Promise<GenerateTextOutput> {


  const promptTemplate = ai.definePrompt({
    name: 'generateTextPrompt',
    input: { schema: GenerateTextInputSchema },
    output: { schema: GenerateTextOutputSchema },
    model: 'ollama/gemma:2b',
    config: {
      responseSchema: GenerateTextOutputSchema,
      temperature: RECOMMENDED_TEMPERATURES.CREATIVE,
    },
    prompt: `You are a writing assistant. Generate text based on the following prompt.

${getJsonPromptInstructions(`{
  "generatedText": "Your generated text here"
}`)}

**Prompt:** {{{prompt}}}

**JSON Output:**`,
  });

  const generateTextFlow = ai.defineFlow(
    {
      name: 'generateTextFlow',
      inputSchema: GenerateTextInputSchema,
      outputSchema: GenerateTextOutputSchema,
    },
    async (flowInput) => {
      try {
        const { output } = await promptTemplate(flowInput);
        
        if (!output) {
          throw new Error('No output received from the model.');
        }

        const validation = validateJsonOutput({
          schema: GenerateTextOutputSchema,
          output,
          flowName: 'generateTextFlow',
          attemptRecovery: true,
          enableLogging: true,
          fallbackFn: (rawOutput) => {
            if (typeof rawOutput === 'string') {
              return { generatedText: rawOutput };
            }
            return null;
          },
        });

        if (!validation.success) {
          throw new Error(validation.error || 'Failed to validate output');
        }

        return validation.data!;
      } catch (error) {
        console.error('Error in generateTextFlow:', error);
        throw new Error(`Text generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  );

  return generateTextFlow(input);
}
