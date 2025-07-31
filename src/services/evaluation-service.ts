'use client';

import type { EvaluateReportInput, EvaluateReportOutput } from "@/ai/flows/evaluate-report";

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
    return response.json();
}
