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

const generateReportSchema = z.object({
  proposal: ProjectProposalSchema,
  sectionToGenerate: SectionNameSchema,
  otherSections: z.record(SectionNameSchema, z.string()).optional(),
  otherDiagrams: z.record(DiagramTypeSchema, z.string()).optional(),
  // Client now sends selected guidelines and control settings instead of a full prompt
  guidelines: z.array(z.string()).optional(),
  instructionText: z.string().optional(),
  externalContextContent: z.string().optional(),
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
    const body = await request.json();
    const validation = generateReportSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { proposal, sectionToGenerate, otherSections, otherDiagrams, guidelines, instructionText, externalContextContent } = validation.data;

    const agentInfo = sectionAgentMap[sectionToGenerate];
    if (!agentInfo) {
      return NextResponse.json({ message: 'Unknown section requested.' }, { status: 400 });
    }

    const agent = AGENTS.find(a => a.id === agentInfo.agentId);
    if (!agent) {
      return NextResponse.json({ message: `Agent for section '${sectionToGenerate}' not configured.` }, { status: 500 });
    }
    
    // --- Server-side prompt construction ---
    let fullPrompt = '';
    const agentPrompt = agent.prompt as AgentPrompt;
    if (typeof agentPrompt === 'string') {
        fullPrompt = agentPrompt;
    } else {
        fullPrompt = agentPrompt.base;
        if (guidelines && guidelines.length > 0) {
            fullPrompt += '\n\n' + guidelines.map(g => `- ${g}`).join('\n');
        }
    }
    
    if (instructionText) {
        fullPrompt += `\n\nAdditionally, please adhere to the following constraints for your response:\n${instructionText}`;
    }

    const contextContent = [];
    if (externalContextContent) {
        contextContent.push('--- ADDITIONAL EXTERNAL CONTEXT ---');
        contextContent.push(externalContextContent);
    }
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

    fullPrompt += `
    
${contextString}

--- Main Input: Project Proposal ---
\`\`\`json
${JSON.stringify(proposal, null, 2)}
\`\`\`
`;
    // --- End of prompt construction ---

    const agentInput = {
      proposal,
      otherSections: otherSections || {},
      otherDiagrams: otherDiagrams || {},
      prompt: fullPrompt,
    };

    const result = await agentInfo.flow(agentInput);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const sectionToGenerate = (await request.json().catch(() => ({})))?.sectionToGenerate || 'unknown section';
    console.error(`Error generating report section '${sectionToGenerate}':`, error);
    return NextResponse.json({ message: 'An unexpected error occurred while generating the report section.' }, { status: 500 });
  }
}
