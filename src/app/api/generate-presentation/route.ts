
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generatePresentation, GeneratePresentationInputSchema } from '@/ai/flows/generate-presentation';
import { AGENTS } from '@/lib/agents';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = GeneratePresentationInputSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const presentationAgent = AGENTS.find(a => a.id === 'generate-presentation');
    if (!presentationAgent) {
      return NextResponse.json({ message: 'Presentation generation agent not configured.' }, { status: 500 });
    }

    const { proposal, sections, diagrams } = validation.data;
    const result = await generatePresentation({
      proposal,
      sections,
      diagrams,
      prompt: typeof presentationAgent.prompt === 'string' ? presentationAgent.prompt : presentationAgent.prompt.base
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error generating presentation:', error);
    return NextResponse.json({ message: 'An unexpected error occurred while generating the presentation.' }, { status: 500 });
  }
}
