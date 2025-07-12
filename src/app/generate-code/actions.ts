
'use server';

import { z } from 'zod';
import { generateCode } from '@/ai/flows/generate-code';

export interface CodeGenerationState {
  prompt?: string;
  html?: string;
  css?: string;
  javascript?: string;
  error?: string;
}

const GenerateCodeSchema = z.object({
  prompt: z.string().min(10, { message: 'Prompt must be at least 10 characters long.' }),
});


export async function handleGenerateCode(
  prevState: CodeGenerationState,
  formData: FormData
): Promise<CodeGenerationState> {
  const validatedFields = GenerateCodeSchema.safeParse({
    prompt: formData.get('prompt'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.prompt?.[0],
    };
  }

  const prompt = validatedFields.data.prompt;

  try {
    const result = await generateCode({ prompt });
    
    return {
        prompt,
        html: result.html,
        css: result.css,
        javascript: result.javascript
    };
  } catch (e) {
    console.error(e);
    return { error: 'An error occurred while generating the code. Please try again.' };
  }
}
