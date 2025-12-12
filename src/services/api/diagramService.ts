
'use client';

import type { GenerateDiagramOutput, ImageToTextOutput } from '@/ai/schemas';

/**
 * Calls the API to generate a new diagram.
 * @param body The request body containing the proposal, context, and diagram type.
 * @param token The user's authentication token.
 * @returns A promise that resolves to the generated diagram data, including the image URL and explanation.
 */
export async function generateDiagramApi(body: any, token: string): Promise<GenerateDiagramOutput & { imageUrl: string }> {
    const response = await fetch('/api/generate/diagrams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate diagram');
    }
    return await response.json();
}

/**
 * Calls the API to update an existing diagram from its PlantUML code.
 * @param plantUmlCode The new PlantUML code for the diagram.
 * @param token The user's authentication token.
 * @returns A promise that resolves to the updated diagram data.
 */
export async function updateDiagramApi(plantUmlCode: string, token: string): Promise<{ plantUmlCode: string; imageUrl: string }> {
    const response = await fetch('/api/generate/diagrams', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ intent: 'update_diagram', plantUmlCode }),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update diagram');
    }
    return await response.json();
}


/**
 * Calls the API to get an explanation for a diagram image.
 * @param body - The request body containing the image data URI and a prompt.
 * @param token - The user's authentication token.
 * @returns A promise that resolves to the explanation text.
 */
export async function explainDiagramApi(body: { imageDataUri: string, prompt: string }, token: string): Promise<ImageToTextOutput> {
    const response = await fetch('/api/actions/explain-diagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to explain diagram');
    }
    return await response.json();
}
