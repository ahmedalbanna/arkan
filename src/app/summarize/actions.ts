'use server';

import { summarizeProject } from '@/ai/flows/summarize-project';
import { z } from 'zod';

const SummarizeSchema = z.object({
  projectDescription: z.string().min(50, { message: 'يجب أن يكون وصف المشروع 50 حرفًا على الأقل.' }),
  prompt: z.string().min(1, { message: 'Prompt is required.' }),
});

interface FormState {
  summary?: string;
  progress?: string;
  error?: string;
}

export async function handleSummarize(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = SummarizeSchema.safeParse({
    projectDescription: formData.get('projectDescription'),
    prompt: formData.get('prompt'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.projectDescription?.[0] || validatedFields.error.flatten().fieldErrors.prompt?.[0],
    };
  }

  try {
    const result = await summarizeProject({
      projectDescription: validatedFields.data.projectDescription,
      prompt: validatedFields.data.prompt,
    });
    return { summary: result.summary, progress: result.progress };
  } catch (e) {
    console.error(e);
    return { error: 'حدث خطأ أثناء توليد الملخص. يرجى المحاولة مرة أخرى.' };
  }
}
