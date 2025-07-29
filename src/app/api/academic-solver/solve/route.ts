
'use server';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminAuth } from '@/lib/firebase/admin';
import { deductCredit } from '@/services/credit-service';
import { solveAcademicDocument } from '@/ai/flows/academic-solver';
import { AnalyzedDocumentSchema } from '@/ai/flows/academic-solver.shared';
import { logGeneration } from '@/services/generation-service';

const solveSchema = z.object({
  analyzedDocument: AnalyzedDocumentSchema,
  contextMarkdown: z.string().optional(),
});

export async function POST(request: Request) {
  const adminAuth = await getAdminAuth();
  try {
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const token = authorization.substring(7);
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const body = await request.json();
    const validation = solveSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const { documentType } = validation.data.analyzedDocument;
    const creditCost = documentType === 'exam' ? 3 : 2;
    await deductCredit(userId, creditCost);
    
    const { analyzedDocument, contextMarkdown } = validation.data;
    
    const result = await solveAcademicDocument({
      analyzedDocument,
      contextMarkdown
    });

    await logGeneration({
        agentId: `solve-${documentType}`,
        userId,
        input: { analyzedDocument, contextMarkdown: !!contextMarkdown },
        output: result,
    });

    return NextResponse.json(result, { status: 200 });

  } catch (error: any) {
    console.error('Error solving academic document:', error);
    if (error.message?.includes('credit')) {
        return NextResponse.json({ message: error.message }, { status: 402 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
