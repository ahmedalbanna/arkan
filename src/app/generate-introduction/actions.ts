'use server';

import { generateIntroduction, type GenerateIntroductionOutput } from '@/ai/flows/generate-introduction';
import { z } from 'zod';
import type { GenerateProposalOutput } from '@/ai/flows/generate-proposal';

// This is the full proposal schema, used for validation.
// It must match the schema in generate-introduction.ts and generate-proposal.ts.
const ProjectProposalSchema = z.object({
  category: z.string(),
  title: z.string(),
  objective: z.string(),
  methodology: z.string(),
  expected_outcome: z.array(z.string()),
  timeline: z.object({
    startDate: z.string(),
    endDate: z.string(),
    phases: z.array(z.object({ name: z.string(), durationWeeks: z.number() })),
  }),
  budget: z.object({
    totalAmount: z.number(),
    currency: z.string(),
    breakdown: z.array(z.object({ item: z.string(), cost: z.number() })),
  }),
  stakeholders: z.array(z.object({ name: z.string(), role: z.string(), interest: z.string() })),
  success_criteria: z.array(z.string()),
  evaluation: z.string(),
  risks: z.array(z.object({ description: z.string(), mitigation: z.string() })),
});

interface FormState {
  introduction?: string;
  error?: string;
}

export async function handleGenerateIntroduction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const proposalJson = formData.get('proposalJson') as string;

  if (!proposalJson) {
    return { error: 'يرجى لصق محتوى مقترح المشروع.' };
  }
  
  let proposalData: GenerateProposalOutput;

  try {
    proposalData = JSON.parse(proposalJson);
  } catch (e) {
    return { error: 'صيغة JSON غير صالحة. يرجى التحقق من المحتوى.' };
  }

  const validatedFields = ProjectProposalSchema.safeParse(proposalData);

  if (!validatedFields.success) {
    console.error(validatedFields.error.flatten());
    return {
      error: 'بيانات المقترح غير متوافقة مع الهيكل المطلوب.',
    };
  }

  try {
    const result = await generateIntroduction(validatedFields.data);
    return { introduction: result.introduction };
  } catch (e) {
    console.error(e);
    return { error: 'حدث خطأ أثناء توليد المقدمة. يرجى المحاولة مرة أخرى.' };
  }
}
