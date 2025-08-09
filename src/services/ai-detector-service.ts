
'use client';

import type { DetectAIVariables, DetectAIOutput } from './writing-tools-service';

interface DetectAIApiVariables extends DetectAIVariables {
    token: string;
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
