'use server';

/**
 * @fileOverview This flow is deprecated and will be removed.
 * Its functionality is now part of the individual writing tools.
 */

import { z } from 'zod';

// Define schemas to avoid breaking imports, but mark as deprecated.
/** @deprecated */
export const GeneratePresentationOutlineInputSchema = z.object({
  prompt: z.string().optional(),
  documentation: z.string().optional(),
});
export type GeneratePresentationOutlineInput = z.infer<typeof GeneratePresentationOutlineInputSchema>;

/** @deprecated */
export const GeneratePresentationOutlineOutputSchema = z.object({
  cover: z.object({
    title: z.string(),
  }),
  outline: z.array(z.any()),
});
export type GeneratePresentationOutlineOutput = z.infer<typeof GeneratePresentationOutlineOutputSchema>;

/** @deprecated */
export async function generatePresentationOutline(
  input: GeneratePresentationOutlineInput
): Promise<GeneratePresentationOutlineOutput> {
  throw new Error('This function is deprecated and should not be used.');
}
