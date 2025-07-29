
'use client';

export async function processPdfToMarkdown(formData: FormData, token: string): Promise<{ markdown: string }> {
    const response = await fetch('/api/document-processing/pdf-to-markdown', { 
        method: 'POST', 
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData 
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to process PDF.');
    }
    return await response.json();
}

export async function processImageToText(formData: FormData, token: string): Promise<{ text: string }> {
    const response = await fetch('/api/document-processing/image-to-text', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to process image.');
    }
    return await response.json();
}
