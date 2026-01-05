
'use server';

import { requireUser } from './_utils/auth';
import { generateReportSection } from '@/ai/flows/generate-report-section';
import { deductCredit } from './userActions';
import { logGeneration } from './analyticsActions';

export async function generateReportSectionAction(body: any) {
  const user = await requireUser();
  const result = await generateReportSection(body);
  await deductCredit(user.id, 2);
  await logGeneration({ agentId: 'generate-report-section', userId: user.id, input: body, output: result, creditCost: 2 });
  return result;
}
