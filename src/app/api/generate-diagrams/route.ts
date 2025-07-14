
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ProjectProposalSchema, DiagramTypeSchema, SectionNameSchema, type DiagramType } from '@/ai/schemas';
import { AGENTS, type AgentPrompt } from '@/lib/agents';
import { generateUseCaseDiagram } from '@/ai/flows/generate-use-case-diagram';
import { generateClassDiagram } from '@/ai/flows/generate-class-diagram';
import { generateSequenceDiagram } from '@/ai/flows/generate-sequence-diagram';
import { generateActivityDiagram } from '@/ai/flows/generate-activity-diagram';
import { generateComponentDiagram } from '@/ai/flows/generate-component-diagram';
import { generateArchimateDiagram } from '@/ai/flows/generate-archimate-diagram';
import { generateErDiagram } from '@/ai/flows/generate-er-diagram';
import { deflateSync } from 'zlib';

const generateDiagramSchema = z.object({
  proposal: ProjectProposalSchema,
  diagramToGenerate: DiagramTypeSchema,
  otherSections: z.record(SectionNameSchema, z.string()).optional(),
  otherDiagrams: z.record(DiagramTypeSchema, z.string()).optional(),
  // Client now sends selected guidelines instead of a full prompt
  guidelines: z.array(z.string()).optional(), 
  intent: z.string().optional(),
  plantUmlCode: z.string().optional(),
  externalContextContent: z.string().optional(),
});

// Helper function to encode PlantUML for URL
function encode64(data: Buffer): string {
  const B64_MAP = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';
  let r = '';
  for (let i = 0; i < data.length; i += 3) {
    const b1 = data[i];
    const b2 = i + 1 < data.length ? data[i + 1] : 0;
    const b3 = i + 2 < data.length ? data[i + 2] : 0;

    const c1 = b1 >> 2;
    const c2 = ((b1 & 3) << 4) | (b2 >> 4);
    const c3 = ((b2 & 15) << 2) | (b3 >> 6);
    const c4 = b3 & 63;

    r += B64_MAP.charAt(c1);
    r += B64_MAP.charAt(c2);
    if (i + 1 < data.length) {
      r += B64_MAP.charAt(c3);
    }
    if (i + 2 < data.length) {
      r += B64_MAP.charAt(c4);
    }
  }
  return r;
}

async function getPlantUmlImageUrl(plantUmlCode: string): Promise<string> {
  const compressed = deflateSync(Buffer.from(plantUmlCode, 'utf-8'));
  const encoded = encode64(compressed);
  const plantUmlUrl = `https://www.plantuml.com/plantuml/png/~1${encoded}`;
  return `/api/proxy-image?url=${encodeURIComponent(plantUmlUrl)}`;
}

const diagramAgentMap: Record<DiagramType, { flow: Function; agentId: string }> = {
  useCase: { flow: generateUseCaseDiagram, agentId: 'generate-use-case-diagram' },
  class: { flow: generateClassDiagram, agentId: 'generate-class-diagram' },
  sequence: { flow: generateSequenceDiagram, agentId: 'generate-sequence-diagram' },
  activity: { flow: generateActivityDiagram, agentId: 'generate-activity-diagram' },
  component: { flow: generateComponentDiagram, agentId: 'generate-component-diagram' },
  archimate: { flow: generateArchimateDiagram, agentId: 'generate-archimate-diagram' },
  er: { flow: generateErDiagram, agentId: 'generate-er-diagram' },
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Loosen schema for render-only intent
    const validation = generateDiagramSchema.partial().safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { proposal, diagramToGenerate, otherSections, otherDiagrams, guidelines, intent, plantUmlCode, externalContextContent } = validation.data;

    if (intent === 'update_diagram') {
        if (!plantUmlCode) {
            return NextResponse.json({ message: 'PlantUML code is required for an update.'}, { status: 400 });
        }
        const imageUrl = await getPlantUmlImageUrl(plantUmlCode);
        return NextResponse.json({ plantUmlCode, imageUrl }, { status: 200 });
    }

    if (!proposal || !diagramToGenerate) {
        return NextResponse.json({ message: 'Proposal and diagram type are required for generation.' }, { status: 400 });
    }


    const agentInfo = diagramAgentMap[diagramToGenerate];
    if (!agentInfo) {
      return NextResponse.json({ message: 'Unknown diagram type requested.' }, { status: 400 });
    }

    const agent = AGENTS.find(a => a.id === agentInfo.agentId);
    if (!agent) {
      return NextResponse.json({ message: `Agent for diagram '${diagramToGenerate}' not configured.` }, { status: 500 });
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

    const imageUrl = await getPlantUmlImageUrl(result.plantUmlCode);

    return NextResponse.json({
      plantUmlCode: result.plantUmlCode,
      imageUrl: imageUrl,
    }, { status: 200 });

  } catch (error) {
    console.error(`Error generating diagram:`, error);
    return NextResponse.json({ message: 'An unexpected error occurred while generating the diagram.' }, { status: 500 });
  }
}
