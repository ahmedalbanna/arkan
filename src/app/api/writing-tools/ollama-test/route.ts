
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ollamaTestFlow } from '@/ai/flows/ollama-example';
import { runWritingToolAction } from '@/app/actions/aiActions';

const inputSchema = z.object({
  prompt: z.string().min(1, 'Prompt cannot be empty.'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = inputSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      );
    }
    
    // We can use the existing server action for consistency and to ensure
    // authentication and credit deduction (if any) are handled centrally.
    const result = await runWritingToolAction('ollama-test', validation.data);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API /ollama-test] Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.', details: error.message },
      { status: 500 }
    );
  }
}
