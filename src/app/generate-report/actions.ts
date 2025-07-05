'use server';

import { z } from 'zod';
import { ProjectProposalSchema, type ProjectProposal } from '@/ai/schemas';

import { generateIntroduction } from '@/ai/flows/generate-introduction';
import { generateLiteratureReview } from '@/ai/flows/generate-literature-review';
import { generateSystemAnalysis } from '@/ai/flows/generate-system-analysis';
import { generateDesignStrategy } from '@/ai/flows/generate-design-strategy';
import { generateSystemDesign } from '@/ai/flows/generate-system-design';
import { generateSystemProgramming } from '@/ai/flows/generate-system-programming';
import { generateSystemTesting } from '@/ai/flows/generate-system-testing';
import { generateConclusion } from '@/ai/flows/generate-conclusion';

export type SectionName = 
  | 'introduction'
  | 'literatureReview'
  | 'systemAnalysis'
  | 'designStrategy'
  | 'systemDesign'
  | 'systemProgramming'
  | 'systemTesting'
  | 'conclusion';

export interface ReportState {
  sections: {
    [key in SectionName]?: string;
  };
  error?: string;
  lastGenerated?: SectionName;
}

const GenerateSectionSchema = z.object({
  proposalJson: z.string().min(1, 'يرجى لصق محتوى مقترح المشروع.'),
  sectionToGenerate: z.enum([
    'introduction',
    'literatureReview',
    'systemAnalysis',
    'designStrategy',
    'systemDesign',
    'systemProgramming',
    'systemTesting',
    'conclusion',
  ]),
});


export async function handleGenerateSection(
  prevState: ReportState,
  formData: FormData
): Promise<ReportState> {

  const validatedFields = GenerateSectionSchema.safeParse({
    proposalJson: formData.get('proposalJson'),
    sectionToGenerate: formData.get('sectionToGenerate'),
  });

  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors;
    return {
      ...prevState,
      error: errors.proposalJson?.[0] || errors.sectionToGenerate?.[0],
    };
  }
  
  const { proposalJson, sectionToGenerate } = validatedFields.data;
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
  
  const prompt = formData.get(`prompt_${sectionToGenerate}`) as string | null;
  if (!prompt) {
    return { ...prevState, error: `لم يتم العثور على موجه للأمر للقسم '${sectionToGenerate}'.` };
  }

  const agentInput = {
    proposal: validatedProposal.data,
    prompt,
  }

  try {
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
      default:
        return { ...prevState, error: 'القسم المطلوب غير معروف.' };
    }
  } catch (e) {
    console.error(e);
    return { ...prevState, error: `حدث خطأ أثناء توليد قسم '${sectionToGenerate}'. يرجى المحاولة مرة أخرى.` };
  }
}
