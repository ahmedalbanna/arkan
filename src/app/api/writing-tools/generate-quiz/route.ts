
'use server';

import { z } from 'zod';
import { generateQuiz } from '@/ai/flows/generate-quiz';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

const generateQuizSchema = z.object({
  text: z.string().min(50, 'Text must be at least 50 characters long to generate a meaningful quiz.'),
  numQuestions: z.number().int().min(1).max(20),
  questionType: z.enum(['multiple-choice', 'true-false', 'direct-question']),

});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = generateQuizSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const agentInput = validation.data;
    const result = await generateQuiz(agentInput);

    const creditCost = 1;
    await deductCredit(user.id, creditCost);

    await logGeneration({
        agentId: 'generate-quiz',
        userId: user.id,
        input: agentInput,
        output: { questionCount: result.questions.length },
        creditCost: creditCost,
    });

    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
