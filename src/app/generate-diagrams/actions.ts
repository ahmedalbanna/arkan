'use server';

import { z } from 'zod';
import { ProjectProposalSchema, type ProjectProposal } from '@/ai/schemas';

import { generateUseCaseDiagram } from '@/ai/flows/generate-use-case-diagram';
import { generateClassDiagram } from '@/ai/flows/generate-class-diagram';
import { generateSequenceDiagram } from '@/ai/flows/generate-sequence-diagram';
import { generateActivityDiagram } from '@/ai/flows/generate-activity-diagram';
import { generateComponentDiagram } from '@/ai/flows/generate-component-diagram';
import { generateArchimateDiagram } from '@/ai/flows/generate-archimate-diagram';

export type DiagramType = 
  | 'useCase'
  | 'class'
  | 'sequence'
  | 'activity'
  | 'component'
  | 'archimate';

export interface DiagramState {
  plantUmlCode?: string;
  error?: string;
  lastGenerated?: DiagramType;
}

const GenerateDiagramSchema = z.object({
  proposalJson: z.string().min(1, 'يرجى لصق محتوى مقترح المشروع.'),
  diagramToGenerate: z.enum([
    'useCase',
    'class',
    'sequence',
    'activity',
    'component',
    'archimate',
  ]),
});


export async function handleGenerateDiagram(
  prevState: DiagramState,
  formData: FormData
): Promise<DiagramState> {

  const validatedFields = GenerateDiagramSchema.safeParse({
    proposalJson: formData.get('proposalJson'),
    diagramToGenerate: formData.get('diagramToGenerate'),
  });

  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors;
    return {
      ...prevState,
      error: errors.proposalJson?.[0] || errors.diagramToGenerate?.[0],
    };
  }
  
  const { proposalJson, diagramToGenerate } = validatedFields.data;
  let proposalData: ProjectProposal;

  try {
    proposalData = JSON.parse(proposalJson);
  } catch (e) {
    return { ...prevState, error: 'صيغة JSON غير صالحة. يرجى التحقق من المحتوى.' };
  }

  const validatedProposal = ProjectProposalSchema.safeParse(proposalData);

  if (!validatedProposal.success) {
    return {
      ...prevState,
      error: 'بيانات المقترح غير متوافقة مع الهيكل المطلوب.',
    };
  }

  try {
    let result;
    switch (diagramToGenerate) {
      case 'useCase':
        result = await generateUseCaseDiagram(validatedProposal.data);
        break;
      case 'class':
        result = await generateClassDiagram(validatedProposal.data);
        break;
      case 'sequence':
        result = await generateSequenceDiagram(validatedProposal.data);
        break;
      case 'activity':
        result = await generateActivityDiagram(validatedProposal.data);
        break;
      case 'component':
        result = await generateComponentDiagram(validatedProposal.data);
        break;
      case 'archimate':
        result = await generateArchimateDiagram(validatedProposal.data);
        break;
      default:
        return { ...prevState, error: 'نوع المخطط المطلوب غير معروف.' };
    }
    return { ...prevState, plantUmlCode: result.plantUmlCode, lastGenerated: diagramToGenerate, error: undefined };

  } catch (e) {
    console.error(e);
    return { ...prevState, error: `حدث خطأ أثناء توليد مخطط '${diagramToGenerate}'. يرجى المحاولة مرة أخرى.` };
  }
}
