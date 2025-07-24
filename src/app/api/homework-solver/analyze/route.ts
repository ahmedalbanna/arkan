
'use server';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth as adminAuth } from '@/lib/firebase/admin';
import { deductCredit } from '@/services/credit-service';
import { analyzeHomework } from '@/ai/flows/homework-solver';

const analyzeSchema = z.object({
  homeworkImageUri: z.string().url("A valid homework image data URI is required."),
  curriculumPdfUri: z.string().url("A valid curriculum PDF data URI is required."),
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

    // Analysis is now a more complex task involving two documents
    await deductCredit(decodedToken.uid, 2);

    const result = await analyzeHomework({ 
        homeworkImageUri: validation.data.homeworkImageUri,
        curriculumPdfUri: validation.data.curriculumPdfUri,
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
