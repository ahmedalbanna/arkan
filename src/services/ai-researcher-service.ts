
'use client';

import { AIResearcherOutput } from '@/ai/schemas';
import { authenticatedFetch } from '@/lib/api-client';
import type { AIResearcherVariables } from './writing-tools-service';

/**
 * Calls the API for the AI Researcher tool.
 * @param variables - An object containing the research topic and other parameters.
 * @returns A promise that resolves to the research result.
 */
export async function aiResearcherApi(variables: AIResearcherVariables): Promise<AIResearcherOutput> {
    return authenticatedFetch('/api/writing-tools/ai-researcher', {
        method: 'POST',
        body: JSON.stringify(variables),
    });
}
