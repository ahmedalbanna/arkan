'use server';

import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { createLectureUnit } from '@/ai/flows/create-lecture-unit';
import { CreateLectureUnitInputSchema } from '@/ai/schemas/lecture-generator';

export const POST = withAuth(async ({ request, user }) => {
  try {
    let body = await request.json();
    let validation = CreateLectureUnitInputSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    let agentInput = validation.data;
    let result = await createLectureUnit(agentInput);

    // Define a credit cost for this complex generation
    let creditCost = 5;
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
