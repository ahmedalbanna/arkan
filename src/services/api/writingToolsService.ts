
'use client';

import type { CitationStyle, DiagramTypeSchema, ParaphraseMode, SummarizeLength } from "@/ai/schemas";
import { z } from "zod";
import { apiService } from "./apiService";

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
    questionType: 'multiple-choice' | 'true-false' | 'direct-question';
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
export interface IdeaGenerationVariables {
    specialization: string;
    domain?: string;
    region?: string;
    circumstances?: string;
    additionalContext?: string;
}
export interface GeneratePresentationOutlineVariables {
    prompt: string;
    documentation?: string;
}
export interface GeneratePlantUMLVariables {
    description: string;
    diagramType: z.infer<typeof DiagramTypeSchema>;
}

export interface ManipulateTextVariables {
    textToManipulate: string;
    command: string;
}
export interface TranslateTextVariables {
    text: string;
    targetLang: string;
}
export interface SolveAssignmentsVariables {
    text: string;
}
export interface GenerateProjectBlueprintVariables {
    projectName: string;
    projectType: string;
    description: string;
    targetAudience: string;
    complexity: 'Simple' | 'Medium' | 'Complex' | 'Enterprise';
    features: string;
    techStack?: string;
    budget?: string;
    timeline?: string;
}


/**
 * A generic API handler for all writing tools.
 * It now uses the centralized apiService.
 * @param endpoint The specific API endpoint for the tool (e.g., '/api/writing-tools/summarize').
 * @param variables An object containing the request body and the auth token.
 * @returns A promise that resolves to the API response.
 */
export async function writingToolApi<TRequest, TResponse>(
    endpoint: string,
    variables: { data: TRequest; token: string }
): Promise<TResponse> {
    const { token, data } = variables;
    return apiService({
        endpoint,
        method: 'POST',
        data,
        token
    });
}
