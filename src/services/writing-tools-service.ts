
'use client';

import type { ParaphraseMode, SummarizeLength, CitationStyle } from "@/ai/schemas";

// Base types for form data
export interface ParaphraseTextVariables {
  text: string;
  mode: ParaphraseMode;
}
export interface SummarizeTextVariables {
  text: string;
  length: SummarizeLength;
}
export interface GenerateQuizVariables {
    text: string;
    numQuestions: number;
}
export interface HumanizeTextVariables {
    text: string;
}
export interface DetectAIVariables {
    text: string;
}
export interface GrammarCheckVariables {
    text: string;
}
export interface GenerateCitationVariables {
    sourceText: string;
    style: CitationStyle;
}
export interface FactCheckVariables {
    text: string;
}
export interface PlagiarismCheckVariables {
    text: string;
}
export interface AIResearcherVariables {
    topic: string;
}
export interface TopicExplainerVariables {
    topic: string;
}
export interface RewriteTextVariables {
    text: string;
    style: string;
}
export interface SummarizeTextWithRatioVariables {
    text: string;
    ratio: number;
}
export interface WriteDocumentVariables {
    topic: string;
    documentType: string;
    knowledge?: string;
    tableOfContents?: string[];
}
export interface GenerateIdeasVariables {
    specialization: string;
    domain?: string;
    region?: string;
    circumstances?: string;
    additionalContext?: string;
}

/**
 * A generic API handler for all writing tools.
 * @param endpoint The API endpoint to call (e.g., '/api/writing-tools/paraphrase').
 * @param variables An object containing the request body and the auth token.
 * @returns A promise that resolves to the API response.
 */
export async function writingToolApi<TRequest, TResponse>(
  endpoint: string,
  variables: { data: TRequest; token: string }
): Promise<TResponse> {
  const { token, data } = variables;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `API call to ${endpoint} failed.`);
  }

  return response.json();
}
