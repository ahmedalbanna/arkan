
'use server';

import { z } from 'zod';
import { ProjectProposalSchema, DiagramTypeSchema, type DiagramType } from '@/ai/schemas';
import { generateUseCaseDiagram } from '@/ai/flows/generate-use-case-diagram';
import { generateClassDiagram } from '@/ai/flows/generate-class-diagram';
import { generateSequenceDiagram } from '@/ai/flows/generate-sequence-diagram';
import { generateActivityDiagram } from '@/ai/flows/generate-activity-diagram';
import { generateComponentDiagram } from '@/ai/flows/generate-component-diagram';
import { generateArchimateDiagram } from '@/ai/flows/generate-archimate-diagram';
import { generateErDiagram } from '@/ai/flows/generate-er-diagram';
import { deflateSync } from 'zlib';
import { AGENTS } from '@/lib/agents';
import { deductCredit } from '@/services/credit-service';

// In a real app, this would come from the authenticated session
const HARDCODED_USER_ID = 'user-1';


export interface DiagramState {
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
  diagramType: DiagramTypeSchema,
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
    // Use the local proxy to cache and optimize the image
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


export async function handleGenerateDiagram(
  prevState: DiagramState,
  formData: FormData
): Promise<DiagramState> {
  
  const formAction = formData.get('formAction');

  if (formAction === 'render') {
      const validatedFields = RenderDiagramSchema.safeParse({
          plantUmlCode: formData.get('plantUmlCode'),
          diagramType: formData.get('diagramType'),
      });
      if (!validatedFields.success) {
        return { ...prevState, error: 'Invalid data for re-rendering.' };
      }
      try {
        const imageUrl = await getPlantUmlImageUrl(validatedFields.data.plantUmlCode);
        return { 
          ...prevState, 
          imageUrl, 
          currentPlantUmlCode: validatedFields.data.plantUmlCode, 
          lastGenerated: validatedFields.data.diagramType,
          plantUmlCodes: {
            ...prevState.plantUmlCodes,
            [validatedFields.data.diagramType]: validatedFields.data.plantUmlCode
          },
          error: undefined 
        };
      } catch (e: any) {
        return { ...prevState, error: e.message || 'Error re-rendering diagram' };
      }
  }

  const validatedFields = GenerateDiagramSchema.safeParse({
    proposalJson: formData.get('proposalJson'),
    diagramToGenerate: formData.get('diagramToGenerate'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.proposalJson?.[0] || 'Invalid data.',
    };
  }
  
  const { proposalJson, diagramToGenerate } = validatedFields.data;

  let proposalData;
  try {
    proposalData = JSON.parse(proposalJson);
  } catch (e) {
    return { error: 'Invalid JSON format. Please check the content.' };
  }

  const validatedProposal = ProjectProposalSchema.safeParse(proposalData);
  if (!validatedProposal.success) {
    return { error: 'The proposal data does not match the required structure.' };
  }

  const agentInfo = diagramAgentMap[diagramToGenerate];
  if (!agentInfo) {
    return { error: `No agent configured for diagram type '${diagramToGenerate}'.` };
  }
  
  const agent = AGENTS.find(a => a.id === agentInfo.agentId);
  if (!agent || !agent.isEnabled) {
      return { error: `The agent for '${diagramToGenerate}' is not available or is disabled.` };
  }


  try {
    await deductCredit(HARDCODED_USER_ID, 1);
    
    const result = await agentInfo.flow({
      proposal: validatedProposal.data,
      prompt: typeof agent.prompt === 'string' ? agent.prompt : agent.prompt.base
    });

    const imageUrl = await getPlantUmlImageUrl(result.plantUmlCode);

    return {
      plantUmlCodes: {
        ...prevState.plantUmlCodes,
        [diagramToGenerate]: result.plantUmlCode
      },
      imageUrl,
      currentPlantUmlCode: result.plantUmlCode,
      lastGenerated: diagramToGenerate,
      error: undefined
    };

  } catch (e: any) {
    console.error(e);
    const errorMessage = e.message || 'An error occurred while generating the diagram.';
    return { error: errorMessage };
  }
}
