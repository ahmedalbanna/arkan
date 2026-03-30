
'use server';

/**
 * @fileOverview A text generation AI agent.
 *
 * - generateText - A function that handles the text generation process.
 * - GenerateTextInput - The input type for the generateText function.
 * - GenerateTextOutput - The return type for the generateText function.
 */

import { ai } from '@/modules/ai/infrastructure/services/Genkit';
import { GenerateTextInputSchema, GenerateTextOutputSchema, type GenerateTextInput, type GenerateTextOutput } from '@/modules/ai/domain/schemas';
import { RECOMMENDED_TEMPERATURES } from '@/modules/ai/domain/utils/json-output-validator';

// Note: This flow now needs to be called with a user-specific AI instance.
// The API route will handle creating this instance based on the user's stored keys.
export async function generateText(input: GenerateTextInput): Promise<GenerateTextOutput> {


  const promptTemplate = ai.definePrompt({
    name: 'generateTextPrompt',
    input: { schema: GenerateTextInputSchema },
    // No output schema - model returns plain text
    model: 'ollama/gemma:2b',
    config: {
      temperature: RECOMMENDED_TEMPERATURES.CREATIVE,
    },
    prompt: `You are a writing assistant. Generate text based on the following prompt.

Output ONLY the generated text. Do NOT wrap it in JSON or any other format.

**Prompt:** {{{prompt}}}`,
  });

  const generateTextFlow = ai.defineFlow(
    {
      name: 'generateTextFlow',
      inputSchema: GenerateTextInputSchema,
      outputSchema: GenerateTextOutputSchema,
    },
    async (flowInput: any) => {
      try {
        const result = await promptTemplate(flowInput);
        
        const text = result.text || result.output || '';

        if (!text || text.trim().length === 0) {
          throw new Error('Model returned empty text');
        }

        return text.trim();
      } catch (error) {
        console.error('Error in generateTextFlow:', error);
        throw new Error(`Text generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  );

  return generateTextFlow(input);
}
