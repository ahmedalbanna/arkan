import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateProposal } from '@/ai/flows/generate-proposal';
import { AGENTS } from '@/lib/agents';

const generateProposalSchema = z.object({
  projectIdea: z.string().min(10, { message: 'Project idea must be at least 10 characters long.' }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = generateProposalSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { projectIdea } = validation.data;

    const proposalAgent = AGENTS.find(a => a.id === 'generate-proposal');
    if (!proposalAgent) {
        return NextResponse.json({ message: 'Proposal generation agent not configured.' }, { status: 500 });
    }

    const result = await generateProposal({ 
        projectIdea,
        prompt: proposalAgent.prompt 
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error generating proposal:', error);
    return NextResponse.json({ message: 'An unexpected error occurred while generating the proposal.' }, { status: 500 });
  }
}
