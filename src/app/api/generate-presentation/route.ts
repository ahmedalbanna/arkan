
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generatePresentation } from '@/ai/flows/generate-presentation';
import { AGENTS } from '@/lib/agents';
import { ProjectProposalSchema, DiagramTypeSchema, SectionNameSchema } from '@/ai/schemas';
import type { AgentPrompt } from '@/lib/agents';
import { deductCredit } from '@/services/credit-service';
import { auth } from '@/lib/firebase/admin';
import { logGeneration } from '@/services/generation-service';

const ApiGeneratePresentationSchema = z.object({
  proposal: ProjectProposalSchema,
  sections: z.record(SectionNameSchema, z.string()).optional(),
  diagrams: z.record(DiagramTypeSchema, z.string()).optional(),
  guidelines: z.array(z.string()).optional(),
  externalContextContent: z.string().optional(),
  templateId: z.string().optional(), // Added templateId
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
    const validation = ApiGeneratePresentationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    await deductCredit(userId, 1);

    const presentationAgent = AGENTS.find(a => a.id === 'generate-presentation');
    // Updated validation: Check for agent existence and if the prompt is an object with a 'base' property.
    if (!presentationAgent || typeof presentationAgent.prompt !== 'object' || !('base' in (presentationAgent.prompt as AgentPrompt))) {
      return NextResponse.json({ message: 'Presentation generation agent not configured properly.' }, { status: 500 });
    }

    const { proposal, sections, diagrams, guidelines, externalContextContent } = validation.data;
    const agentPrompt = presentationAgent.prompt as AgentPrompt;

    // --- Server-side prompt construction ---
    let fullPrompt = agentPrompt.base;

    // Add guidelines to the prompt
    if (guidelines && guidelines.length > 0) {
        fullPrompt += '\\n\\n' + guidelines.map(g => `- ${g}`).join('\\n');
    }

    const contextContent = [];
    if (externalContextContent) {
        contextContent.push('--- ADDITIONAL EXTERNAL CONTEXT ---');
        contextContent.push(externalContextContent);
    }
    if (sections && Object.keys(sections).length > 0) {
        contextContent.push('--- REPORT SECTIONS ---');
        for (const [sectionName, content] of Object.entries(sections)) {
            contextContent.push(`--- Section: ${sectionName} ---\\n${content}\\n---`);
        }
    }
    if (diagrams && Object.keys(diagrams).length > 0) {
        contextContent.push('--- DIAGRAMS (PlantUML) ---');
        for (const [diagramType, diagramCode] of Object.entries(diagrams)) {
            contextContent.push(`--- Diagram: ${diagramType} ---\\n${diagramCode}\\n---`);
        }
    }
    const contextString = contextContent.join('\\n\\n');

    fullPrompt += `

--- Main Input: Project Proposal ---
\`\`\`json
${JSON.stringify(proposal, null, 2)}
\`\`\`

--- Additional Context (Optional) ---
${contextString || 'No additional context provided.'}
---
`;
    // --- End of prompt construction ---

    const agentInput = {
      proposal,
      sections,
      diagrams,
      prompt: fullPrompt, // Pass the fully constructed prompt
    };

    const result = await generatePresentation(agentInput);
    
    // Log the successful generation
    await logGeneration({
        agentId: presentationAgent.id,
        userId,
        input: agentInput,
        output: result,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error generating presentation:', error);
    if (error instanceof Error) {
        if (error.message.includes("Unauthorized") || error.message.includes("token")) {
            return NextResponse.json({ message: 'Authentication failed.' }, { status: 401 });
        }
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred while generating the presentation.' }, { status: 500 });
  }
}
