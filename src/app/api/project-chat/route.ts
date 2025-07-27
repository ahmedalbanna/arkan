import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminAuth } from '@/lib/firebase/admin';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { ProjectStateSchema } from '@/lib/project-state-schema';
import { projectChat } from '@/ai/flows/project-chat';
import { GenerateResponse } from 'genkit';

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
    const result: GenerateResponse = await projectChat(agentInput);

    // Convert the complex GenerateResponse object to a plain serializable object for Firestore
    const serializableResult = {
      text: result.text,
      toolRequests: result.toolRequests ?? null, // Corrected from toolRequest to toolRequests
      candidates: (result.candidates || []).map((c: any) => ({ // Added explicit 'any' type for simplicity
          index: c.index,
          finishReason: c.finishReason,
          message: {
              role: c.message.role,
              content: (c.message.content || []).map((p: any) => ({ // Added explicit 'any' type for simplicity
                  text: p.text,
                  toolRequest: p.toolRequest ?? null
              }))
          },
          // Include usage information per candidate if available and serializable
          usage: c.usage ?? null
      })),
      // Include overall usage information if available and serializable
      usage: result.usage ?? null
    };

    // Clean up undefined values recursively before logging
    const cleanSerializableResult = JSON.parse(JSON.stringify(serializableResult));

    await logGeneration({
      agentId: 'project-chat-agent',
      userId,
      input: { message: agentInput.message }, // Log only the message for brevity
      output: cleanSerializableResult,
    });

    return NextResponse.json(serializableResult, { status: 200 });

  } catch (error: any) {
    console.error('Error in project chat API:', error);
    if (error.message?.includes('credit')) {
      return NextResponse.json({ message: error.message }, { status: 402 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
