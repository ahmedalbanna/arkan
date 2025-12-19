
'use client';


/**
 * Calls the API to generate a single report section.
 * @param body The request body containing the generation context.
 * @param token The user's authentication token.
 * @param endpoint The API endpoint to call.
 * @returns A promise that resolves to the generated section data.
 */
export async function generateReportSectionApi(body: any, token: string, endpoint: string = '/api/generate/section'): Promise<any> {
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to call ${endpoint}`);
    }
    return await response.json();
}
