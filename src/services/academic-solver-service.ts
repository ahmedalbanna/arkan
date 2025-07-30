
'use client';

import type { AnalyzedDocument, SolvedDocument, AcademicDocumentType } from '@/ai/flows/academic-solver.shared';

interface AnalyzeVariables {
  markdown: string;
  documentType: AcademicDocumentType;
  token: string;
}

interface SolveVariables {
  analyzedDocument: AnalyzedDocument;
  contextMarkdown?: string;
  token: string;
}

export async function analyzeApi(variables: AnalyzeVariables): Promise<AnalyzedDocument> {
  const { markdown, documentType, token } = variables;
  const response = await fetch('/api/academic-solver/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ markdown, documentType }),
  });
  if (!response.ok) throw new Error((await response.json()).message || 'Analysis failed.');
  return response.json();
}

export async function solveApi(variables: SolveVariables): Promise<SolvedDocument> {
  const { analyzedDocument, contextMarkdown, token } = variables;
  const response = await fetch('/api/academic-solver/solve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ analyzedDocument, contextMarkdown }),
  });
  if (!response.ok) throw new Error((await response.json()).message || 'Solving failed.');
  return response.json();
}
