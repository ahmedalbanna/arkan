
'use client';

import type { AnalyzeContextOutput, ExternalContext } from '@/ai/schemas';

interface AnalyzeContextVariables {
  prompt: string;
  contextFiles: Omit<ExternalContext, 'content'>[]; // Content is handled on the server
  token: string;
}

export async function analyzeContextApi(variables: AnalyzeContextVariables): Promise<AnalyzeContextOutput> {
  const { prompt, contextFiles, token } = variables;
  const response = await fetch('/api/analyze-context', {
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
