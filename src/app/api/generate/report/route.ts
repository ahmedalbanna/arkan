
'use server';

import { z } from 'zod';
import { generateReportSection } from '@/ai/flows/generate-report-section';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service'; // Assuming this is server-side
import type { SectionName } from '@/ai/schemas';
import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import { GenerateSectionInputSchema } from '@/ai/schemas';

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = GenerateSectionInputSchema.safeParse(body);

    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const creditCost = 1;
    await deductCredit(user.id, creditCost);

    const agentInput = validation.data;

    // The AI flow is now called directly with all necessary data from the client.
    // No need to fetch agent or section info from Firestore here.
    const result = await generateReportSection(agentInput);

    // Safeguard: ensure the AI returned the section we requested.
    // If there's a mismatch, log a warning and normalize the returned key to the requested one.
    if (result.sectionName !== agentInput.sectionToGenerate) {
      // Log for debugging/monitoring
      console.warn(
        `Generation mismatch: requested '${agentInput.sectionToGenerate}' but generator returned '${result.sectionName}'. Normalizing output to requested key.`
      );
    }

    const transformedOutput = { [agentInput.sectionToGenerate]: result.content };

    await logGeneration({
      agentId: agentInput.agentId ?? 'unknown',
      userId: user.id,
      input: agentInput,
      output: transformedOutput,
      creditCost: creditCost,
    });

    return createApiResponse(transformedOutput, 200);

  } catch (error) {
    return handleApiError(error);
  }
});
