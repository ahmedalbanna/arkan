
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ProjectProposalSchema, DiagramTypeSchema, SectionNameSchema, type SectionName } from '@/ai/schemas';
import { AGENTS, type AgentPrompt } from '@/lib/agents';
import { generateIntroduction } from '@/ai/flows/generate-introduction';
import { generateLiteratureReview } from '@/ai/flows/generate-literature-review';
import { generateSystemAnalysis } from '@/ai/flows/generate-system-analysis';
import { generateDesignStrategy } from '@/ai/flows/generate-design-strategy';
import { generateSystemDesign } from '@/ai/flows/generate-system-design';
import { generateSystemProgramming } from '@/ai/flows/generate-system-programming';
import { generateSystemTesting } from '@/ai/flows/generate-system-testing';
import { generateConclusion } from '@/ai/flows/generate-conclusion';
import { deductCredit } from '@/services/credit-service';
import { auth as adminAuth, adminDb } from '@/lib/firebase/admin';
import { logGeneration } from '@/services/generation-service';

const generateReportSchema = z.object({
  proposal: ProjectProposalSchema,
  sectionToGenerate: SectionNameSchema,
  otherSections: z.record(SectionNameSchema, z.string()).optional(),
  otherDiagrams: z.record(DiagramTypeSchema, z.string()).optional(),
  guidelines: z.array(z.string()).optional(),
  instructionText: z.string().optional(),
  externalContextContent: z.string().optional(),
});

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

    // Handle full report generation
    const fullReportValidation = generateFullReportSchema.safeParse(body);
    if (fullReportValidation.success) {
        const { proposal, templateId } = fullReportValidation.data;

        const templateDoc = await adminDb.collection('templates').doc('report').collection('items').doc(templateId).get();
        if (!templateDoc.exists) {
             return NextResponse.json({ message: 'Invalid report template ID.' }, { status: 400 });
        }
        const template = templateDoc.data() as any;

        await deductCredit(userId, template.agentIds.length);

        const generatedSections: { [key in SectionName]?: string } = {};
      
        for (const agentId of template.agentIds) {
            const agent = AGENTS.find(a => a.id === agentId);
            const sectionKey = Object.keys(sectionConfig).find(key => sectionConfig[key as SectionName].agentId === agentId) as SectionName | undefined;
    
            if (!agent || !sectionKey) continue;
            
            const agentInfo = sectionAgentMap[sectionKey];
            if (!agentInfo) continue;

             const agentInput = {
                proposal,
                otherSections: generatedSections, // Pass already generated sections as context
                agent: {
                    base: (agent.prompt as AgentPrompt).base,
                    guidelines: (agent.prompt as AgentPrompt).guidelines?.map(g => g.text),
                }
            };

            const result = await agentInfo.flow(agentInput);
            await logGeneration({ agentId, userId, input: agentInput, output: result });
    
            const content = Object.values(result)[0] as string;
            generatedSections[sectionKey] = content;
        }
        return NextResponse.json({ sections: generatedSections }, { status: 200 });
    }

    // Handle single section generation
    const singleSectionValidation = generateReportSchema.safeParse(body);
    if (singleSectionValidation.success) {
        await deductCredit(userId, 1);
        const { proposal, sectionToGenerate, otherSections, otherDiagrams, guidelines, instructionText, externalContextContent } = singleSectionValidation.data;

        const agentInfo = sectionAgentMap[sectionToGenerate];
        if (!agentInfo) {
            return NextResponse.json({ message: 'Unknown section requested.' }, { status: 400 });
        }
        const agent = AGENTS.find(a => a.id === agentInfo.agentId);
        if (!agent) {
             return NextResponse.json({ message: `Agent for section '${sectionToGenerate}' not configured.` }, { status: 500 });
        }
        
        const agentInput = {
          proposal,
          otherSections: otherSections || {},
          otherDiagrams: otherDiagrams || {},
          agent: {
              base: (agent.prompt as AgentPrompt).base,
              guidelines: guidelines || [],
          },
          instructionText,
          externalContextContent,
        };
  
        const result = await agentInfo.flow(agentInput);
        await logGeneration({ agentId: agent.id, userId, input: agentInput, output: result });
  
        return NextResponse.json(result, { status: 200 });
    }

    // If neither validation passes
    const errors = singleSectionValidation.error.flatten().fieldErrors;
    return NextResponse.json({ errors, message: 'Invalid request body.' }, { status: 400 });

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
