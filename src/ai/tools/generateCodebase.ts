'use server';

import { ai } from '@/ai/genkit';
import { generateCodebase } from '@/ai/flows/generate-codebase';
import { z } from 'zod';

// This tool allows the AI to trigger the full codebase generation process.
// It uses the proposal from the main project state as its context.
export const generateCodebaseTool = ai.defineTool(
  {
    name: 'generateCodebase',
    description: 'Generates a complete boilerplate codebase for the project based on the proposal. Use this when the user asks to "generate the codebase", "scaffold the project", or "create all the files".',
    inputSchema: z.object({}), // No specific input needed from the LLM
    outputSchema: z.any(),
  },
  async (input, {state}) => {
    // The `generateCodebase` flow requires the proposal.
    // We assume the calling flow will have access to the full project state
    // and will pass the proposal when it calls this tool's underlying flow.
    // This is a placeholder for that logic. The actual implementation
    // is handled in the API route that orchestrates the tool call.
    if (!state.proposal) {
        throw new Error("A project proposal is required to generate the codebase.");
    }
    return generateCodebase({ proposal: state.proposal });
  }
);
