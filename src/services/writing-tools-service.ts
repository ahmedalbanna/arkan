
'use client';

import type { ParaphraseMode } from "@/ai/flows/paraphrase-text";
import type { SummarizeLength } from "@/ai/flows/summarize-text";
import type { CitationStyle } from "@/ai/flows/generate-citation";
import { ReactNode, SetStateAction } from "react";

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
export interface DetectAIApiVariables extends DetectAIVariables {
    token: string;
}
export interface GrammarCheckApiVariables extends GrammarCheckVariables {
    token: string;
}
export interface GenerateCitationApiVariables extends GenerateCitationVariables {
    token: string;
}
export interface FactCheckApiVariables extends FactCheckVariables {
    token: string;
}
export interface PlagiarismCheckApiVariables extends PlagiarismCheckVariables {
    token: string;
}


// Output Types
export interface ParaphraseTextOutput {
  paraphrasedText: string;
}
export interface SummarizeTextOutput {
  summary: string;
}
export interface GrammarCheckOutput {
    rewrittenText: string;
}
export interface GenerateQuizOutput {
    questions: SetStateAction<any[]>;
    quiz: string;
}
export interface HumanizeTextOutput {
    humanizedText: string;
}
export interface DetectAIOutput {
    analysis: ReactNode;
    score: number;
    isAI: boolean;
}
export interface GenerateCitationOutput {
    citation: string;
}
export interface FactCheckOutput {
    claims: {
        statement: string;
        status: 'Verified' | 'Inconclusive' | 'False';
        explanation: string;
        source: string;
    }[];
    originalityScore: number;
}
export interface PlagiarismCheckOutput {
    matches: {
        similarity: number;
        source: string;
    }[];
    originalityScore: number;
}


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
 * Calls the API to detect AI content in text.
 * @param variables - An object containing the text and auth token.
 * @returns A promise that resolves to the detection result.
 */
export async function detectAiContentApi(variables: DetectAIApiVariables): Promise<DetectAIOutput> {
    const { token, ...body } = variables;
    const response = await fetch('/api/writing-tools/ai-detector', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to detect AI content.');
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

/**
 * Calls the API to fact-check text.
 * @param variables - An object containing the text and auth token.
 * @returns A promise that resolves to the fact-check result.
 */
export async function factCheckApi(variables: FactCheckApiVariables): Promise<FactCheckOutput> {
    const { token, ...body } = variables;
    const response = await fetch('/api/writing-tools/fact-checker', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fact-check text.');
    }

    return response.json();
}


/**
 * Calls the API to check for plagiarism.
 * @param variables - An object containing the text and auth token.
 * @returns A promise that resolves to the plagiarism check result.
 */
export async function plagiarismCheckApi(variables: PlagiarismCheckApiVariables): Promise<PlagiarismCheckOutput> {
    const { token, ...body } = variables;
    const response = await fetch('/api/writing-tools/plagiarism-checker', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to check for plagiarism.');
    }

    return response.json();
}
