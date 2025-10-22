
import { generate } from '@genkit-ai/ai';
import { ai } from '@/ai/genkit';
import { gemini20Flash } from '@genkit-ai/googleai';
import { proposalCompletionInputSchema, proposalCompletionOutputSchema } from '../schemas/proposal-completion';

const PROMPT = `
You are an expert project manager and tech consultant. Your task is to intelligently complete the following project proposal fields.

Input:
You will receive a JSON object containing the current state of the proposal, which may have some fields pre-filled by the user.

- If all fields are empty, generate a creative and interesting software project idea from scratch and fill out all fields.
- If some fields are filled, use them as the core idea. Your job is to fill in the remaining empty or partially filled fields in a way that is consistent and coherent with the user's input.
- The 'projectIdea' field is a simple, one-sentence summary. The 'advancedFields' provide more detail.

Instructions:
1. Analyze the provided fields to understand the user's intent.
2. Brainstorm and fill in all the missing information.
3. Ensure the final output is a complete, coherent, and professional-sounding project proposal.
4. Always return a complete JSON object conforming to the specified output schema. Do not omit any fields.

Here is the current state of the proposal:
{input_json}

Provide the completed proposal based on these instructions.
`;

export const completeProposalFieldsFlow = ai.defineFlow(
  {
    name: 'completeProposalFieldsFlow',
    inputSchema: proposalCompletionInputSchema,
    outputSchema: proposalCompletionOutputSchema,
  },
  async (input) => {
    const response = await ai.generate({
      model: gemini20Flash,
      prompt: PROMPT.replace('{input_json}', JSON.stringify(input, null, 2)),
      config: {
        temperature: 0.7,
      },
      output: {
        format: 'json',
        schema: proposalCompletionOutputSchema,
      },
    });

    return response.output();
  }
);
