

'use server';

import { z } from 'zod';
import { generateReportSection } from '@/ai/flows/generate-report-section';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { sectionConfig } from '@/lib/report-config';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';
import { GenerateSectionInputSchema } from '@/ai/schemas';

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = GenerateSectionInputSchema.safeParse(body);

    if (!validation.success) {
      return handleApiError(validation.error);
    }
    
    await deductCredit(user.id, 1);
    const agentInput = validation.data;
    
    const agentInfo = sectionConfig[agentInput.sectionToGenerate];

    if (!agentInfo) {
        return handleApiError({ message: 'Unknown section requested.' }, 400);
    }
    
    const result = await generateReportSection(agentInput);

    const transformedOutput = { [result.sectionName]: result.content };
    
    await logGeneration({ 
        agentId: agentInfo.agentId, 
        userId: user.id, 
        input: agentInput, 
        output: transformedOutput 
    });

    return createApiResponse(transformedOutput, 200);

  } catch (error) {
    return handleApiError(error);
  }
});
