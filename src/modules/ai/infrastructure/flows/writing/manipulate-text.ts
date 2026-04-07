'use server';

import { ai, MODEL_BY_TASK } from '@/modules/ai/infrastructure/services/Genkit';
import {
  ManipulateTextInputSchema,
  ManipulateTextOutputSchema,
  type ManipulateTextInput,
  type ManipulateTextOutput,
} from '@/modules/ai/domain/schemas';
import { Result } from '@/infrastructure/utils/result';
import { cleanAiOutput } from '@/infrastructure/utils/sanitizer';

/**
 * manipulateText — Atomic transformation flow for targeted text manipulations.
 * Handles micro-tasks like Summarize, Expand, and Stylistic Rewrite.
 * 
 * DEFENSIVE MEASURES:
 * 1. Type Integrity: Enforces strict schema parsing for all input vectors.
 * 2. Model Standardization: Enforces MODEL_BY_TASK.CONVERSION for speed and accuracy.
 * 3. Sanitization: Post-processes model output to ensure raw markdown purity.
 * 4. Containment: Returns Result<T, E> to the calling server action.
 */

const manipulatePrompt = ai.definePrompt({
  name: 'manipulateTextPrompt',
  input: { schema: ManipulateTextInputSchema },
  model: MODEL_BY_TASK.CONVERSION, // Standardized fast conversion model
  prompt: `You are an expert editor. A user has provided a piece of text and a command for how to change it. Your task is to follow the command and return the rewritten text.

Command: {{{command}}}

Original Text:
---
{{{textToManipulate}}}
---

Output ONLY the manipulated text. Do NOT include any preamble, filler, or JSON wrapping.`,
  config: {
    temperature: 0.5,
    maxOutputTokens: 2048,
  }
});

const manipulateTextFlow = ai.defineFlow(
  {
    name: 'manipulateText',
    inputSchema: ManipulateTextInputSchema,
    outputSchema: ManipulateTextOutputSchema,
  },
  async (input: ManipulateTextInput) => {
    // 1. NEURAL INFERENCE — Guarded execution
    const result = await manipulatePrompt(input);
    const rawText = result.text || result.output || "";
    
    if (!rawText) {
        throw new Error("Neural core failed to synthesize manipulated text.");
    }

    // 2. SPECTRAL CLEANUP — Strip model conversational artifacts
    return cleanAiOutput(rawText).trim();
  }
);

export async function manipulateText(
  input: ManipulateTextInput
): Promise<Result<ManipulateTextOutput, Error>> {
  // 3. SCHEMA GUARD — Early validation check
  const validation = ManipulateTextInputSchema.safeParse(input);
  if (!validation.success) {
    console.error('[Flow:ManipulateText] Schema mismatch:', validation.error.message);
    return Result.fail(new Error(`Invalid manipulation parameters: ${validation.error.message}`));
  }

  try {
    const result = await manipulateTextFlow(validation.data);
    return Result.ok(result);
  } catch (error) {
    console.error('[Flow:ManipulateText] Transformation pipeline failed:', error);
    return Result.fail(error instanceof Error ? error : new Error('Unknown manipulation failure'));
  }
}
