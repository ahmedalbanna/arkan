'use server';

import { generateProposal } from '@/ai/flows/generate-proposal';
import { type ProjectProposal } from '@/ai/schemas';
import { z } from 'zod';

const GenerateSchema = z.object({
  projectIdea: z.string().min(10, { message: 'يجب أن تكون فكرة المشروع 10 أحرف على الأقل.' }),
  prompt: z.string().min(1, { message: 'Prompt is required.' }),
});

interface FormState {
  proposal?: ProjectProposal;
  error?: string;
}

export async function handleGenerateProposal(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = GenerateSchema.safeParse({
    projectIdea: formData.get('projectIdea'),
    prompt: formData.get('prompt'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.projectIdea?.[0] || validatedFields.error.flatten().fieldErrors.prompt?.[0],
    };
  }

  try {
    const result = await generateProposal({
      projectIdea: validatedFields.data.projectIdea,
      prompt: validatedFields.data.prompt,
    });
    return { proposal: result };
  } catch (e) {
    console.error(e);
    return { error: 'حدث خطأ أثناء توليد المقترح. يرجى المحاولة مرة أخرى.' };
  }
}
