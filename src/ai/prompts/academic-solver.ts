// src/ai/prompts/academic-solver.ts
'use server';

import { defaultModel } from '@/ai/config/models';
import { ai } from '@/ai/genkit';
import {
  AnalyzedDocumentSchema,
  AnalyzeDocumentInputSchema,
  SolvedDocumentSchema,
  SolveDocumentInputSchema,
} from '@/ai/schemas';

export const analysisPrompt = ai.definePrompt({
  name: 'analyzeAcademicDocumentPrompt',
  input: { schema: AnalyzeDocumentInputSchema },
  output: { schema: AnalyzedDocumentSchema },
  model: defaultModel,
  prompt: `You are an expert academic analyst. Your task is to analyze the following academic document content provided in Markdown. The document is a/an '{{{documentType}}}'.

    1.  Identify the main **subject** and a concise **title**.
    2.  Review the entire document and re-format it into a clean, well-structured **Markdown document**. Ensure questions, sub-questions, and options are clearly organized using headings, lists, and other appropriate markdown elements.
    3.  Identify the **language** of the document (e.g., "English", "Arabic", "Spanish").
    4.  Return the 'documentType' as provided in the input.

    Document Content:
    ---
    {{{markdownContent}}}
    ---
    `,
  config: {
    temperature: 0.3, // Low temperature for consistent structuring
  }
});

export const solvePrompt = ai.definePrompt({
  name: 'solveAcademicDocumentPrompt',
  input: { schema: SolveDocumentInputSchema },
  output: { schema: SolvedDocumentSchema },
  model: defaultModel,
  prompt: `You are an expert tutor specializing in **{{{analyzedDocument.subject}}}**. Your task is to provide a comprehensive and accurate solution to the following '{{{analyzedDocument.documentType}}}'. **You must provide your response in {{{analyzedDocument.language}}}**.

    {{#if contextMarkdown}}
    --- IMPORTANT CONTEXT ---
    Use the following text as the primary source of truth and context for answering the questions. Base your solutions on this material.
    {{{contextMarkdown}}}
    -------------------------
    {{/if}}

    For each question in the provided document, generate a detailed, well-structured solution. Present the final output as an array of question/solution pairs.

    - For each question, provide a step-by-step solution.
    - Format all mathematical equations and steps clearly using Markdown.
    - Ensure your final output is an array of objects, where each object contains a 'question' and its corresponding 'solution'.

    Document Questions:
    ---
    {{{analyzedDocument.structuredContent}}}
    ---
    `,
  config: {
    temperature: 0.4, // Slightly more creative for detailed explanations
    maxOutputTokens: 4096,
  }
});
