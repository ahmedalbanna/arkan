
'use server';

import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { createLectureUnit } from '@/ai/flows/create-lecture-unit';
import { CreateLectureUnitInputSchema } from '@/ai/schemas/lecture-generator';

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = CreateLectureUnitInputSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const agentInput = validation.data;
    const result = await createLectureUnit(agentInput);

    // Define a credit cost for this complex generation
    const creditCost = 5;
    await deductCredit(user.id, creditCost);

    await logGeneration({
        agentId: 'create-lecture-unit',
        userId: user.id,
        input: agentInput,
        output: {
            lectureChars: result.theoreticalLecture.lectureContent.length,
            sessionActivities: result.practicalSession.activities.length,
        },
        creditCost: creditCost,
    });

    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
