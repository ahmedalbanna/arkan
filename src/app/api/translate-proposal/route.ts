
'use server';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { translateProposal } from '@/ai/flows/translate-proposal';
import { deductCredit } from '@/services/credit-service';
import { auth } from '@/lib/firebase/admin';
import { ProjectProposalSchema } from '@/ai/schemas';

const translateProposalSchema = z.object({
  proposal: ProjectProposalSchema,
  targetLang: z.string().min(2),
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
    const validation = translateProposalSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    // Deduct a larger amount for a full proposal translation
    await deductCredit(userId, 2);

    const result = await translateProposal(validation.data);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error translating proposal:', error);
    if (error instanceof Error) {
        if (error.message.includes("credit")) {
            return NextResponse.json({ message: error.message }, { status: 402 });
        }
        if (error.message.includes("Unauthorized") || error.message.includes("token")) {
            return NextResponse.json({ message: 'Authentication failed.' }, { status: 401 });
        }
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
