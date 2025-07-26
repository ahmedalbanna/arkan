
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminAuth } from '@/lib/firebase/admin';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { ProjectStateSchema } from '@/lib/project-state-schema';
import { projectChat } from '@/ai/flows/project-chat';

const chatRequestSchema = z.object({
  message: z.string(),
  projectState: ProjectStateSchema,
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
    const validation = chatRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    // Deduct credit for chat interaction
    await deductCredit(userId, 1);

    const agentInput = validation.data;
    const result = await projectChat(agentInput);

    await logGeneration({
      agentId: 'project-chat-agent',
      userId,
      input: { message: agentInput.message }, // Log only the message for brevity
      output: result,
    });

    return NextResponse.json(result, { status: 200 });

  } catch (error: any) {
    console.error('Error in project chat API:', error);
    if (error.message?.includes('credit')) {
      return NextResponse.json({ message: error.message }, { status: 402 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
