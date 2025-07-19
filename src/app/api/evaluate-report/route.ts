
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { evaluateReport } from '@/ai/flows/evaluate-report';
import { ProjectProposalSchema, DiagramTypeSchema, SectionNameSchema } from '@/ai/schemas';
import { deductCredit } from '@/services/credit-service';
import { auth } from '@/lib/firebase/admin';

const evaluateReportSchema = z.object({
  proposal: ProjectProposalSchema,
  reportSections: z.record(SectionNameSchema, z.string()),
  diagrams: z.record(DiagramTypeSchema, z.string()).optional(),
  acceptanceCriteria: z.array(z.string()),
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
    const validation = evaluateReportSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    // Call the AI flow first
    const result = await evaluateReport(validation.data);

    // Only deduct credit after a successful generation
    await deductCredit(userId, 1);
    
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error(`Error evaluating report:`, error);
    if (error instanceof Error) {
        if (error.message.includes("Unauthorized") || error.message.includes("token")) {
            return NextResponse.json({ message: 'Authentication failed.' }, { status: 401 });
        }
        if (error.message.includes("credit")) {
            return NextResponse.json({ message: error.message }, { status: 402 }); // Payment Required
        }
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred while evaluating the report.' }, { status: 500 });
  }
}
