
'use server';

import { z } from 'zod';
import { ProjectProposalSchema, DiagramTypeSchema, type DiagramType } from '@/ai/schemas';
import { deflateSync } from 'zlib';
import { generateUseCaseDiagram } from '@/ai/flows/generate-use-case-diagram';
import { generateClassDiagram } from '@/ai/flows/generate-class-diagram';
import { generateSequenceDiagram } from '@/ai/flows/generate-sequence-diagram';
import { generateActivityDiagram } from '@/ai/flows/generate-activity-diagram';
import { generateComponentDiagram } from '@/ai/flows/generate-component-diagram';
import { generateArchimateDiagram } from '@/ai/flows/generate-archimate-diagram';
import { generateErDiagram } from '@/ai/flows/generate-er-diagram';


export interface DiagramGenerationState {
  plantUmlCodes?: Partial<Record<DiagramType, string>>;
  imageUrl?: string;
  currentPlantUmlCode?: string;
  lastGenerated?: DiagramType;
  error?: string;
}

const GenerateDiagramSchema = z.object({
  proposalJson: z.string().min(1, 'Please paste the project proposal content.'),
  diagramToGenerate: DiagramTypeSchema,
});

const RenderDiagramSchema = z.object({
  plantUmlCode: z.string(),
});

// Helper to encode PlantUML for URL
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
    // Use the local proxy to cache and optimize the image
    return `/api/proxy-image?url=${encodeURIComponent(plantUmlUrl)}`;
}


const diagramFlowMap: Record<DiagramType, Function> = {
  useCase: generateUseCaseDiagram,
  class: generateClassDiagram,
  sequence: generateSequenceDiagram,
  activity: generateActivityDiagram,
  component: generateComponentDiagram,
  archimate: generateArchimateDiagram,
  er: generateErDiagram,
};

export async function handleGenerateDiagram(
  prevState: DiagramGenerationState,
  formData: FormData
): Promise<DiagramGenerationState> {
  const formAction = formData.get('formAction');

  if (formAction === 'render') {
    const validatedRender = RenderDiagramSchema.safeParse({
        plantUmlCode: formData.get('plantUmlCode'),
    });
    const diagramToRender = formData.get('diagramType') as DiagramType;

    if (!validatedRender.success || !diagramToRender) {
        return { ...prevState, error: 'Invalid data for re-rendering.' };
    }
    
    try {
        const imageUrl = await getPlantUmlImageUrl(validatedRender.data.plantUmlCode);
        return { 
            ...prevState, 
            imageUrl,
            currentPlantUmlCode: validatedRender.data.plantUmlCode,
            plantUmlCodes: {
                ...prevState.plantUmlCodes,
                [diagramToRender]: validatedRender.data.plantUmlCode,
            },
            lastGenerated: diagramToRender,
            error: undefined
        };
    } catch (e) {
        return { ...prevState, error: 'An error occurred while re-rendering the diagram.' };
    }
  }


  const validatedFields = GenerateDiagramSchema.safeParse({
    proposalJson: formData.get('proposalJson'),
    diagramToGenerate: formData.get('diagramToGenerate'),
  });

  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors;
    const errorMessage = Object.values(errors).flat().join(', ');
    return {
      ...prevState,
      error: `Invalid data: ${errorMessage}`,
    };
  }

  let proposalData: ProjectProposal;
  try {
    proposalData = JSON.parse(validatedFields.data.proposalJson);
  } catch (e) {
    return { ...prevState, error: 'Invalid JSON format. Please check the content.' };
  }

  const validatedProposal = ProjectProposalSchema.safeParse(proposalData);
  if (!validatedProposal.success) {
    return {
      ...prevState,
      error: 'The proposal data does not match the required structure.',
    };
  }
  
  const diagramToGenerate = validatedFields.data.diagramToGenerate;
  const flow = diagramFlowMap[diagramToGenerate];

  if (!flow) {
    return { ...prevState, error: 'Unknown diagram type requested.' };
  }

  try {
    const agentInput = {
      proposal: validatedProposal.data,
      // Context from other diagrams could be added here in the future
    };

    const result = await flow(agentInput);

    const imageUrl = await getPlantUmlImageUrl(result.plantUmlCode);

    return {
      ...prevState,
      plantUmlCodes: {
        ...prevState.plantUmlCodes,
        [diagramToGenerate]: result.plantUmlCode,
      },
      imageUrl: imageUrl,
      currentPlantUmlCode: result.plantUmlCode,
      lastGenerated: diagramToGenerate,
      error: undefined,
    };
  } catch (e) {
    console.error(`Error generating diagram '${diagramToGenerate}':`, e);
    return { ...prevState, error: `An error occurred while generating '${diagramToGenerate}'. Please try again.` };
  }
}
