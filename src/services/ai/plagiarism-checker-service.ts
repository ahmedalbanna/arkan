/**
 * خدمة فحص الانتحال
 *
 * هذا الملف يحتوي على خدمات فحص الانتحال والتحقق من الأصالة
 */

'use client';

import { PlagiarismCheckOutput } from '@/ai/schemas';
import type { PlagiarismCheckVariables } from './writing-tools-service';

interface PlagiarismCheckApiVariables extends PlagiarismCheckVariables {
    token: string;
}

/**
 * Calls the API to check for plagiarism.
 * @param variables - An object containing the text and auth token.
 * @returns A promise that resolves to the plagiarism check result.
 */
export async function plagiarismCheckApi(variables: PlagiarismCheckApiVariables): Promise<PlagiarismCheckOutput> {
    const { token, ...body } = variables;
    const response = await fetch('/api/writing-tools/plagiarism-checker', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to check for plagiarism.');
    }

    const result = await response.json();
    // Extract data from enhanced API response structure
    return result.data || result;
}
