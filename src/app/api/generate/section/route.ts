
'use server';

import { executeWithQueue, generateRequestId, selectModel } from '@/ai';
import { generateReportSection } from '@/ai/flows/generate-report-section';
import { GenerateSectionInputSchema } from '@/ai/schemas';
import { createApiResponse, handleApiError, withAuth } from '@/lib/utils/api-utils';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { updateProjectSectionContent } from '@/services/projectService';
import { z } from 'zod';

const SectionGenerationRequestSchema = GenerateSectionInputSchema.extend({
  projectId: z.string().min(1, 'Project ID is required.'),
});


export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = SectionGenerationRequestSchema.safeParse(body);

    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const { projectId, ...agentInput } = validation.data;
    const creditCost = 1;

    // Deduct credit first to ensure the user has enough
    await deductCredit(user.id, creditCost);

    // Select the appropriate model and execute the generation flow with a queue
    const model = selectModel({ flowName: 'generate-report-section' });
    const result = await executeWithQueue(
      generateRequestId(),
      model,
      'generate-report-section',
      () => generateReportSection(agentInput)
    );

    // Ensure the AI returned content
    const content = result?.content;

    if (!content) {
      // Note: In a real-world scenario, you might want to refund the credit here.
      throw new Error('AI generation returned empty content.');
    }

    // Save the generated content directly to the database
    await updateProjectSectionContent(user.id, projectId, agentInput.sectionToGenerate, content);

    // Log the generation event
    await logGeneration({
      agentId: agentInput.sectionToGenerate,
      userId: user.id,
      input: agentInput,
      output: { [agentInput.sectionToGenerate]: content },
      creditCost: creditCost,
    });

    // Return a success message. The client will get the update via real-time subscription.
    return createApiResponse(result, 200);

  } catch (error) {
    return handleApiError(error);
  }
});
