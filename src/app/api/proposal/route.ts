import { NextResponse } from 'next/server';
import { z } from 'zod';

const proposalSchema = z.object({
  category: z.string().min(1, { message: "Category is required" }),
  title: z.string().min(1, { message: "Title is required" }),
  objective: z.string().min(1, { message: "Objective is required" }),
  methodology: z.string().min(1, { message: "Methodology is required" }),
  expected_outcome: z.string().min(1, { message: "Expected outcome is required" }),
  timeline: z.string().min(1, { message: "Timeline is required" }),
  budget: z.number().positive({ message: "Budget must be a positive number" }),
  stakeholders: z.string().min(1, { message: "Stakeholders are required" }),
  success_criteria: z.string().min(1, { message: "Success criteria are required" }),
  evaluation: z.string().min(1, { message: "Evaluation plan is required" }),
  risks: z.string().min(1, { message: "Risks are required" }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = proposalSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    // For this prototype, we'll just return a success response with the new proposal data.
    const newProposal = {
      id: `proposal-${Date.now()}`, // simple id generation for example
      ...validation.data,
    };

    return NextResponse.json(newProposal, { status: 201 });

  } catch (error) {
    console.error('Error creating proposal:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
