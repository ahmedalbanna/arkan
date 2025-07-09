import { NextResponse } from 'next/server';
import { z } from 'zod';
import { summarizeProject } from '@/ai/flows/summarize-project';

const summarizeSchema = z.object({
  projectDescription: z.string().min(50, { message: 'Project description must be at least 50 characters long.' }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = summarizeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { projectDescription } = validation.data;
    const result = await summarizeProject({
      projectDescription,
      prompt: ''
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json({ message: 'An unexpected error occurred while generating the summary.' }, { status: 500 });
  }
}
