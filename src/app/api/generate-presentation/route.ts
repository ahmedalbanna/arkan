
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generatePresentation } from '@/ai/flows/generate-presentation';
import { AGENTS } from '@/lib/agents';
import { ProjectProposalSchema, DiagramTypeSchema, SectionNameSchema } from '@/ai/schemas';
import type { AgentPrompt } from '@/lib/agents';
import { deductCredit } from '@/services/credit-service';
import { auth, adminDb } from '@/lib/firebase/admin';
import { logGeneration } from '@/services/generation-service';

const ApiGeneratePresentationSchema = z.object({
  proposal: ProjectProposalSchema,
  sections: z.record(SectionNameSchema, z.string()).optional(),
  diagrams: z.record(DiagramTypeSchema, z.string()).optional(),
  guidelines: z.array(z.string()).optional(),
  externalContextContent: z.string().optional(),
  templateId: z.string(),
});


export async function POST(request: Request) {
  try {
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const token = authorization.substring(7);
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;
    
    const body = await request.json();
    const validation = ApiGeneratePresentationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    await deductCredit(userId, 1);

    const { proposal, sections, diagrams, guidelines, externalContextContent, templateId } = validation.data;

    const templateDoc = await adminDb.collection('templates').doc('presentation').collection('items').doc(templateId).get();
    if (!templateDoc.exists) {
        return NextResponse.json({ message: 'Presentation template not found.' }, { status: 404 });
    }
    const templateData = templateDoc.data();
    const presentationAgent = AGENTS.find(a => a.id === templateData?.primaryAgentId);

    if (!presentationAgent || typeof presentationAgent.prompt !== 'object' || !('base' in (presentationAgent.prompt as AgentPrompt))) {
      return NextResponse.json({ message: 'Presentation generation agent not configured properly.' }, { status: 500 });
    }

    const agentPrompt = presentationAgent.prompt as AgentPrompt;
    
    const agentInput = {
      proposal,
      sections,
      diagrams,
      externalContextContent,
      agent: {
        base: agentPrompt.base,
        guidelines: guidelines || [],
      },
    };

    const result = await generatePresentation(agentInput);
    
    await logGeneration({
        agentId: presentationAgent.id,
        userId,
        input: agentInput,
        output: result,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error generating presentation:', error);
    if (error instanceof Error) {
        if (error.message.includes("Unauthorized") || error.message.includes("token")) {
            return NextResponse.json({ message: 'Authentication failed.' }, { status: 401 });
        }
        if (error.message.includes("credit")) {
            return NextResponse.json({ message: error.message }, { status: 402 });
        }
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred while generating the presentation.' }, { status: 500 });
  }
}
