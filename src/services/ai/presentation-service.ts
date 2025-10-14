/**
 * خدمة توليد العروض التقديمية
 *
 * هذا الملف يحتوي على خدمات توليد العروض التقديمية
 */

'use client';

import type { GeneratePresentationOutlineInput, GeneratePresentationOutlineOutput, GeneratePresentationOutput } from '@/ai/schemas';

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
    const result = await response.json();
    // Extract data from enhanced API response structure
    return result.data || result;
}

/**
 * Calls the API to generate a presentation outline from a topic.
 */
export async function generatePresentationOutlineApi(variables: GeneratePresentationOutlineInput, token: string): Promise<GeneratePresentationOutlineOutput> {
    const response = await fetch('/api/generate/presentation-outline', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(variables),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate presentation outline');
    }
    const result = await response.json();
    // Extract data from enhanced API response structure
    return result.data || result;
}
