
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ProjectProposalSchema, DiagramTypeSchema, SectionNameSchema, type SectionName } from '@/ai/schemas';
import { getAgent } from '@/lib/db/queries';
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

// Schema for generating a single section
const generateSectionSchema = z.object({
  proposal: ProjectProposalSchema,
  sectionToGenerate: SectionNameSchema,
  otherSections: z.record(SectionNameSchema, z.string()).optional(),
  otherDiagrams: z.record(DiagramTypeSchema, z.string()).optional(),
  guidelines: z.array(z.string()).optional(),
  instructionText: z.string().optional(),
  externalContextContent: z.string().optional(),
});

// Schema for generating a full report based on a template
const generateFullReportSchema = z.object({
    proposal: ProjectProposalSchema,
    templateId: z.string(),
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

    // Check if it's a full report generation request
    const fullReportValidation = generateFullReportSchema.safeParse(body);
    if (fullReportValidation.success) {
        const { proposal, templateId } = fullReportValidation.data;

        const templateDoc = await adminDb.collection('templates').doc('report').collection('items').doc(templateId).get();
        if (!templateDoc.exists) {
             return NextResponse.json({ message: 'Invalid report template ID.' }, { status: 400 });
        }
        const template = templateDoc.data() as ReportGenerationTemplate;

        // Determine which sections to generate based on the template
        const sectionsToGenerate = template.agentIds
            .map(agentId => (Object.keys(sectionAgentMap) as SectionName[]).find(key => sectionAgentMap[key].agentId === agentId))
            .filter((sectionKey): sectionKey is SectionName => !!sectionKey);
        
        if (sectionsToGenerate.length === 0) {
            return NextResponse.json({ sections: {}, message: "This template has no sections to generate." }, { status: 200 });
        }
        
        // Check user credits before proceeding
        const userProfile = await getUserProfile(userId);
        if (!userProfile || userProfile.credits < sectionsToGenerate.length) {
            return NextResponse.json({ message: `Insufficient credits. You need ${sectionsToGenerate.length} credits but have ${userProfile?.credits || 0}.` }, { status: 402 });
        }
        
        // Call the evaluation agent to get the optimal configuration
        const evalInput = { proposal, existingSections: {}, sectionsToGenerate, existingDiagrams: {} };
        const evalResult = await evaluateAndSelectContext(evalInput);
        
        // Deduct credits for all sections at once
        await deductCredit(userId, sectionsToGenerate.length);

        const generationPromises = evalResult.configs.map(async (config) => {
            const agentInfo = sectionAgentMap[config.section];
            const instructionText = `- The writing style should be ${config.instructions.formality}.\n- Adopt a ${config.instructions.tone} tone.`;
            
            const agentInput = {
                proposal,
                otherSections: config.context.sections?.reduce((acc, key) => ({ ...acc, [key]: (body.sections || {})[key] }), {}),
                otherDiagrams: config.context.diagrams?.reduce((acc, key) => ({ ...acc, [key]: (body.diagrams || {})[key] }), {}),
                guidelines: config.guidelines,
                instructionText,
            };

            const result = await agentInfo.flow(agentInput);
            await logGeneration({ agentId: agentInfo.agentId, userId, input: agentInput, output: result });
            
            const content = Object.values(result)[0] as string;
            return { section: config.section, content };
        });

        const results = await Promise.all(generationPromises);

        const generatedSections = results.reduce((acc, result) => {
            acc[result.section] = result.content;
            return acc;
        }, {} as { [key in SectionName]?: string });

        return NextResponse.json({ sections: generatedSections }, { status: 200 });
    }

    // Check if it's a single section generation request
    const singleSectionValidation = generateSectionSchema.safeParse(body);
    if (singleSectionValidation.success) {
        await deductCredit(userId, 1);
        const agentInput = singleSectionValidation.data;
        const agentInfo = sectionAgentMap[agentInput.sectionToGenerate];

        if (!agentInfo) {
            return NextResponse.json({ message: 'Unknown section requested.' }, { status: 400 });
        }
        
        const result = await agentInfo.flow(agentInput);
        await logGeneration({ agentId: agentInfo.agentId, userId, input: agentInput, output: result });
  
        return NextResponse.json(result, { status: 200 });
    }

    // If neither validation passes, return a validation error
    return NextResponse.json({ errors: fullReportValidation.error?.flatten().fieldErrors || singleSectionValidation.error?.flatten().fieldErrors, message: 'Invalid request body.' }, { status: 400 });

  } catch (error) {
    console.error(`Error generating report:`, error);
    if (error instanceof Error) {
        if (error.message.includes("Unauthorized") || error.message.includes("token")) {
            return NextResponse.json({ message: 'Authentication failed.' }, { status: 401 });
        }
         if (error.message.includes("credit")) {
            return NextResponse.json({ message: error.message }, { status: 402 }); // Payment Required
        }
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred while generating the report.' }, { status: 500 });
  }
}
