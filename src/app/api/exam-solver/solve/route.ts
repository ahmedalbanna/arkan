'use server';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth as adminAuth } from '@/lib/firebase/admin';
import { deductCredit } from '@/services/credit-service';
import { solveExam } from '@/ai/flows/exam-solver';
import { AnalyzedExamSchema } from '@/ai/flows/exam-solver.shared';

const solveSchema = z.object({
  analyzedExam: AnalyzedExamSchema,
});

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const token = authorization.substring(7);
    const decodedToken = await adminAuth.verifyIdToken(token);

    const body = await request.json();
    const validation = solveSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    // Deduct a higher amount for solving
    await deductCredit(decodedToken.uid, 3);

    const result = await solveExam(validation.data.analyzedExam);

    return NextResponse.json(result, { status: 200 });

  } catch (error: any) {
    console.error('Error solving exam:', error);
    if (error.message?.includes('credit')) {
        return NextResponse.json({ message: error.message }, { status: 402 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
