'use server';

/**
 * Unified AI Generation Flow
 * Single flow that handles all text generation tasks
 */

import { ai } from '@/ai/genkit';
import { withRetry, DEFAULT_RETRY_CONFIG } from '@/lib/utils/retry-utils';
import { logger } from '@/lib/utils/logger';
import {
  UnifiedGenerationInput,
  UnifiedGenerationInputSchema,
  UnifiedGenerationOutput,
  UnifiedGenerationOutputSchema,
  mergeModelConfig,
} from '../schemas/unified-generation';

/**
 * Universal text generation function
 * Handles all generation types: Section, Grammar, Translation, etc.
 * 
 * @param input - Unified generation input with system/user prompts
 * @returns Generated content with metadata
 */
export async function generateUnified(
  input: UnifiedGenerationInput
): Promise<UnifiedGenerationOutput> {
  const startTime = Date.now();

  logger.info(`Starting ${input.processType} generation for ${input.processId}`);

  // Merge user config with process-specific defaults
  const modelConfig = mergeModelConfig(input.processType, input.modelConfig);

  logger.info(`Using model: ${modelConfig.modelName} (temp: ${modelConfig.temperature})`);

  // Define the prompt with unified input
  // No output schema - let models generate plain text (works best for all model sizes)
  const unifiedPrompt = ai.definePrompt({
    name: 'unifiedGenerationPrompt',
    input: { schema: UnifiedGenerationInputSchema },
    // No output schema - plain text generation
    model: modelConfig.modelName,
    system: '{{systemPrompt}}',
    prompt: '{{userPrompt}}',
    config: {
      temperature: modelConfig.temperature,
      ...(modelConfig.maxTokens && { maxOutputTokens: modelConfig.maxTokens }),
    },
  });

  // Call the AI with retry logic
  const result = await withRetry(
    () => unifiedPrompt(input),
    DEFAULT_RETRY_CONFIG,
    `${input.processType}: ${input.processId}`
  );

  // Extract content from response (handle various formats)
  const content = extractContent(result);

  const endTime = Date.now();
  const processingTimeMs = endTime - startTime;

  // Build output with metadata
  const output: UnifiedGenerationOutput = {
    processType: input.processType,
    processId: input.processId,
    content: content.trim(),
    metadata: {
      modelUsed: modelConfig.modelName,
      generatedAt: new Date().toISOString(),
      processingTimeMs,
    },
  };

  // Validate output has content
  if (!output.content || output.content.length === 0) {
    logger.error(`AI generated empty response for ${input.processType}: ${input.processId}`);
    throw new Error(
      `The AI failed to generate content for ${input.processType} '${input.processId}'. Please try again.`
    );
  }

  logger.info(
    `✓ Successfully generated ${input.processType}: ${input.processId} ` +
    `(${output.content.length} chars in ${processingTimeMs}ms)`
  );

  return output;
}

/**
 * Extract content from various AI response formats
 * Handles string responses, object responses, and candidates arrays
 */
function extractContent(result: unknown): string {
  // Direct string response (most common)
  if (typeof result === 'string') {
    return result;
  }

  // Object response - try various field names
  if (result && typeof result === 'object') {
    const resultObj = result as any;

    // Try common field names
    const content =
      resultObj.text ||
      resultObj.content ||
      resultObj.output ||
      resultObj.response ||
      resultObj.message ||
      '';

    if (content) {
      return content;
    }

    // Try candidates array (some model implementations)
    if (resultObj.candidates && Array.isArray(resultObj.candidates)) {
      const candidate = resultObj.candidates[0];
      if (candidate) {
        return candidate.content || candidate.text || candidate.output || '';
      }
    }

    // Try data field
    if (resultObj.data) {
      return extractContent(resultObj.data);
    }
  }

  // If we got here, no content found
  return '';
}

/**
 * Batch generation - generate multiple items in parallel
 * Useful for generating multiple sections, corrections, etc.
 */
export async function generateUnifiedBatch(
  inputs: UnifiedGenerationInput[]
): Promise<Array<{ success: boolean; result?: UnifiedGenerationOutput; error?: Error }>> {
  logger.info(`Starting batch generation: ${inputs.length} items`);

  const promises = inputs.map(input =>
    generateUnified(input)
      .then(result => ({ success: true as const, result }))
      .catch(error => ({
        success: false as const,
        error: error instanceof Error ? error : new Error(String(error)),
      }))
  );

  const results = await Promise.all(promises);

  const successCount = results.filter(r => r.success).length;
  logger.info(`Batch generation complete: ${successCount}/${inputs.length} succeeded`);

  return results;
}
