
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminAuth } from '@/lib/firebase/admin';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { ProjectProposalSchema } from '@/ai/schemas';
import { generateProjectPlan } from '@/ai/flows/generate-project-plan';

const planSchema = z.object({
  proposal: ProjectProposalSchema,
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
    const validation = planSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    // This is a more complex task, so we deduct 2 credits.
    await deductCredit(userId, 2);
    
    const agentInput = { proposal: validation.data.proposal };
    const result = await generateProjectPlan(agentInput);

    await logGeneration({
        agentId: `generate-project-plan`,
        userId,
        input: { proposalTitle: validation.data.proposal.title }, // Log minimal input
        output: { phaseCount: result.phases.length }, // Log minimal output
    });

    return NextResponse.json(result, { status: 200 });

  } catch (error: any) {
    console.error(`Error generating project plan:`, error);
    if (error.message?.includes('credit')) {
        return NextResponse.json({ message: error.message }, { status: 402 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
