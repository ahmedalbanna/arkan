
'use server';

import { z } from 'zod';
import { ProjectProposalSchema, type ProjectProposal, DiagramTypeSchema, type DiagramType, SectionNameSchema, type SectionName } from '@/ai/schemas';
import { deflateSync } from 'zlib';
import { AGENTS } from '@/lib/agents';

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
  error?: string;
  lastGenerated?: SectionName | DiagramType;
}

const GenerateItemSchema = z.object({
  proposalJson: z.string().min(1, 'Please paste the project proposal content.'),
  itemToGenerate: z.string().min(1, 'An item to generate must be selected.'),
  intent: z.string().optional(),
  diagramToUpdate: DiagramTypeSchema.optional(),
  plantUmlCode: z.string().optional(),
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

  const validatedFields = GenerateItemSchema.safeParse({
    proposalJson: formData.get('proposalJson'),
    itemToGenerate: formData.get('itemToGenerate'),
    intent: formData.get('intent'),
    diagramToUpdate: formData.get('diagramToUpdate'),
    plantUmlCode: formData.get('plantUmlCode'),
  });

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
    itemToGenerate
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
  const prompt = formData.get(`prompt_${itemToGenerate}`) as string | null;
  if (prompt === null) {

    return { ...prevState, error: `Prompt for item type '${itemToGenerate}' was not found.` };
  }



  // Check if the requested item to generate is a known section name or diagram type.
  const isSection = sectionNames.includes(itemToGenerate as SectionName);
  const isDiagram = DiagramTypeSchema.options.includes(itemToGenerate as DiagramType);

  // If it's neither, return an error.
  if (!isSection && !isDiagram) {
    return { ...prevState, error: 'Unknown item type requested.' };
  }

  // Initialize objects to hold content from other sections and diagrams
  // that should be included as context for the generation.
  const otherSections: Partial<Record<SectionName, string>> = {};
  const otherDiagrams: Partial<Record<DiagramType, string>> = {};

  // Get the current state of all available sections and diagrams.
  // Use empty objects as fallbacks if prevState.sections or prevState.diagrams are undefined.
  const allAvailableSections = prevState.sections || {};
  const allAvailableDiagrams = prevState.diagrams || {};

  // Iterate through all possible section names.
  for (const sectionKey of SectionNameSchema.options) {
    // Skip the section that is currently being generated.
    if (sectionKey === itemToGenerate) continue;
    // Construct the name of the checkbox for this section as context.
    const contextCheckboxName = `context_${itemToGenerate}_${sectionKey}`;
    if (formData.get(contextCheckboxName) === 'on' && allAvailableSections[sectionKey]) {
      otherSections[sectionKey] = allAvailableSections[sectionKey];
    }
  }

  for (const diagramKey of DiagramTypeSchema.options) {
    // Skip the diagram that is currently being generated.
    if (diagramKey === itemToGenerate) continue;
    // Construct the name of the checkbox for this diagram as context.
    const contextCheckboxName = `context_${itemToGenerate}_${diagramKey}`;
    if (formData.get(contextCheckboxName) === 'on' && allAvailableDiagrams[diagramKey]) {
      otherDiagrams[diagramKey] = allAvailableDiagrams[diagramKey].plantUmlCode;
      // Include the PlantUML code of the diagram if the context checkbox is checked and the diagram exists.
    }
  }
  
  try {
    const agentInput = {
      proposal: validatedProposal.data,
      otherSections,
      otherDiagrams,
      prompt: prompt!,
    };

    if (isSection) {
      const sectionToGenerate = itemToGenerate as SectionName;
      let result;

      switch (sectionToGenerate) {
        case 'introduction':
          result = await generateIntroduction(agentInput);
          return { ...prevState, sections: { ...prevState.sections, introduction: result.introduction }, lastGenerated: 'introduction', error: undefined };
        case 'literatureReview':
          result = await generateLiteratureReview(agentInput);
          return { ...prevState, sections: { ...prevState.sections, literatureReview: result.literatureReview }, lastGenerated: 'literatureReview', error: undefined };
        case 'systemAnalysis':
          result = await generateSystemAnalysis(agentInput);
          return { ...prevState, sections: { ...prevState.sections, systemAnalysis: result.systemAnalysis }, lastGenerated: 'systemAnalysis', error: undefined };
        case 'designStrategy':
          result = await generateDesignStrategy(agentInput);
          return { ...prevState, sections: { ...prevState.sections, designStrategy: result.designStrategy }, lastGenerated: 'designStrategy', error: undefined };
        case 'systemDesign':
          result = await generateSystemDesign(agentInput);
          return { ...prevState, sections: { ...prevState.sections, systemDesign: result.systemDesign }, lastGenerated: 'systemDesign', error: undefined };
        case 'systemProgramming':
          result = await generateSystemProgramming(agentInput);
          return { ...prevState, sections: { ...prevState.sections, systemProgramming: result.systemProgramming }, lastGenerated: 'systemProgramming', error: undefined };
        case 'systemTesting':
          result = await generateSystemTesting(agentInput);
          return { ...prevState, sections: { ...prevState.sections, systemTesting: result.systemTesting }, lastGenerated: 'systemTesting', error: undefined };
        case 'conclusion':
          result = await generateConclusion(agentInput);
          return { ...prevState, sections: { ...prevState.sections, conclusion: result.conclusion }, lastGenerated: 'conclusion', error: undefined };
      }
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
