

'use server';

/**
 * @fileOverview An AI agent for generating images from a text prompt.
 * - generateImage
 */

import { ai } from '@/modules/ai/infrastructure/services/Genkit';
import { z as _z } from 'zod';
import { GenerateImageInputSchema, type GenerateImageInput, GenerateImageOutputSchema, type GenerateImageOutput } from '@/modules/ai/domain/schemas';

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
  return generateImageFlow(input);
}

const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: GenerateImageInputSchema,
    outputSchema: GenerateImageOutputSchema,
  },
  async ({ prompt }: any) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-lite-preview-image-generation',
      prompt: prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media || !media.url) {
      throw new Error("Image generation failed to produce an image.");
    }

    return { imageUrl: media.url };
  }
);
