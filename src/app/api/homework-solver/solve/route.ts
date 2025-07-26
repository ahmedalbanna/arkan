
'use server';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminAuth } from '@/lib/firebase/admin';
import { deductCredit } from '@/services/credit-service';
import { solveHomework } from '@/ai/flows/homework-solver';
import { AnalyzedHomeworkSchema } from '@/ai/flows/homework-solver.shared';
import { logGeneration } from '@/services/generation-service';

const solveSchema = z.object({
  analyzedHomework: AnalyzedHomeworkSchema,
  curriculumContext: z.string().min(1, "Curriculum context cannot be empty."),
  targetLang: z.string().optional(),
});

export async function POST(request: Request) {
  const adminAuth = getAdminAuth();
  try {
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const token = authorization.substring(7);
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const body = await request.json();
    const validation = solveSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    await deductCredit(userId, 2);

    const agentInput = {
        analyzedHomework: validation.data.analyzedHomework,
        curriculumContext: validation.data.curriculumContext,
        targetLang: validation.data.targetLang || 'English',
    };
    const result = await solveHomework(agentInput);

    await logGeneration({
        agentId: 'solve-homework',
        userId,
        input: agentInput,
        output: result,
    });

    return NextResponse.json(result, { status: 200 });

  } catch (error: any) {
    console.error('Error solving homework:', error);
    if (error.message?.includes('credit')) {
        return NextResponse.json({ message: error.message }, { status: 402 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
