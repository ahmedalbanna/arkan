
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ollamaTestFlow } from '@/ai/flows/ollama-example';

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
    
    // Call the flow directly, bypassing the authenticated runWritingToolAction
    const result = await ollamaTestFlow(validation.data);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API /ollama-test] Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.', details: error.message },
      { status: 500 }
    );
  }
}
