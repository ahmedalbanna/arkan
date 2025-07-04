import { NextResponse } from 'next/server';
import { z } from 'zod';

const proposalSchema = z.object({
  category: z.string().min(1, { message: 'Category is required' }),
  title: z.string().min(1, { message: 'Title is required' }),
  objective: z.string().min(1, { message: 'Objective is required' }),
  methodology: z.string().min(1, { message: 'Methodology is required' }),
  expected_outcome: z.array(z.string().min(1)).min(1, { message: "At least one expected outcome is required" }),
  timeline: z.object({
    startDate: z.string().min(1, { message: "Start date is required" }),
    endDate: z.string().min(1, { message: "End date is required" }),
    phases: z.array(z.object({
      name: z.string().min(1, { message: "Phase name is required" }),
      durationWeeks: z.number().positive({ message: "Duration must be positive" }),
    })).min(1, { message: "At least one phase is required" }),
  }),
  budget: z.object({
    totalAmount: z.number().positive({ message: 'Total amount must be positive' }),
    currency: z.string().min(1, { message: "Currency is required" }),
    breakdown: z.array(z.object({
      item: z.string().min(1, { message: "Budget item is required" }),
      cost: z.number().positive({ message: "Cost must be positive" }),
    })).min(1, { message: "At least one budget breakdown item is required" }),
  }),
  stakeholders: z.array(z.object({
    name: z.string().min(1, { message: "Stakeholder name is required" }),
    role: z.string().min(1, { message: "Stakeholder role is required" }),
    interest: z.string().min(1, { message: "Stakeholder interest is required" }),
  })).min(1, { message: "At least one stakeholder is required" }),
  success_criteria: z.array(z.string().min(1)).min(1, { message: "At least one success criterion is required" }),
  evaluation: z.string().min(1, { message: 'Evaluation plan is required' }),
  risks: z.array(z.object({
    description: z.string().min(1, { message: "Risk description is required" }),
    mitigation: z.string().min(1, { message: "Mitigation strategy is required" }),
  })).min(1, { message: "At least one risk is required" }),
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
