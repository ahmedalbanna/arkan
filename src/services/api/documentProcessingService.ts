
'use client';

/**
 * Calls the API to process an uploaded file (PDF, Image, Text, etc.) and extract its content.
 * @param formData The form data containing the file.
 * @param token The user's authentication token.
 * @returns A promise that resolves to the extracted markdown text.
 */
export async function processFileApi(formData: FormData, token: string): Promise<{ markdown: string }> {
    const response = await fetch('/api/process-file', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to process file.');
    }
    return await response.json();
}

/**
 * Calls the API to process an uploaded file (PDF, Image, Text, etc.) and returns its content as a data URI or text.
 * This is now a more generic function. The AI flow will handle the specific processing.
 * @param formData The form data containing the file.
 * @param token The user's authentication token.
 * @returns A promise that resolves to the file content as a string (either data URI or plain text).
 */
export async function readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onabort = () => reject(new Error('File reading was aborted.'));
        reader.onerror = () => reject(new Error('Failed to read file.'));
        reader.onload = () => {
            resolve(reader.result as string);
        };

        const isTextFile = file.type.startsWith('text/') || file.name.endsWith('.md');
        if (isTextFile) {
            reader.readAsText(file);
        } else {
            reader.readAsDataURL(file);
        }
    });
}