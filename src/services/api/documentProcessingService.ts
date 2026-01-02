
'use client';
import { apiService } from './apiService';

/**
 * Calls the API to process an uploaded file (PDF, Image, Text, etc.) and extract its content.
 */
export async function processFileApi(formData: FormData, token: string): Promise<{ markdown: string }> {
    return apiService({
      endpoint: '/api/process-file',
      method: 'POST',
      data: formData,
      token,
      isFormData: true
    });
}

/**
 * Reads a file from the client and returns its content as a string (either data URI or plain text).
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
