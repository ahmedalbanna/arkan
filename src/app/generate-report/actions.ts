
'use server';

import { z } from 'zod';
import { 
  ProjectProposalSchema, 
  type ProjectProposal, 
  DiagramTypeSchema, 
  type DiagramType, 
  SectionNameSchema, 
  type SectionName, 
  type PresentationSlide,
  GeneratePresentationInputSchema,
  type GeneratePresentationInput
} from '@/ai/schemas';
import { AGENTS, type AgentPrompt } from '@/lib/agents';
import { deflateSync } from 'zlib';
import { sectionConfig, diagramConfig, presentationConfig } from '@/lib/report-config';

import { generateIntroduction } from '@/ai/flows/generate-introduction';
import { generateLiteratureReview } from '@/ai/flows/generate-literature-review';
import { generateSystemAnalysis } from '@/ai/flows/generate-system-analysis';
import { generateDesignStrategy } from '@/ai/flows/generate-design-strategy';
import { generateSystemDesign } from '@/ai/flows/generate-system-design';
import { generateSystemProgramming } from '@/ai/flows/generate-system-programming';
import { generateSystemTesting } from '@/ai/flows/generate-system-testing';
import { generateConclusion } from '@/ai/flows/generate-conclusion';
import { generateUseCaseDiagram } from '@/ai/flows/generate-use-case-diagram';
import { generateClassDiagram } from '@/ai/flows/generate-class-diagram';
import { generateSequenceDiagram } from '@/ai/flows/generate-sequence-diagram';
import { generateActivityDiagram } from '@/ai/flows/generate-activity-diagram';
import { generateComponentDiagram } from '@/ai/flows/generate-component-diagram';
import { generateArchimateDiagram } from '@/ai/flows/generate-archimate-diagram';
import { generatePresentation } from '@/ai/flows/generate-presentation';

import { createProject } from '@/lib/db/queries';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export interface ReportState {
  sections: {
    [key in SectionName]?: string;
  };
  diagrams?: {
    [key in DiagramType]?: {
      plantUmlCode: string;
      imageUrl: string;
    };
  };
  presentation?: {
    slides: PresentationSlide[];
  }
  externalContext?: {
    fileName: string;
    content: string;
  }
  error?: string;
  lastGenerated?: SectionName | DiagramType | 'presentation';
}

const GenerateItemSchema = z.object({
  proposalJson: z.string().min(1, 'Please paste the project proposal content.'),
  itemToGenerate: z.string().min(1, 'An item to generate must be selected.'),
  intent: z.string().optional(),
  diagramToUpdate: DiagramTypeSchema.optional(),
  plantUmlCode: z.string().optional(),
  externalContextContent: z.string().optional(),
  guidelines: z.array(z.string()).optional(),
  instructionText: z.string().optional(),
});

const sectionNames: SectionName[] = [
  'introduction', 'literatureReview', 'systemAnalysis', 'designStrategy',
  'systemDesign', 'systemProgramming', 'systemTesting', 'conclusion'
];

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


