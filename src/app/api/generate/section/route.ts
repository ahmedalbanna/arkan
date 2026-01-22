'use server';

import { generateReportSection } from '@/ai/flows/generate-report-section';
import { GenerateSectionInputSchema } from '@/ai/schemas';
import { createApiResponse, handleApiError, withAuth } from '@/lib/utils/api-utils';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service'; // Assuming this is server-side

export const POST = withAuth(async ({ request, user }) => {
  try {
    let body = await request.json();
    let validation = GenerateSectionInputSchema.safeParse(body);

    if (!validation.success) {
      return handleApiError(validation.error);
    }

    let creditCost = 1;
    await deductCredit(user.id, creditCost);

    let agentInput = validation.data;

    // The AI flow is now called directly with all necessary data from the client.
    let result = await generateReportSection(agentInput);

    // Safeguard: ensure the AI returned the section we requested.
    // If there's a mismatch, log a warning and normalize the returned key to the requested one.
    if (result.sectionName !== agentInput.sectionToGenerate) {
      // Log for debugging/monitoring
      console.warn(
        `Generation mismatch: requested '${agentInput.sectionToGenerate}' but generator returned '${result.sectionName}'. Normalizing output to requested key.`
      );
    }

    let transformedOutput = { [agentInput.sectionToGenerate]: result.content };

    await logGeneration({
      agentId: agentInput.sectionToGenerate, // Log the section ID as the 'agent'
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
