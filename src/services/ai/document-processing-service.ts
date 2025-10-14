/**
 * خدمة معالجة المستندات
 *
 * هذا الملف يحتوي على خدمات معالجة المستندات وتحويلها إلى Markdown
 */

'use client';

/**
 * Calls the API to process an uploaded file (PDF, Image, Text, etc.) and extract its content.
 * @param formData The form data containing the file.
 * @param token The user's authentication token.
 * @returns A promise that resolves to the extracted markdown text.
 */
export async function processFileApi(formData: FormData, token: string): Promise<{ markdown: string }> {
    const response = await fetch('/api/document-processing/process-file', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to process file.');
    }
    const result = await response.json();
    // Extract data from enhanced API response structure
    return result.data || result;
}
