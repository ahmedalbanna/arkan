import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ProjectProposalSchema, DiagramTypeSchema, SectionNameSchema, type SectionName } from '@/ai/schemas';
import { AGENTS } from '@/lib/agents';
import { generateIntroduction } from '@/ai/flows/generate-introduction';
import { generateLiteratureReview } from '@/ai/flows/generate-literature-review';
import { generateSystemAnalysis } from '@/ai/flows/generate-system-analysis';
import { generateDesignStrategy } from '@/ai/flows/generate-design-strategy';
import { generateSystemDesign } from '@/ai/flows/generate-system-design';
import { generateSystemProgramming } from '@/ai/flows/generate-system-programming';
import { generateSystemTesting } from '@/ai/flows/generate-system-testing';
import { generateConclusion } from '@/ai/flows/generate-conclusion';
import { deductUserCredits } from '@/lib/db/queries';

const generateReportSchema = z.object({
  proposal: ProjectProposalSchema,
  sectionToGenerate: SectionNameSchema,
  otherSections: z.record(SectionNameSchema, z.string()).optional(),
  otherDiagrams: z.record(DiagramTypeSchema, z.string()).optional(),
});

const sectionAgentMap: Record<SectionName, { flow: Function; agentId: string }> = {
  introduction: { flow: generateIntroduction, agentId: 'generate-introduction' },
  literatureReview: { flow: generateLiteratureReview, agentId: 'generate-literature-review' },
  systemAnalysis: { flow: generateSystemAnalysis, agentId: 'generate-system-analysis' },
  designStrategy: { flow: generateDesignStrategy, agentId: 'generate-design-strategy' },
  systemDesign: { flow: generateSystemDesign, agentId: 'generate-system-design' },
  systemProgramming: { flow: generateSystemProgramming, agentId: 'generate-system-programming' },
  systemTesting: { flow: generateSystemTesting, agentId: 'generate-system-testing' },
  conclusion: { flow: generateConclusion, agentId: 'generate-conclusion' },
};

export async function POST(request: Request) {
  try {
    // In a real app, this would come from an auth session
    const userId = 'user-1';

    const hasSufficientCredits = await deductUserCredits(userId, 1);
    if (!hasSufficientCredits) {
      return NextResponse.json({ message: 'Insufficient credits. Please top-up your account.' }, { status: 402 }); // 402 Payment Required
    }

    const body = await request.json();
    const validation = generateReportSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { proposal, sectionToGenerate, otherSections, otherDiagrams } = validation.data;

    const agentInfo = sectionAgentMap[sectionToGenerate];
    if (!agentInfo) {
      return NextResponse.json({ message: 'Unknown section requested.' }, { status: 400 });
    }

    const agent = AGENTS.find(a => a.id === agentInfo.agentId);
    if (!agent) {
      return NextResponse.json({ message: `Agent for section '${sectionToGenerate}' not configured.` }, { status: 500 });
    }

    const contextContent = [];
    if (otherSections && Object.keys(otherSections).length > 0) {
        contextContent.push('--- PREVIOUSLY GENERATED SECTIONS ---');
        for (const [sectionName, content] of Object.entries(otherSections)) {
            contextContent.push(`--- Section: ${sectionName} ---\n${content}\n---`);
        }
    }
    if (otherDiagrams && Object.keys(otherDiagrams).length > 0) {
        contextContent.push('--- PREVIOUSLY GENERATED DIAGRAMS (PlantUML) ---');
        for (const [diagramType, diagramCode] of Object.entries(otherDiagrams)) {
            contextContent.push(`--- Diagram: ${diagramType} ---\n${diagramCode}\n---`);
        }
    }
    const contextString = contextContent.join('\n\n');

    const fullPrompt = `${agent.prompt}
    
${contextString}

--- Main Input: Project Proposal ---
\`\`\`json
${JSON.stringify(proposal, null, 2)}
\`\`\`
`;

    const agentInput = {
      proposal,
      otherSections: otherSections || {},
      otherDiagrams: otherDiagrams || {},
      prompt: fullPrompt,
    };

    const result = await agentInfo.flow(agentInput);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error(`Error generating report section '${(request.json() as any)?.sectionToGenerate}':`, error);
    return NextResponse.json({ message: 'An unexpected error occurred while generating the report section.' }, { status: 500 });
  }
}
