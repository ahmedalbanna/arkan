
'use server';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { manipulateText } from '@/ai/flows/manipulate-text';
import { deductCredit } from '@/services/credit-service';
import { getAdminAuth } from '@/lib/firebase/admin';
import { ManipulateTextInputSchema } from '@/ai/schemas';
import { logGeneration } from '@/services/generation-service';

export async function POST(request: Request) {
  const auth = await getAdminAuth();
  try {
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const token = authorization.substring(7);
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const body = await request.json();
    const validation = ManipulateTextInputSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    await deductCredit(userId, 1);

    const agentInput = validation.data;
    const result = await manipulateText(agentInput);

    await logGeneration({
        agentId: 'manipulate-text',
        userId,
        input: agentInput,
        output: result,
    });
    
    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('Error manipulating text:', error);
    if (error instanceof Error) {
        if (error.message.includes("Unauthorized") || error.message.includes("token")) {
            return NextResponse.json({ message: 'Authentication failed.' }, { status: 401 });
        }
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
