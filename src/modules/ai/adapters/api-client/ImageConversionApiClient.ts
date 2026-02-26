'use client';

import "reflect-metadata";
import { injectable } from "tsyringe";

const API_ENDPOINT = '/api/svg-conversion';

@injectable()
export class ImageConversionApiClient {
    async convertImageToSvgApi(formData: FormData): Promise<string> {
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
                // This often indicates a network error.
                throw new Error("Network error. Could not connect to the conversion service. Please check your network connection.");
            }
            throw error;
        }
    }
}
