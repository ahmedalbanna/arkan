
'use server';

import { projectConsultantFlow } from '@/ai/flows/project-consultant';
import { createApiResponse, handleApiError, withAuth } from '@/lib/utils/api-utils';

export const POST = withAuth(async ({ request }) => {
  try {
    const body = await request.json();
    
    // Zod validation could be added here if schemas are exported from the flow file
    const result = await projectConsultantFlow(body);

    // Note: Credit deduction for chat can be added here if desired.
    // For example: await deductCredit(user.id, 0.1); 

    return createApiResponse(result, 200);

  } catch (error) {
    return handleApiError(error);
  }
});
