'use server';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateCode } from '@/ai/flows/generate-code';
import { deductCredit } from '@/services/credit-service';
import { getAdminAuth } from '@/lib/firebase/admin';
import { logGeneration } from '@/services/generation-service';

const generateCodeSchema = z.object({
  prompt: z.string().min(10, { message: 'Prompt must be at least 10 characters long.' }),
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
    const validation = generateCodeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    await deductCredit(userId, 1);

    const agentInput = validation.data;
    const result = await generateCode(agentInput);

    await logGeneration({
        agentId: 'generate-code', // Assuming a static ID for this agent
        userId,
        input: agentInput,
        output: result,
    });

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('Error generating code:', error);
    if (error instanceof Error) {
        if (error.message.includes("Unauthorized") || error.message.includes("token")) {
            return NextResponse.json({ message: 'Authentication failed.' }, { status: 401 });
        }
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
