import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ProjectProposalSchema, DiagramTypeSchema, type DiagramType } from '@/ai/schemas';
import { generateUseCaseDiagram } from '@/ai/flows/generate-use-case-diagram';
import { generateClassDiagram } from '@/ai/flows/generate-class-diagram';
import { generateSequenceDiagram } from '@/ai/flows/generate-sequence-diagram';
import { generateActivityDiagram } from '@/ai/flows/generate-activity-diagram';
import { generateComponentDiagram } from '@/ai/flows/generate-component-diagram';
import { generateArchimateDiagram } from '@/ai/flows/generate-archimate-diagram';
import { deflateSync } from 'zlib';

const generateDiagramSchema = z.object({
  proposal: ProjectProposalSchema,
  diagramToGenerate: DiagramTypeSchema,
  otherDiagrams: z.record(DiagramTypeSchema, z.string()).optional(),
});

// Helper function to encode PlantUML for URL
function encode64(data: Buffer): string {
    const B64_MAP = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';
    let r = '';
    for (let i = 0; i < data.length; i += 3) {
        const b1 = data[i];
        const b2 = i + 1 < data.length ? data[i+1] : 0;
        const b3 = i + 2 < data.length ? data[i+2] : 0;

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
    return `https://www.plantuml.com/plantuml/png/~1${encoded}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = generateDiagramSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { proposal, diagramToGenerate, otherDiagrams } = validation.data;
    const agentInput = { proposal, otherDiagrams: otherDiagrams || {} };

    let result;
    switch (diagramToGenerate) {
      case 'useCase':
        result = await generateUseCaseDiagram(agentInput);
        break;
      case 'class':
        result = await generateClassDiagram(agentInput);
        break;
      case 'sequence':
        result = await generateSequenceDiagram(agentInput);
        break;
      case 'activity':
        result = await generateActivityDiagram(agentInput);
        break;
      case 'component':
        result = await generateComponentDiagram(agentInput);
        break;
      case 'archimate':
        result = await generateArchimateDiagram(agentInput);
        break;
      default:
        return NextResponse.json({ message: 'Unknown diagram type requested.' }, { status: 400 });
    }

    const imageUrl = await getPlantUmlImageUrl(result.plantUmlCode);
    
    return NextResponse.json({
      plantUmlCode: result.plantUmlCode,
      imageUrl: imageUrl,
    }, { status: 200 });

  } catch (error) {
    console.error('Error generating diagram:', error);
    return NextResponse.json({ message: 'An unexpected error occurred while generating the diagram.' }, { status: 500 });
  }
}
