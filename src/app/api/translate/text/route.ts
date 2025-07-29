'use server';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { translateText } from '@/ai/flows/translate-text';
import { deductCredit } from '@/services/credit-service';
import { getAdminAuth } from '@/lib/firebase/admin';
import { logGeneration } from '@/services/generation-service';

const translateSchema = z.object({
  text: z.string().min(1),
  targetLang: z.string().min(2),
});

export async function POST(request: Request) {
  const auth = getAdminAuth();
  try {
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const token = authorization.substring(7);
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const body = await request.json();
    const validation = translateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    await deductCredit(userId, 1);

    const agentInput = validation.data;
    const result = await translateText(agentInput);

    await logGeneration({
        agentId: 'translate-text',
        userId,
        input: agentInput,
        output: result,
    });

    const cleanedTranslatedText = result.translatedText.replace(/---.*?---/g, '');
    return NextResponse.json({ translatedText: cleanedTranslatedText }, { status: 200 });
  } catch (error) {
    console.error('Error translating text:', error);
    if (error instanceof Error) {
        if (error.message.includes("credit")) {
            return NextResponse.json({ message: error.message }, { status: 402 }); // Payment Required
        }
        if (error.message.includes("Unauthorized") || error.message.includes("token")) {
            return NextResponse.json({ message: 'Authentication failed.' }, { status: 401 });
        }
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
