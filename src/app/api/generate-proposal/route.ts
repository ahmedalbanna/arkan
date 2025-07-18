
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateProposal } from '@/ai/flows/generate-proposal';
import { AGENTS } from '@/lib/agents';
import { deductCredit } from '@/services/credit-service';
import { auth } from '@/lib/firebase/admin';

const generateProposalSchema = z.object({
  projectIdea: z.string().min(10, { message: 'Project idea must be at least 10 characters long.' }),
  prompt: z.string().optional(), // Prompt is now optional, but will be sent by the hook
});

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
        return NextResponse.json({ message: 'Unauthorized: Missing or invalid token.' }, { status: 401 });
    }
    const token = authorization.substring(7);
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;
    
    const body = await request.json();
    const validation = generateProposalSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    // This service function checks for sufficient credits and throws an error if not found.
    await deductCredit(userId, 1);

    const { projectIdea, prompt } = validation.data;

    const proposalAgent = AGENTS.find(a => a.id === 'generate-proposal-report');
    if (!proposalAgent) {
      return NextResponse.json({ message: 'Proposal generation agent not configured.' }, { status: 500 });
    }

    // Use the prompt from the request if provided, otherwise fall back to the agent's default.
    const finalPrompt = prompt || (typeof proposalAgent.prompt === 'string' ? proposalAgent.prompt : proposalAgent.prompt.base);

    const result = await generateProposal({
      projectIdea,
      prompt: finalPrompt,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error generating proposal:', error);
    if (error instanceof Error) {
        if (error.message.includes("Unauthorized") || error.message.includes("token")) {
            return NextResponse.json({ message: 'Authentication failed.' }, { status: 401 });
        }
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred while generating the proposal.' }, { status: 500 });
  }
}
