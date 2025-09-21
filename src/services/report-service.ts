

'use client';


/**
 * Calls the API to generate a single report section.
 * @param body The request body containing the generation context.
 * @param token The user's authentication token.
 * @returns A promise that resolves to the generated section data.
 */
export async function generateReportSectionApi(body: any, token: string): Promise<any> {
    const response = await fetch('/api/generate/report', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate report section');
    }
    return await response.json();
}
