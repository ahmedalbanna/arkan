
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateProposal } from '@/ai/flows/generate-proposal';
import { translateProposal } from '@/ai/flows/translate-proposal';
import { deductCredit } from '@/services/credit-service';
import { auth, adminDb } from '@/lib/firebase/admin';
import { logGeneration } from '@/services/generation-service';
import type { ProposalTemplate } from '@/services/template-service';

const generateProposalSchema = z.object({
  projectIdea: z.string().min(10, { message: 'Project idea must be at least 10 characters long.' }),
  templateId: z.string(),
  customGuidelines: z.array(z.string()).optional(),
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

    await deductCredit(userId, 1);

    const { projectIdea, templateId, customGuidelines } = validation.data;

    const templateDoc = await adminDb.collection('templates').doc('proposal').collection('items').doc(templateId).get();
    if (!templateDoc.exists) {
      return NextResponse.json({ message: 'Proposal template not found.' }, { status: 400 });
    }
    const template = templateDoc.data() as ProposalTemplate;

    const finalGuidelines = [...(template.guidelines || []), ...(customGuidelines || [])];
    
    let finalPrompt = template.prompt;
    if (finalGuidelines.length > 0) {
        finalPrompt += '\n\nAdditionally, please adhere to the following guidelines:\n' + finalGuidelines.map(g => `- ${g}`).join('\n');
    }

    const agentInput = {
      projectIdea,
      prompt: finalPrompt,
    };

    let result = await generateProposal(agentInput);

    await logGeneration({
        agentId: 'generate-proposal-report', // Agent ID for logging
        userId,
        input: { projectIdea, templateId, customGuidelines }, // Log the user-facing input
        output: result,
    });
    
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error generating proposal:', error);
    if (error instanceof Error) {
        if (error.message.includes("Unauthorized") || error.message.includes("token")) {
            return NextResponse.json({ message: 'Authentication failed.' }, { status: 401 });
        }
         if (error.message.includes("credit")) {
            return NextResponse.json({ message: error.message }, { status: 402 });
        }
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred while generating the proposal.' }, { status: 500 });
  }
}
