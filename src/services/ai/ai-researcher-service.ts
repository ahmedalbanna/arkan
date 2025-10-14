/**
 * خدمة باحث الذكاء الاصطناعي
 *
 * هذا الملف يحتوي على خدمات باحث الذكاء الاصطناعي
 */

'use client';

import { AIResearcherOutput } from '@/ai/schemas';
import type { AIResearcherVariables } from './writing-tools-service';

interface AIResearcherApiVariables extends AIResearcherVariables {
    token: string;
}

/**
 * Calls the API for the AI Researcher tool.
 */
export async function aiResearcherApi(variables: AIResearcherApiVariables): Promise<AIResearcherOutput> {
    const { token, ...body } = variables;
    const response = await fetch('/api/writing-tools/ai-researcher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error((await response.json()).message || 'AI Researcher failed.');
    const result = await response.json();
    // Extract data from enhanced API response structure
    return result.data || result;
}
