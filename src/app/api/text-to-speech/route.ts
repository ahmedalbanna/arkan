
'use server';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminAuth } from '@/lib/firebase/admin';
import { deductCredit } from '@/services/credit-service';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { logGeneration } from '@/services/generation-service';

const ttsSchema = z.object({
  text: z.string().min(1, 'Text content is required.'),
});

export async function POST(request: Request) {
  const adminAuth = await getAdminAuth();
  try {
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const token = authorization.substring(7);
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const body = await request.json();
    const validation = ttsSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    await deductCredit(userId, 1);
    
    const result = await textToSpeech(validation.data.text);

    await logGeneration({
        agentId: 'text-to-speech',
        userId,
        input: { textLength: validation.data.text.length },
        output: { audioGenerated: true },
    });

    return NextResponse.json(result, { status: 200 });

  } catch (error: any) {
    console.error('Error generating speech:', error);
    if (error.message?.includes('credit')) {
        return NextResponse.json({ message: error.message }, { status: 402 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
