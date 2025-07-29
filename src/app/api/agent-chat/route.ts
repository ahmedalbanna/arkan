
'use server';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminAuth } from '@/lib/firebase/admin';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { agentChat } from '@/ai/flows/agent-chat';

const chatSchema = z.object({
  agentId: z.string(),
  message: z.string(),
});

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
    const validation = chatSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    // Deduct credit for each message to the agent
    await deductCredit(userId, 1);

    const agentInput = validation.data;
    const result = await agentChat(agentInput);

    await logGeneration({
      agentId: validation.data.agentId,
      userId,
      input: { message: validation.data.message },
      output: result,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('Error in agent chat API:', error);
    if (error.message?.includes('credit')) {
      return NextResponse.json({ message: error.message }, { status: 402 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
