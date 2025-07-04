'use server';

import { generateProposal, type GenerateProposalOutput } from '@/ai/flows/generate-proposal';
import { z } from 'zod';

const GenerateSchema = z.object({
  projectIdea: z.string().min(10, { message: 'يجب أن تكون فكرة المشروع 10 أحرف على الأقل.' }),
});

interface FormState {
  proposal?: GenerateProposalOutput;
  error?: string;
}

export async function handleGenerateProposal(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = GenerateSchema.safeParse({
    projectIdea: formData.get('projectIdea'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.projectIdea?.[0],
    };
  }

  try {
    const result = await generateProposal({
      projectIdea: validatedFields.data.projectIdea,
    });
    return { proposal: result };
  } catch (e) {
    console.error(e);
    return { error: 'حدث خطأ أثناء توليد المقترح. يرجى المحاولة مرة أخرى.' };
  }
}
