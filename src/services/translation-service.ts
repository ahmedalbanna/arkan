'use client';

import type { TranslateTextOutput, TranslateVariables } from '@/lib/types';

/**
 * Translates a given piece of text to a target language via the API.
 * @param variables - An object containing the text to translate and the target language.
 * @param token - The authentication token for the user.
 * @returns A promise that resolves to the translated text output.
 */
export async function translateText(variables: TranslateVariables, token: string): Promise<TranslateTextOutput> {
  const response = await fetch('/api/translate/text', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(variables),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Translation failed');
  }

  return response.json();
}
