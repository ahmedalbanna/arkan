
'use server';

import { requireUser } from './_utils/auth';
import { createLectureUnit } from '@/ai/flows/create-lecture-unit';
import { deductCredit } from './userActions';
import { logGeneration } from './analyticsActions';

export async function createLectureUnitAction(body: any) {
  const user = await requireUser();
  const result = await createLectureUnit(body);
  await deductCredit(user.id, 2);
  await logGeneration({ agentId: 'create-lecture-unit', userId: user.id, input: body, output: result, creditCost: 2 });
  return result;
}
