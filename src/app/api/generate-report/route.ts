
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
import { REPORT_GENERATION_TEMPLATES } from '@/lib/report-generation-templates';
import { deductCredit } from '@/services/credit-service';
import { auth } from '@/lib/firebase/admin';

const generateReportSchema = z.object({
  proposal: ProjectProposalSchema,
  sectionToGenerate: SectionNameSchema.optional(), // Optional for full report
  templateId: z.string().optional(), // For full report generation
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

// Helper function to construct a prompt
const constructPrompt = (agent: any, data: z.infer<typeof generateReportSchema>) => {
  const { proposal, otherSections, otherDiagrams, guidelines, instructionText, externalContextContent } = data;

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
  return fullPrompt;
};


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
    const validation = generateReportSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { proposal, sectionToGenerate, templateId, otherSections, otherDiagrams, externalContextContent } = validation.data;

    // Handle full report generation
    if (templateId) {
      const template = REPORT_GENERATION_TEMPLATES.find(t => t.id === templateId);
      if (!template) {
        return NextResponse.json({ message: 'Invalid report template ID.' }, { status: 400 });
      }

      await deductCredit(userId, template.agentIds.length); // Deduct credits for the full report

      const generatedSections: { [key in SectionName]?: string } = {};
      
      for (const agentId of template.agentIds) {
        const agent = AGENTS.find(a => a.id === agentId);
        const sectionKey = Object.keys(sectionConfig).find(key => sectionConfig[key as SectionName].agentId === agentId) as SectionName | undefined;

        if (!agent || !sectionKey) continue;
        
        const agentInfo = sectionAgentMap[sectionKey];
        if (!agentInfo) continue;

        const currentContext = {
          ...validation.data,
          otherSections: { ...otherSections, ...generatedSections },
        };
        
        const prompt = constructPrompt(agent, currentContext);
        
        const result = await agentInfo.flow({
          proposal,
          otherSections: currentContext.otherSections,
          otherDiagrams,
          prompt,
        });

        const content = Object.values(result)[0] as string;
        generatedSections[sectionKey] = content;
      }
      return NextResponse.json({ sections: generatedSections }, { status: 200 });
    }


    // Handle single section generation
    if (sectionToGenerate) {
      await deductCredit(userId, 1); // Deduct 1 credit for a single section
      
      const agentInfo = sectionAgentMap[sectionToGenerate];
      if (!agentInfo) {
        return NextResponse.json({ message: 'Unknown section requested.' }, { status: 400 });
      }

      const agent = AGENTS.find(a => a.id === agentInfo.agentId);
      if (!agent) {
        return NextResponse.json({ message: `Agent for section '${sectionToGenerate}' not configured.` }, { status: 500 });
      }

      const prompt = constructPrompt(agent, validation.data);

      const agentInput = {
        proposal,
        otherSections: otherSections || {},
        otherDiagrams: otherDiagrams || {},
        prompt: prompt,
      };

      const result = await agentInfo.flow(agentInput);
      return NextResponse.json(result, { status: 200 });
    }

    return NextResponse.json({ message: 'Invalid request. Must provide either sectionToGenerate or templateId.' }, { status: 400 });

  } catch (error) {
    console.error(`Error generating report:`, error);
    if (error instanceof Error) {
        if (error.message.includes("Unauthorized") || error.message.includes("token")) {
            return NextResponse.json({ message: 'Authentication failed.' }, { status: 401 });
        }
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred while generating the report.' }, { status: 500 });
  }
}
