
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generatePresentation } from '@/ai/flows/generate-presentation';
import { AGENTS } from '@/lib/agents';
import { ProjectProposalSchema, DiagramTypeSchema, SectionNameSchema } from '@/ai/schemas';

const ApiGeneratePresentationSchema = z.object({
  proposal: ProjectProposalSchema,
  sections: z.record(SectionNameSchema, z.string()).optional(),
  diagrams: z.record(DiagramTypeSchema, z.string()).optional(),
  guidelines: z.array(z.string()).optional(),
});


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = ApiGeneratePresentationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const presentationAgent = AGENTS.find(a => a.id === 'generate-presentation');
    if (!presentationAgent || typeof presentationAgent.prompt === 'string') { // prompt should be complex
      return NextResponse.json({ message: 'Presentation generation agent not configured properly.' }, { status: 500 });
    }

    const { proposal, sections, diagrams, guidelines } = validation.data;

    // --- Server-side prompt construction ---
    let fullPrompt = presentationAgent.prompt.base;

    // Add guidelines to the prompt
    if (guidelines && guidelines.length > 0) {
        fullPrompt += '\n\n' + guidelines.map(g => `- ${g}`).join('\n');
    }

    const contextContent = [];
    if (sections && Object.keys(sections).length > 0) {
        contextContent.push('--- REPORT SECTIONS ---');
        for (const [sectionName, content] of Object.entries(sections)) {
            contextContent.push(`--- Section: ${sectionName} ---\n${content}\n---`);
        }
    }
    if (diagrams && Object.keys(diagrams).length > 0) {
        contextContent.push('--- DIAGRAMS (PlantUML) ---');
        for (const [diagramType, diagramCode] of Object.entries(diagrams)) {
            contextContent.push(`--- Diagram: ${diagramType} ---\n${diagramCode}\n---`);
        }
    }
    const contextString = contextContent.join('\n\n');

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


    const result = await generatePresentation({
      proposal,
      sections,
      diagrams,
      prompt: fullPrompt, // Pass the fully constructed prompt
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error generating presentation:', error);
    return NextResponse.json({ message: 'An unexpected error occurred while generating the presentation.' }, { status: 500 });
  }
}
