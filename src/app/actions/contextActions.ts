'use server';

import { analyzeContext } from '@/ai/flows/analyze-context';
import type { ExternalContext } from '@/lib/types';
import { requireUser } from './_utils/auth';

export async function analyzeContextAction(input: { prompt: string; contextFiles: (Omit<ExternalContext, 'content' | 'type'> & { type: string; content: string })[] }) {
  await requireUser();
  return analyzeContext({ prompt: input.prompt, contextFiles: input.contextFiles });
}
