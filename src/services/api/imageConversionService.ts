'use client';

const API_ENDPOINT = 'http://185.190.140.93:9003/api/convert';

export async function convertImageToSvgApi(formData: FormData): Promise<string> {
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Failed to convert image on the server.');
        }

        return await response.text();
    } catch (error) {
        if (error instanceof TypeError) {
            // This often indicates a network error or CORS issue
            throw new Error("Network error or CORS issue. Could not connect to the conversion service. Please check your network or if the service is running.");
        }
        throw error;
    }
}
