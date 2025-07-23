
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
import { evaluateAndSelectContext } from '@/ai/flows/evaluate-and-select-context';
import { deductCredit } from '@/services/credit-service';
import { auth as adminAuth, adminDb } from '@/lib/firebase/admin';
import { logGeneration } from '@/services/generation-service';
import type { ReportGenerationTemplate } from '@/services/template-service';
import { getUserProfile } from '@/lib/db/queries';

const generateFullReportSchema = z.object({
    proposal: ProjectProposalSchema,
    templateId: z.string(),
    existingSections: z.record(SectionNameSchema, z.string()).optional(),
    existingDiagrams: z.record(DiagramTypeSchema, z.string()).optional(),
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
    const fullReportValidation = generateFullReportSchema.safeParse(body);

    if (!fullReportValidation.success) {
        return NextResponse.json({ errors: fullReportValidation.error.flatten().fieldErrors, message: 'Invalid request body for full report generation.' }, { status: 400 });
    }
    
    const { proposal, templateId, existingSections = {}, existingDiagrams = {} } = fullReportValidation.data;

    const templateDoc = await adminDb.collection('templates').doc('report').collection('items').doc(templateId).get();
    if (!templateDoc.exists) {
        return NextResponse.json({ message: 'Invalid report template ID.' }, { status: 400 });
    }
    const template = templateDoc.data() as ReportGenerationTemplate;

    const sectionsToGenerate = template.agentIds
        .map(agentId => (Object.keys(sectionAgentMap) as SectionName[]).find(key => sectionAgentMap[key].agentId === agentId))
        .filter((sectionKey): sectionKey is SectionName => !!sectionKey);
    
    if (sectionsToGenerate.length === 0) {
        return NextResponse.json({ sections: {}, message: "This template has no sections to generate." }, { status: 200 });
    }
    
    const userProfile = await getUserProfile(userId);
    if (!userProfile || userProfile.credits < sectionsToGenerate.length) {
        return NextResponse.json({ message: `Insufficient credits. You need ${sectionsToGenerate.length} credits but have ${userProfile?.credits || 0}.` }, { status: 402 });
    }
    
    await deductCredit(userId, sectionsToGenerate.length);

    const generatedSections: { [key in SectionName]?: string } = {};
    const contextSections: { [key in SectionName]?: string } = {};
  
    for (const sectionKey of sectionsToGenerate) {
        const agentInfo = sectionAgentMap[sectionKey];
        
        const agentInput = {
            proposal,
            otherSections: contextSections,
            otherDiagrams: existingDiagrams,
        };

        const result = await agentInfo.flow(agentInput);
        await logGeneration({ agentId: agentInfo.agentId, userId, input: agentInput, output: result });

        const content = Object.values(result)[0] as string;
        generatedSections[sectionKey] = content;
        contextSections[sectionKey] = content;
    }

    return NextResponse.json({ sections: generatedSections }, { status: 200 });

  } catch (error) {
    console.error(`Error generating full report:`, error);
    if (error instanceof Error) {
        if (error.message.includes("Unauthorized") || error.message.includes("token")) {
            return NextResponse.json({ message: 'Authentication failed.' }, { status: 401 });
        }
         if (error.message.includes("credit")) {
            return NextResponse.json({ message: error.message }, { status: 402 });
        }
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred while generating the report.' }, { status: 500 });
  }
}
