'use server';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { translatePresentation } from '@/ai/flows/translate-presentation';
import { deductCredit } from '@/services/credit-service';
import { getAdminAuth } from '@/lib/firebase/admin';
import { PresentationHistoryEntrySchema } from '@/ai/schemas';
import { logGeneration } from '@/services/generation-service';

const translatePresentationSchema = z.object({
  presentation: PresentationHistoryEntrySchema,
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
    const validation = translatePresentationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    await deductCredit(userId, 2);

    const agentInput = validation.data;
    const result = await translatePresentation(agentInput);

    await logGeneration({
        agentId: 'translate-presentation',
        userId,
        input: { ...agentInput, presentation: `Presentation ID: ${agentInput.presentation.id}` }, // Don't log full object
        output: { ...result, presentation: `Presentation ID: ${result.id}` },
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error translating presentation:', error);
    if (error instanceof Error) {
        if (error.message.includes("credit")) {
            return NextResponse.json({ message: error.message }, { status: 402 });
        }
        if (error.message.includes("Unauthorized") || error.message.includes("token")) {
            return NextResponse.json({ message: 'Authentication failed.' }, { status: 401 });
        }
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
