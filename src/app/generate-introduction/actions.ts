'use server';

import { generateIntroduction } from '@/ai/flows/generate-introduction';
import { ProjectProposalSchema, type ProjectProposal } from '@/ai/schemas';

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
  
  let proposalData: ProjectProposal;

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
