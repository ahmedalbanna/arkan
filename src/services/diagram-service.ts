'use client';

/**
 * Calls the API to get an AI-generated explanation for a diagram.
 * @param imageDataUri The diagram image encoded as a data URI.
 * @param token The user's authentication token.
 * @returns A promise that resolves to the explanation object.
 */
export async function explainDiagramApi(imageDataUri: string, token: string) {
    const response = await fetch('/api/explain-diagram', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ imageDataUri }),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to explain diagram');
    }
    return await response.json();
}
