
'use server';

import { createLectureUnit } from '@/ai/flows/create-lecture-unit';
import { CreateLectureUnitInputSchema } from '@/ai/schemas/lecture-generator';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';

export const POST = withEnhancedAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = CreateLectureUnitInputSchema.safeParse(body);
    if (!validation.success) {
      return handleApiErrorEnhanced(validation.error);
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

    return createApiResponseEnhanced(result, 200);
  } catch (error) {
    return handleApiErrorEnhanced(error);
  }
});
