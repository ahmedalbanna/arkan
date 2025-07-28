
'use server';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { summarizeFullProject } from '@/ai/flows/summarize-project';
import { deductCredit } from '@/services/credit-service';
import { getAdminAuth } from '@/lib/firebase/admin';
import { logGeneration } from '@/services/generation-service';
import { AnyProjectProposalSchema } from '@/ai/schemas';

const summarizeSchema = z.object({
  proposal: AnyProjectProposalSchema,
  reportMarkdown: z.string(),
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
    const validation = summarizeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    await deductCredit(userId, 1);

    const agentInput = validation.data;
    const result = await summarizeFullProject(agentInput);

    await logGeneration({
        agentId: 'summarize-full-project',
        userId,
        input: { proposalTitle: agentInput.proposal.title, reportLength: agentInput.reportMarkdown.length },
        output: result,
    });
    
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error summarizing project:', error);
    if (error instanceof Error) {
        if (error.message.includes("credit")) {
            return NextResponse.json({ message: error.message }, { status: 402 });
        }
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
