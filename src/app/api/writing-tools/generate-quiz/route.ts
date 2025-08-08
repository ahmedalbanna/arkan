
'use server';

import { z } from 'zod';
import { generateQuiz } from '@/ai/flows/generate-quiz';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

const generateQuizSchema = z.object({
  text: z.string().min(50, 'Text must be at least 50 characters long to generate a meaningful quiz.'),
  numQuestions: z.number().int().min(1).max(10),
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = generateQuizSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    await deductCredit(user.id, 1);
    
    const agentInput = validation.data;
    const result = await generateQuiz(agentInput);

    await logGeneration({
        agentId: 'generate-quiz',
        userId: user.id,
        input: agentInput,
        output: { questionCount: result.questions.length },
    });

    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