export async function handleGenerateReportItem(
  prevState: ReportState,
  formData: FormData
): Promise<ReportState> {

  const formValues = {
    proposalJson: formData.get('proposalJson') ?? undefined,
    itemToGenerate: formData.get('itemToGenerate') ?? undefined,
    intent: formData.get('intent') ?? undefined,
    diagramToUpdate: formData.get('diagramToUpdate') ?? undefined,
    plantUmlCode: formData.get('plantUmlCode') ?? undefined,
    externalContextContent: formData.get('externalContextContent') ?? undefined,
    guidelines: formData.getAll('guidelines[]').map(String),
    instructionText: formData.get('instructionText') ?? undefined,
  };

  const validatedFields = GenerateItemSchema.safeParse(formValues);

  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors;
    const errorMessage = Object.values(errors).flat().join(', ');
    return {
      ...prevState,
      error: `Invalid data: ${errorMessage}`,
    };
  }

  const {
    intent,
    diagramToUpdate,
    plantUmlCode,
    proposalJson,
    itemToGenerate,
    externalContextContent,
    guidelines,
    instructionText,
  } = validatedFields.data;


  if (intent === 'update_diagram') {
    if (!diagramToUpdate || plantUmlCode === null || plantUmlCode === undefined) {
      return { ...prevState, error: 'Missing data for diagram update.' };
    }

    try {
      const imageUrl = await getPlantUmlImageUrl(plantUmlCode);
      const newDiagrams = {
        ...prevState.diagrams,
        [diagramToUpdate]: {
          plantUmlCode: plantUmlCode,
          imageUrl: imageUrl,
        },
      };
      return { ...prevState, diagrams: newDiagrams, error: undefined, lastGenerated: diagramToUpdate };
    } catch (e) {
      console.error(`Error updating diagram '${diagramToUpdate}':`, e);
      return { ...prevState, error: `An error occurred while updating diagram '${diagramToUpdate}'.` };
    }
  }


  let proposalData: ProjectProposal;

  try {
    proposalData = JSON.parse(proposalJson);
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
  
  const agentId = (sectionConfig[itemToGenerate as SectionName] || diagramConfig[itemToGenerate as DiagramType] || presentationConfig.presentation)?.agentId;
  const agent = AGENTS.find(a => a.id === agentId);
  if (!agent) {
    return { ...prevState, error: `Prompt for item type '${itemToGenerate}' was not found.` };
  }

  // Check if the requested item to generate is a known section name or diagram type.
  const isSection = sectionNames.includes(itemToGenerate as SectionName);
  const isDiagram = DiagramTypeSchema.options.includes(itemToGenerate as DiagramType);
  const isPresentation = itemToGenerate === 'presentation';

  // If it's neither, return an error.
  if (!isSection && !isDiagram && !isPresentation) {
    return { ...prevState, error: 'Unknown item type requested.' };
  }

  const otherSections: Partial<Record<SectionName, string>> = {};
  const otherDiagrams: Partial<Record<DiagramType, string>> = {};

  const allAvailableSections = prevState.sections || {};
  const allAvailableDiagrams = prevState.diagrams || {};

  for (const sectionKey of SectionNameSchema.options) {
    if (sectionKey === itemToGenerate) continue;
    const contextCheckboxName = `context_${itemToGenerate}_${sectionKey}`;
    if (formData.get(contextCheckboxName) === 'on' && allAvailableSections[sectionKey]) {
      otherSections[sectionKey] = allAvailableSections[sectionKey];
    }
  }

  for (const diagramKey of DiagramTypeSchema.options) {
    if (diagramKey === itemToGenerate) continue;
    const contextCheckboxName = `context_${itemToGenerate}_${diagramKey}`;
    if (formData.get(contextCheckboxName) === 'on' && allAvailableDiagrams[diagramKey]) {
      otherDiagrams[diagramKey] = allAvailableDiagrams[diagramKey]!.plantUmlCode;
    }
  }
  
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
  if (formData.get(`context_${itemToGenerate}_external`) === 'on' && externalContextContent) {
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
${JSON.stringify(proposalData, null, 2)}
\`\`\`
`;

  try {
    const agentInput = {
      proposal: validatedProposal.data,
      otherSections,
      otherDiagrams,
      prompt: fullPrompt,
    };

    if (isSection) {
      const sectionToGenerate = itemToGenerate as SectionName;
      let result;

      switch (sectionToGenerate) {
        case 'introduction': result = await generateIntroduction(agentInput); break;
        case 'literatureReview': result = await generateLiteratureReview(agentInput); break;
        case 'systemAnalysis': result = await generateSystemAnalysis(agentInput); break;
        case 'designStrategy': result = await generateDesignStrategy(agentInput); break;
        case 'systemDesign': result = await generateSystemDesign(agentInput); break;
        case 'systemProgramming': result = await generateSystemProgramming(agentInput); break;
        case 'systemTesting': result = await generateSystemTesting(agentInput); break;
        case 'conclusion': result = await generateConclusion(agentInput); break;
        default: return { ...prevState, error: `Unknown section '${sectionToGenerate}'.` };
      }
      
      const newSections = { ...prevState.sections, [(Object.keys(result)[0] as SectionName)]: Object.values(result)[0] };

      return {
        ...prevState,
        sections: newSections,
        lastGenerated: sectionToGenerate,
        error: undefined
      };
    }

    if (isDiagram) {
      const diagramToGenerate = itemToGenerate as DiagramType;
      let result;

      switch (diagramToGenerate) {
        case 'useCase': result = await generateUseCaseDiagram(agentInput); break;
        case 'class': result = await generateClassDiagram(agentInput); break;
        case 'sequence': result = await generateSequenceDiagram(agentInput); break;
        case 'activity': result = await generateActivityDiagram(agentInput); break;
        case 'component': result = await generateComponentDiagram(agentInput); break;
        case 'archimate': result = await generateArchimateDiagram(agentInput); break;
        default: return { ...prevState, error: 'Unknown diagram type requested.' };
      }

      const imageUrl = await getPlantUmlImageUrl(result.plantUmlCode);

      const newDiagrams = {
        ...prevState.diagrams,
        [diagramToGenerate]: { plantUmlCode: result.plantUmlCode, imageUrl }
      };

      return {
        ...prevState,
        diagrams: newDiagrams,
        lastGenerated: diagramToGenerate,
        error: undefined
      };
    }

    if (isPresentation) {
      const presentationInput: GeneratePresentationInput = {
        proposal: validatedProposal.data,
        sections: otherSections,
        diagrams: otherDiagrams,
        prompt: fullPrompt,
      };
      const result = await generatePresentation(presentationInput);
      return { ...prevState, presentation: result, lastGenerated: 'presentation', error: undefined };
    }


    return { ...prevState, error: 'An unexpected error occurred.' };

  } catch (e) {
    console.error(`Error generating item '${itemToGenerate}':`, e);
    return { ...prevState, error: `An error occurred while generating '${itemToGenerate}'. Please try again.` };
  }
}

const CreateProjectSchema = z.object({
  proposalJson: z.string().min(1, 'Project proposal is required.'),
  sectionsJson: z.string().optional(),
  diagramsJson: z.string().optional(),
});

export async function handleCreateProjectFromProposal(
  prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const validatedFields = CreateProjectSchema.safeParse({
    proposalJson: formData.get('proposalJson'),
    sectionsJson: formData.get('sectionsJson'),
    diagramsJson: formData.get('diagramsJson'),
  });

  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors;
    return { error: `Invalid data: ${Object.values(errors).flat().join(', ')}` };
  }

  let proposal: ProjectProposal;
  try {
    proposal = JSON.parse(validatedFields.data.proposalJson || '{}');
  } catch (e) {
    return { error: 'Invalid JSON format in proposal data.' };
  }

  const validatedProposal = ProjectProposalSchema.safeParse(proposal);
  if (!validatedProposal.success) {
    return { error: 'Proposal data does not match the required structure.' };
  }

  const projectData = validatedProposal.data;

  let newProjectId;
  try {
    newProjectId = await createProject({
      userId: 'user-1', // Hardcoded for prototype
      title: projectData.title,
      description: projectData.objective, // Using objective as description
      category: projectData.category,
      liveLink: undefined, // No live link in proposal
      tags: projectData.tags,
      media: [{
        url: 'https://placehold.co/800x600.png',
        alt: `Cover image for ${projectData.title}`,
        aiHint: 'report cover',
        type: 'image'
      }],
      proposalData: validatedFields.data.proposalJson,
      reportSections: validatedFields.data.sectionsJson || undefined,
      reportDiagrams: validatedFields.data.diagramsJson || undefined,
    });
  } catch (error) {
    console.error('Failed to create project from proposal:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An error occurred while creating the project.' };
  }

  revalidatePath('/projects');
  revalidatePath('/profile/user-1');
  redirect(`/projects/${newProjectId}`);
}
