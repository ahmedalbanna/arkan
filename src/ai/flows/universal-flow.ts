

/**
 * @fileOverview Universal AI Flow - A single flow that handles all AI operations
 * using prompts from the centralized prompts collection.
 *
 * This replaces 40+ individual flow files with a unified architecture that:
 * - Uses prompts from prompts/index.ts
 * - Validates input/output with Zod schemas
 * - Supports pre/post-processing
 * - Handles user-specific API keys
 * - Provides consistent error handling
 */

import { ai, configureUserAi } from '@/ai/genkit';
import { prompts } from '@/ai/prompts';
import { flowRegistry, type FlowMetadata } from './flow-registry';

/**
 * Execute any AI flow by name using the universal flow architecture.
 *
 * @param flowName - The name of the flow to execute (must be in flowRegistry)
 * @param input - The input data for the flow (validated against inputSchema)
 * @param userApiKeys - Optional user-specific API keys (e.g., { gemini: '...' })
 * @returns The flow output (validated against outputSchema)
 *
 * @example
 * ```typescript
 * const result = await executeFlow('summarizeText', {
 *   text: 'Long text to summarize...',
 *   length: 'medium'
 * });
 * ```
 */
export async function executeFlow<TInput = any, TOutput = any>(
  flowName: string,
  input: TInput,
  userApiKeys?: Record<string, string>
): Promise<TOutput> {
  // 1. Get flow metadata from registry
  const metadata = flowRegistry[flowName];
  if (!metadata) {
    throw new Error(
      `Flow '${flowName}' not found in registry. Available flows: ${Object.keys(flowRegistry).join(', ')}`
    );
  }

  // 2. Validate input
  const validation = metadata.inputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(
      `Invalid input for flow '${flowName}': ${validation.error.message}`
    );
  }

  // 3. Pre-process input if needed
  const processedInput = metadata.preProcessor
    ? metadata.preProcessor(validation.data)
    : validation.data;

  // 4. Configure AI instance (use user keys if provided)
  const aiInstance = userApiKeys ? configureUserAi(userApiKeys) : ai;

  // 5. Get prompt from prompts collection
  const prompt = (prompts as any)[metadata.promptKey];
  if (!prompt) {
    throw new Error(
      `Prompt '${metadata.promptKey}' not found in prompts collection. Available prompts: ${Object.keys(prompts).join(', ')}`
    );
  }

  // 6. Execute the prompt
  const { output } = await prompt(processedInput);
  if (!output) {
    throw new Error(`Flow '${flowName}' failed to produce output`);
  }

  // 7. Post-process output if needed
  const processedOutput = metadata.postProcessor
    ? metadata.postProcessor(output)
    : output;

  // 8. Validate output
  const outputValidation = metadata.outputSchema.safeParse(processedOutput);
  if (!outputValidation.success) {
    throw new Error(
      `Invalid output from flow '${flowName}': ${outputValidation.error.message}`
    );
  }

  return outputValidation.data as TOutput;
}

/**
 * Helper function to get the list of available flows.
 * Useful for debugging and documentation.
 */
export function getAvailableFlows(): string[] {
  return Object.keys(flowRegistry).sort();
}

/**
 * Helper function to get metadata for a specific flow.
 * Useful for debugging and understanding flow configuration.
 */
export function getFlowMetadata(flowName: string): FlowMetadata | undefined {
  return flowRegistry[flowName];
}
