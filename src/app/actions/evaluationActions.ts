'use server';

import type { EvaluateReportInput, EvaluateReportOutput } from '@/lib/schemas';
import { requireUser } from './_utils/auth';
import { factCheckText } from '@/ai/flows/fact-checker';

// Placeholder evaluation using factCheck or another flow. Replace with actual evaluation flow when available.
export async function evaluateReportAction(body: EvaluateReportInput): Promise<EvaluateReportOutput> {
  await requireUser();
  const res: any = await factCheckText({ text: body.content });
  return {
    overallScore: 0.8,
    feedback: 'Evaluation placeholder: Needs implementation with real evaluation flow.',
    sections: [],
  } as any;
}
