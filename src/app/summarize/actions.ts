
'use server';

import { summarizeProject } from '@/ai/flows/summarize-project';
import { z } from 'zod';
import { AGENTS } from '@/lib/agents';


const SummarizeSchema = z.object({
  projectDescription: z.string().min(50, { message: 'يجب أن يكون وصف المشروع 50 حرفًا على الأقل.' }),
});

interface FormState {
  summary?: string;
  technologies?: string[];
  progress?: string;
  error?: string;
}

export async function handleSummarize(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = SummarizeSchema.safeParse({
    projectDescription: formData.get('projectDescription'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.projectDescription?.[0],
    };
  }

  const agent = AGENTS.find(a => a.id === 'summarize-project');
  if (!agent) {
    return { error: 'Summarizer agent not configured.' };
  }

  try {
    const result = await summarizeProject({
      projectDescription: validatedFields.data.projectDescription,
      prompt: agent.prompt,
    });
    return { summary: result.summary, technologies: result.technologies, progress: result.progress };
  } catch (e) {
    console.error(e);
    return { error: 'حدث خطأ أثناء توليد الملخص. يرجى المحاولة مرة أخرى.' };
  }
}
