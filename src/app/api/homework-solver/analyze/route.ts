
'use server';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth as adminAuth } from '@/lib/firebase/admin';
import { deductCredit } from '@/services/credit-service';
import { analyzeHomework } from '@/ai/flows/homework-solver';

const analyzeSchema = z.object({
  homeworkImageUris: z.array(z.string().url("A valid homework image data URI is required.")).min(1, "At least one homework image is required."),
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
    const validation = analyzeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    // This is now a simpler task, so credit cost is 1.
    await deductCredit(decodedToken.uid, 1);

    const result = await analyzeHomework({ 
        homeworkImageUris: validation.data.homeworkImageUris,
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
