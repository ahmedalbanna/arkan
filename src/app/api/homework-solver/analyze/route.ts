
'use server';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminAuth } from '@/lib/firebase/admin';
import { deductCredit } from '@/services/credit-service';
import { analyzeHomework } from '@/ai/flows/homework-solver';
import { logGeneration } from '@/services/generation-service';

const analyzeSchema = z.object({
  homeworkImageUris: z.array(z.string().url("A valid homework image data URI is required.")).min(1, "At least one homework image is required."),
  curriculumContext: z.string().min(1, "Curriculum context is required for analysis."),
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
    const validation = analyzeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    await deductCredit(userId, 1);

    const agentInput = { 
        homeworkImageUris: validation.data.homeworkImageUris,
        curriculumContext: validation.data.curriculumContext,
     };
    const result = await analyzeHomework(agentInput);

    await logGeneration({
        agentId: 'analyze-homework',
        userId,
        input: agentInput,
        output: result,
    });

    return NextResponse.json(result, { status: 200 });

  } catch (error: any) {
    console.error('Error analyzing homework:', error);
    if (error.message?.includes('credit')) {
        return NextResponse.json({ message: error.message }, { status: 402 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
