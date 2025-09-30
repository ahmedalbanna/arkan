/**
 * خدمة فحص الحقائق
 *
 * هذا الملف يحتوي على خدمات فحص الحقائق والتحقق من المعلومات
 */

'use client';

import { FactCheckOutput } from '@/ai/schemas';
import type { FactCheckVariables } from './writing-tools-service';

interface FactCheckApiVariables extends FactCheckVariables {
    token: string;
}

/**
 * Calls the API to fact-check text.
 * @param variables - An object containing the text and auth token.
 * @returns A promise that resolves to the fact-check result.
 */
export async function factCheckApi(variables: FactCheckApiVariables): Promise<FactCheckOutput> {
    const { token, ...body } = variables;
    const response = await fetch('/api/writing-tools/fact-checker', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fact-check text.');
    }

    return response.json();
}
