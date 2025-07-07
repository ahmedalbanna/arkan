
'use server';

import { z } from 'zod';
import { ProjectProposalSchema, type ProjectProposal, DiagramTypeSchema, type DiagramType, SectionNameSchema, type SectionName } from '@/ai/schemas';
import { deflateSync } from 'zlib';

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
    try {
        const compressed = deflateSync(Buffer.from(plantUmlCode, 'utf-8'));
        const encoded = encode64(compressed);
        const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(`https://www.plantuml.com/plantuml/png/~1${encoded}`)}`;
        // We do a test fetch to see if the URL is valid. If not, we'll use a fallback.
        const res = await fetch(proxyUrl.startsWith('/') ? new URL(proxyUrl, 'http://localhost:9002').toString() : proxyUrl);
        if (!res.ok) {
            console.warn(`PlantUML image generation failed with status ${res.status}. Falling back to placeholder.`);
            return getFallbackImageUrl();
        }
        return proxyUrl;
    } catch (e) {
        console.error("Error generating PlantUML image URL:", e);
        return getFallbackImageUrl();
    }
}

async function getFallbackImageUrl(): Promise<string> {
    const placeholderUrl = 'https://placehold.co/800x600.png';
    const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(placeholderUrl)}`;
    return proxyUrl;
}

export async function handleGenerateReportItem(
  prevState: ReportState,
  formData: FormData
): Promise<ReportState> {

  const validatedFields = GenerateItemSchema.safeParse({
    proposalJson: formData.get('proposalJson'),
    itemToGenerate: formData.get('itemToGenerate'),
  });

  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors;
    return {
      ...prevState,
      error: errors.proposalJson?.[0] || errors.itemToGenerate?.[0],
    };
  }
  
  const { proposalJson, itemToGenerate } = validatedFields.data;
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
  
  let prompt = formData.get(`prompt_${itemToGenerate}`) as string | null;
  if (prompt === null) {
    return { ...prevState, error: `Prompt for item type '${itemToGenerate}' was not found.` };
  }
  
  const isSection = sectionNames.includes(itemToGenerate as SectionName);
  const isDiagram = DiagramTypeSchema.options.includes(itemToGenerate as DiagramType);

  if (!isSection && !isDiagram) {
    return { ...prevState, error: 'Unknown item type requested.' };
  }
  
  // If it's a text section, check for and append control instructions
  if (isSection) {
      const formalityValue = formData.get(`formality_${itemToGenerate}`) as string | null;
      const tone = formData.get(`tone_${itemToGenerate}`) as string | null;
      const wordCount = formData.get(`wordCount_${itemToGenerate}`) as string | null;

      let instructions = [];
      if (formalityValue) {
          const formality = parseInt(formalityValue, 10);
          let formalityDesc = "balanced";
          if (formality < 33) formalityDesc = "informal and casual";
          else if (formality > 66) formalityDesc = "highly formal and professional";
          instructions.push(`- The writing style should be ${formalityDesc}.`);
      }
      if (tone && tone !== "none") {
          instructions.push(`- Adopt a ${tone} tone.`);
      }
      if (wordCount) {
          instructions.push(`- The response should be approximately ${wordCount} words long.`);
      }

      if (instructions.length > 0) {
          prompt += `\n\nAdditionally, please adhere to the following constraints for your response:\n${instructions.join('\n')}`;
      }
  }

  // --- Start: Collect Context ---
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
          otherDiagrams[diagramKey] = allAvailableDiagrams[diagramKey].plantUmlCode;
      }
  }
  // --- End: Collect Context ---

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
          return { ...prevState, sections: {...prevState.sections, introduction: result.introduction }, lastGenerated: 'introduction', error: undefined };
        case 'literatureReview':
          result = await generateLiteratureReview(agentInput);
          return { ...prevState, sections: {...prevState.sections, literatureReview: result.literatureReview }, lastGenerated: 'literatureReview', error: undefined };
        case 'systemAnalysis':
          result = await generateSystemAnalysis(agentInput);
          return { ...prevState, sections: {...prevState.sections, systemAnalysis: result.systemAnalysis }, lastGenerated: 'systemAnalysis', error: undefined };
        case 'designStrategy':
          result = await generateDesignStrategy(agentInput);
          return { ...prevState, sections: {...prevState.sections, designStrategy: result.designStrategy }, lastGenerated: 'designStrategy', error: undefined };
         case 'systemDesign':
          result = await generateSystemDesign(agentInput);
          return { ...prevState, sections: {...prevState.sections, systemDesign: result.systemDesign }, lastGenerated: 'systemDesign', error: undefined };
         case 'systemProgramming':
          result = await generateSystemProgramming(agentInput);
          return { ...prevState, sections: {...prevState.sections, systemProgramming: result.systemProgramming }, lastGenerated: 'systemProgramming', error: undefined };
         case 'systemTesting':
          result = await generateSystemTesting(agentInput);
          return { ...prevState, sections: {...prevState.sections, systemTesting: result.systemTesting }, lastGenerated: 'systemTesting', error: undefined };
        case 'conclusion':
          result = await generateConclusion(agentInput);
          return { ...prevState, sections: {...prevState.sections, conclusion: result.conclusion }, lastGenerated: 'conclusion', error: undefined };
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
    console.error(e);
    return { ...prevState, error: `An error occurred while generating '${itemToGenerate}'. Please try again.` };
  }
}

const CreateProjectSchema = z.object({
  proposalJson: z.string().min(1, 'Project proposal is required.'),
});

export async function handleCreateProjectFromProposal(
  prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const validatedFields = CreateProjectSchema.safeParse({
    proposalJson: formData.get('proposalJson'),
  });

  if (!validatedFields.success) {
    return { error: 'Invalid proposal data.' };
  }

  let proposal: ProjectProposal;
  try {
    proposal = JSON.parse(validatedFields.data.proposalJson);
  } catch (e) {
    return { error: 'Invalid JSON format.' };
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
        alt: projectData.title,
        aiHint: projectData.tags.slice(0, 2).join(' '),
        type: 'image'
      }],
      proposalData: validatedFields.data.proposalJson,
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
