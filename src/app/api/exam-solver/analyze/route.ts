
'use server';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminAuth } from '@/lib/firebase/admin';
import { deductCredit } from '@/services/credit-service';
import { analyzeExam } from '@/ai/flows/exam-solver';
import { logGeneration } from '@/services/generation-service';

const analyzeSchema = z.object({
  markdown: z.string().min(20, 'Markdown content is too short.'),
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
    
    const agentInput = { markdownContent: validation.data.markdown };
    const result = await analyzeExam(agentInput);

    await logGeneration({
        agentId: 'analyze-exam',
        userId,
        input: agentInput,
        output: result,
    });

    return NextResponse.json(result, { status: 200 });

  } catch (error: any) {
    console.error('Error analyzing exam:', error);
    if (error.message?.includes('credit')) {
        return NextResponse.json({ message: error.message }, { status: 402 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
