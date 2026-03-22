'use client';

import { injectable } from 'tsyringe';
import { apiService } from '@/infrastructure/api/ApiService';

const API_ENDPOINT = '/api/svg-conversion';

@injectable()
export class ImageConversionApiClient {
  async convertImageToSvgApi(formData: FormData): Promise<string> {
    try {
      return await apiService<FormData, string>({
        endpoint: API_ENDPOINT,
        method: 'POST',
        data: formData,
        isFormData: true,
        responseType: 'text',
      });
    } catch (error: unknown) {
      if (error instanceof TypeError) {
        throw new Error('Network error. Could not connect to the conversion service. Please check your network connection.');
      }

      if (error instanceof Error) {
        throw error;
      }

      throw new Error('Failed to convert image on the server.');
    }
  }
}
