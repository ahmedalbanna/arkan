
'use client';

import type { GeneratePresentationOutput } from '@/ai/schemas';

/**
 * Calls the API to generate a presentation based on the provided context.
 * @param variables - An object containing the request body and the user's auth token.
 * @returns A promise that resolves to the generated presentation data.
 */
export async function generatePresentationApi(variables: { body: any, token: string }): Promise<GeneratePresentationOutput> {
    const response = await fetch('/api/generate/presentation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${variables.token}`
        },
        body: JSON.stringify(variables.body),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate presentation');
    }
    return await response.json();
}
