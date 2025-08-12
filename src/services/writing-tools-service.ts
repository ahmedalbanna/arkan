
'use client';

import type { ParaphraseMode } from "@/ai/flows/paraphrase-text";
import type { SummarizeLength } from "@/ai/flows/summarize-text";
import type { CitationStyle, GenerateCitationOutput } from "@/ai/flows/generate-citation";
import { ReactNode, SetStateAction } from "react";
import type { AIResearcherOutput } from '@/ai/flows/ai-researcher';
import type { TopicExplainerOutput } from '@/ai/flows/topic-explainer';
import type { GrammarCheckOutput } from '@/ai/flows/grammar-checker';
import type { GenerateQuizOutput } from '@/ai/flows/generate-quiz';
import type { DetectAIOutput } from '@/ai/flows/detect-ai-content';
import type { FactCheckOutput } from '@/ai/flows/fact-checker';
import type { HumanizeTextOutput } from '@/ai/flows/humanize-text';
import type { PlagiarismCheckOutput } from '@/ai/flows/plagiarism-checker';
import type { RewriteTextOutput, SummarizeTextWithRatioOutput } from '@/ai/flows/text-stylist';
import type { WriteDocumentOutput } from '@/ai/flows/write-document';


// Base types
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



// API Variable Types (include token)
export interface ParaphraseTextApiVariables extends ParaphraseTextVariables {
  token: string;
}
export interface SummarizeTextApiVariables extends SummarizeTextVariables {
  token: string;
}
export interface GenerateQuizApiVariables extends GenerateQuizVariables {
    token: string;
}
export interface HumanizeTextApiVariables extends HumanizeTextVariables {
    token: string;
}
export interface GrammarCheckApiVariables extends GrammarCheckVariables {
    token: string;
}
export interface GenerateCitationApiVariables extends GenerateCitationVariables {
    token: string;
}
export interface RewriteTextApiVariables extends RewriteTextVariables {
    token: string;
}
export interface SummarizeTextWithRatioApiVariables extends SummarizeTextWithRatioVariables {
    token: string;
}
export interface WriteDocumentApiVariables extends WriteDocumentVariables {
    token: string;
}



// Output Types
export interface ParaphraseTextOutput {
  paraphrasedText: string;
}
export interface SummarizeTextOutput {
  summary: string;
}

export type { GenerateQuizOutput, HumanizeTextOutput, DetectAIOutput, GrammarCheckOutput, GenerateCitationOutput, FactCheckOutput, PlagiarismCheckOutput, AIResearcherOutput, TopicExplainerOutput, RewriteTextOutput, SummarizeTextWithRatioOutput, WriteDocumentOutput };


/**
 * Calls the API to paraphrase text.
 * @param variables - An object containing the text, mode, and auth token.
 * @returns A promise that resolves to the paraphrased text output.
 */
export async function paraphraseTextApi(variables: ParaphraseTextApiVariables): Promise<ParaphraseTextOutput> {
  const { token, ...body } = variables;
  const response = await fetch('/api/writing-tools/paraphrase', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to paraphrase text.');
  }

  return response.json();
}

/**
 * Calls the API to summarize text.
 * @param variables - An object containing the text, length, and auth token.
 * @returns A promise that resolves to the summarized text output.
 */
export async function summarizeTextApi(variables: SummarizeTextApiVariables): Promise<SummarizeTextOutput> {
  const { token, ...body } = variables;
  const response = await fetch('/api/writing-tools/summarize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to summarize text.');
  }

  return response.json();
}


/**
 * Calls the API to generate a quiz from text.
 * @param variables - An object containing the text, number of questions, and auth token.
 * @returns a promise that resolves to the generated quiz output.
 */
export async function generateQuizApi(variables: GenerateQuizApiVariables): Promise<GenerateQuizOutput> {
  const { token, ...body } = variables;
  const response = await fetch('/api/writing-tools/generate-quiz', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to generate quiz.');
  }

  return response.json();
}

/**
 * Calls the API to humanize text.
 * @param variables - An object containing the text and auth token.
 * @returns A promise that resolves to the humanized text output.
 */
export async function humanizeTextApi(variables: HumanizeTextApiVariables): Promise<HumanizeTextOutput> {
    const { token, ...body } = variables;
    const response = await fetch('/api/writing-tools/humanize', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to humanize text.');
    }

    return response.json();
}

/**
 * Calls the API to check and correct grammar in text.
 * @param variables - An object containing the text and auth token.
 * @returns A promise that resolves to the corrected text output.
 */
export async function grammarCheckApi(variables: GrammarCheckApiVariables): Promise<GrammarCheckOutput> {
    const { token, ...body } = variables;
    const response = await fetch('/api/writing-tools/grammar-checker', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to check grammar.');
    }

    return response.json();
}

/**
 * Calls the API to generate a citation.
 * @param variables - An object containing the source text, style, and auth token.
 * @returns A promise that resolves to the generated citation.
 */
export async function generateCitationApi(variables: GenerateCitationApiVariables): Promise<GenerateCitationOutput> {
  const { token, ...body } = variables;
  const response = await fetch('/api/writing-tools/citation-generator', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to generate citation.');
  }

  return response.json();
}

export async function rewriteTextApi(variables: RewriteTextApiVariables): Promise<RewriteTextOutput> {
    const { token, ...body } = variables;
    const response = await fetch('/api/writing-tools/rewrite-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error((await response.json()).message || 'Rewrite failed.');
    return response.json();
}

export async function summarizeTextWithRatioApi(variables: SummarizeTextWithRatioApiVariables): Promise<SummarizeTextWithRatioOutput> {
    const { token, ...body } = variables;
    const response = await fetch('/api/writing-tools/summarize-with-ratio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error((await response.json()).message || 'Summarization failed.');
    return response.json();
}

/**
 * Calls the API to write a full document from a topic.
 * @param variables - An object containing the document details and auth token.
 * @returns A promise that resolves to the generated document content.
 */
export async function writeDocumentApi(variables: WriteDocumentApiVariables): Promise<WriteDocumentOutput> {
  const { token, ...body } = variables;
  const response = await fetch('/api/writing-tools/write-document', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error((await response.json()).message || 'Document generation failed.');
  return response.json();
}
