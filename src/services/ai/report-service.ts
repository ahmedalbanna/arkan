/**
 * خدمة توليد التقارير
 *
 * هذا الملف يحتوي على خدمات توليد التقارير وأقسامها
 */

'use client';


/**
 * Calls the API to generate a single report section.
 * @param body The request body containing the generation context.
 * @param token The user's authentication token.
 * @returns A promise that resolves to the generated section data.
 */
export async function generateReportSectionApi(body: any, token: string): Promise<any> {
    try {
        const response = await fetch('/api/generate/report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            let errorMessage = 'Failed to generate report section';
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (parseError) {
                errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();

        // Validate response structure
        if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
            throw new Error('Empty response from server');
        }

        return data;
    } catch (error) {
        console.error('Report generation API error:', error);
        throw error instanceof Error ? error : new Error('Network error occurred');
    }
}
