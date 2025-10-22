
'use client';

import { DetectAIOutput } from '@/ai/schemas';
import { authenticatedFetch } from '@/lib/api-client';
import type { DetectAIVariables } from './writing-tools-service';

/**
 * Calls the API to detect AI content in text.
 * @param variables - An object containing the text to be analyzed.
 * @returns A promise that resolves to the detection result.
 */
export async function detectAiContentApi(variables: DetectAIVariables): Promise<DetectAIOutput> {
    return authenticatedFetch('/api/writing-tools/ai-detector', {
        method: 'POST',
        body: JSON.stringify(variables),
    });
}
