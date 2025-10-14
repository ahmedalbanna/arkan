/**
 * خدمة تقييم التقارير
 *
 * هذا الملف يحتوي على خدمات تقييم التقارير والمستندات
 */

'use client';

import type { EvaluateReportInput, EvaluateReportOutput } from "@/ai/schemas";

interface EvaluateReportApiVariables {
    body: EvaluateReportInput;
    token: string;
}

/**
 * Calls the API to evaluate a generated report against acceptance criteria.
 * @param variables - An object containing the request body and the user's auth token.
 * @returns A promise that resolves to the structured evaluation output.
 */
export async function evaluateReportApi(variables: EvaluateReportApiVariables): Promise<EvaluateReportOutput> {
    const response = await fetch('/api/evaluate-report', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${variables.token}`,
        },
        body: JSON.stringify(variables.body),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to evaluate report');
    }
    const result = await response.json();
    // Extract data from enhanced API response structure
    return result.data || result;
}
