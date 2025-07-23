
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ProjectProposalSchema, DiagramTypeSchema, SectionNameSchema, type SectionName } from '@/ai/schemas';
import { generateIntroduction } from '@/ai/flows/generate-introduction';
import { generateLiteratureReview } from '@/ai/flows/generate-literature-review';
import { generateSystemAnalysis } from '@/ai/flows/generate-system-analysis';
import { generateDesignStrategy } from '@/ai/flows/generate-design-strategy';
import { generateSystemDesign } from '@/ai/flows/generate-system-design';
import { generateSystemProgramming } from '@/ai/flows/generate-system-programming';
import { generateSystemTesting } from '@/ai/flows/generate-system-testing';
import { generateConclusion } from '@/ai/flows/generate-conclusion';
import { deductCredit } from '@/services/credit-service';
import { auth as adminAuth } from '@/lib/firebase/admin';
import { logGeneration } from '@/services/generation-service';

// This endpoint now only handles generating a single section.
// The full report generation logic has been moved to /api/generate-full-report
const generateSectionSchema = z.object({
  proposal: ProjectProposalSchema,
  sectionToGenerate: SectionNameSchema,
  otherSections: z.record(SectionNameSchema, z.string()).optional(),
  otherDiagrams: z.record(DiagramTypeSchema, z.string()).optional(),
  guidelines: z.array(z.string()).optional(),
  instructionText: z.string().optional(),
  externalContextContent: z.string().optional(),
});

const sectionAgentMap: Record<SectionName, { flow: Function; agentId: string }> = {
  introduction: { flow: generateIntroduction, agentId: 'generate-introduction-section' },
  literatureReview: { flow: generateLiteratureReview, agentId: 'generate-literature-review-section' },
  systemAnalysis: { flow: generateSystemAnalysis, agentId: 'generate-system-analysis-section' },
  designStrategy: { flow: generateDesignStrategy, agentId: 'generate-design-strategy-section' },
  systemDesign: { flow: generateSystemDesign, agentId: 'generate-system-design-section' },
  systemProgramming: { flow: generateSystemProgramming, agentId: 'generate-system-programming-section' },
  systemTesting: { flow: generateSystemTesting, agentId: 'generate-system-testing-section' },
  conclusion: { flow: generateConclusion, agentId: 'generate-conclusion-section' },
};


export async function POST(request: Request) {
  try {
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const token = authorization.substring(7);
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;
    
    const body = await request.json();

    const singleSectionValidation = generateSectionSchema.safeParse(body);
    if (!singleSectionValidation.success) {
      return NextResponse.json({ errors: singleSectionValidation.error.flatten().fieldErrors, message: 'Invalid request body for single section generation.' }, { status: 400 });
    }
    
    await deductCredit(userId, 1);
    const agentInput = singleSectionValidation.data;
    const agentInfo = sectionAgentMap[agentInput.sectionToGenerate];

    if (!agentInfo) {
        return NextResponse.json({ message: 'Unknown section requested.' }, { status: 400 });
    }
    
    const result = await agentInfo.flow(agentInput);
    await logGeneration({ agentId: agentInfo.agentId, userId, input: agentInput, output: result });

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error(`Error generating report section:`, error);
    if (error instanceof Error) {
        if (error.message.includes("Unauthorized") || error.message.includes("token")) {
            return NextResponse.json({ message: 'Authentication failed.' }, { status: 401 });
        }
         if (error.message.includes("credit")) {
            return NextResponse.json({ message: error.message }, { status: 402 }); // Payment Required
        }
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred while generating the report section.' }, { status: 500 });
  }
}
