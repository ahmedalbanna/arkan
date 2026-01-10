/**
 * @fileOverview Helper functions for creating and configuring AI prompts with JSON validation
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { validateJsonOutput, RECOMMENDED_TEMPERATURES } from './json-output-validator';

/**
 * Configuration for creating a validated prompt
 */
export interface ValidatedPromptConfig<TInput extends z.ZodTypeAny, TOutput extends z.ZodTypeAny> {
  name: string;
  inputSchema: TInput;
  outputSchema: TOutput;
  prompt: string;
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
}

/**
 * Creates a prompt with automatic JSON validation
 * This wraps the standard ai.definePrompt with validation logic
 */
export function createValidatedPrompt<TInput extends z.ZodTypeAny, TOutput extends z.ZodTypeAny>(
  config: ValidatedPromptConfig<TInput, TOutput>
) {
  const {
    name,
    inputSchema,
    outputSchema,
    prompt,
    model = 'ollama/gemma:2b',
    temperature = RECOMMENDED_TEMPERATURES.BALANCED,
    maxOutputTokens,
  } = config;

  return ai.definePrompt({
    name,
    input: { schema: inputSchema },
    output: { schema: outputSchema },
    model,
    prompt,
    config: {
      responseSchema: outputSchema,
      temperature,
      ...(maxOutputTokens && { maxOutputTokens }),
    },
  });
}

/**
 * Creates a flow with automatic JSON validation and error handling
 */
export function createValidatedFlow<TInput extends z.ZodTypeAny, TOutput extends z.ZodTypeAny>(config: {
  name: string;
  inputSchema: TInput;
  outputSchema: TOutput;
  prompt: ReturnType<typeof createValidatedPrompt<TInput, TOutput>>;
  fallbackFn?: (rawOutput: unknown) => z.infer<TOutput> | null;
}) {
  const { name, inputSchema, outputSchema, prompt, fallbackFn } = config;

  return ai.defineFlow(
    {
      name,
      inputSchema,
      outputSchema,
    },
    async (input) => {
      try {
        const { output } = await prompt(input);

        if (!output) {
          throw new Error(`${name} failed to produce an output.`);
        }

        // Validate using the helper
        const validationResult = validateJsonOutput({
          schema: outputSchema,
          output,
          flowName: name,
          attemptRecovery: true,
          enableLogging: true,
          fallbackFn,
        });

        if (!validationResult.success) {
          throw new Error(validationResult.error || `Failed to validate ${name} output`);
        }

        return validationResult.data!;
      } catch (error) {
        console.error(`Error in ${name}:`, error);
        throw new Error(`${name} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  );
}

/**
 * Quick helper to add temperature config to existing prompt configs
 */
export function withOptimalTemperature(existingConfig: Record<string, unknown>, taskType: 'precise' | 'balanced' | 'creative' = 'balanced') {
  const temperatures = {
    precise: RECOMMENDED_TEMPERATURES.PRECISE,
    balanced: RECOMMENDED_TEMPERATURES.BALANCED,
    creative: RECOMMENDED_TEMPERATURES.CREATIVE,
  };

  return {
    ...existingConfig,
    temperature: temperatures[taskType],
  };
}
