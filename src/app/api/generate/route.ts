'use server';

/**
 * Unified Generate API Route
 * Single endpoint for all text generation tasks
 * 
 * POST /api/generate
 * 
 * Supports:
 * - Section generation
 * - Grammar correction
 * - Translation
 * - Summarization
 * - Rewriting
 * - Custom generation
 */

import { generateUnified } from '@/ai/flows/generate-unified';
import { UnifiedGenerationInputSchema } from '@/ai/schemas/unified-generation';
import { createApiResponse, handleApiError, withAuth } from '@/lib/utils/api-utils';
import { deductCredit, refundCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { incrementRateLimit } from '@/lib/utils/rate-limiter';
import { logger } from '@/lib/utils/logger';

/**
 * POST /api/generate
 * Unified generation endpoint for all text generation tasks
 */
export const POST = withAuth(async ({ request, user }) => {
  const creditCost = 1;
  let creditsDeducted = false;

  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = UnifiedGenerationInputSchema.safeParse(body);

    if (!validation.success) {
      logger.error(`Validation error for user ${user.id}: ${validation.error.message}`);
      return handleApiError(validation.error);
    }

    const input = validation.data;

    // Check rate limit before processing
    try {
      incrementRateLimit(user.id, user.role);
    } catch (rateLimitError) {
      logger.warn(`Rate limit exceeded for user ${user.id}`);
      return handleApiError(rateLimitError);
    }

    // Deduct credits before generation
    await deductCredit(user.id, creditCost);
    creditsDeducted = true;

    logger.info(
      `Starting ${input.processType} generation for user ${user.id}, ` +
      `process: ${input.processId}`
    );

    // Generate with unified AI flow (includes retry logic)
    const result = await generateUnified(input);

    // Log successful generation
    await logGeneration({
      agentId: `${input.processType}-${input.processId}`,
      userId: user.id,
      input: input,
      output: result,
      creditCost: creditCost,
    });

    logger.info(
      `✓ ${input.processType} generation completed for user ${user.id} ` +
      `(${result.content.length} chars in ${result.metadata.processingTimeMs}ms)`
    );

    return createApiResponse(result, 200);

  } catch (error) {
    // Refund credits if generation failed after deduction
    if (creditsDeducted) {
      try {
        await refundCredit(user.id, creditCost);
        logger.info(`Credits refunded to user ${user.id} after generation failure`);
      } catch (refundError) {
        logger.error(`Failed to refund credits to user ${user.id}: ${refundError}`);
        // Continue to throw original error
      }
    }

    logger.error(`Generation failed for user ${user.id}: ${error}`);
    return handleApiError(error);
  }
});
