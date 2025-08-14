
'use client';

import type { EvaluateContextOutput } from "@/ai/flows/evaluate-and-select-context";

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

/**
 * Calls the API to generate a full report based on a plan.
 * @param body The request body containing the project context and generation plan.
 * @param token The user's authentication token.
 * @returns A promise that resolves to an object of all generated sections.
 */
export async function generateFullReportApi(body: any, token: string): Promise<any> {
    const response = await fetch('/api/generate-full-report', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body),
    });
     if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate full report');
    }
    return await response.json();
}


/**
 * Calls the API to evaluate project context and get a generation plan.
 * @param body The request body containing the project context.
 * @param token The user's authentication token.
 * @returns A promise that resolves to the generation plan.
 */
export async function evaluateContextApi(body: any, token: string): Promise<EvaluateContextOutput> {
    const response = await fetch('/api/evaluate-context', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to evaluate context');
    }
    return await response.json();
}
