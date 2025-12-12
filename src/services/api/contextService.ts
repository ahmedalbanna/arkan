
'use client';

import type { AnalyzeContextOutput } from '@/ai/schemas';
import type { ExternalContext } from '@/lib/types';


interface AnalyzeContextVariables {
  prompt: string;
  contextFiles: Omit<ExternalContext, 'content' | 'type'> & { type: string, content: string }[];
  token: string;
}

export async function analyzeContextApi(variables: AnalyzeContextVariables): Promise<AnalyzeContextOutput> {
  const { prompt, contextFiles, token } = variables;
  const response = await fetch('/api/actions/analyze-context', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ prompt, contextFiles }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Analysis failed.');
  }
  return response.json();
}
