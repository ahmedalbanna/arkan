
'use client';

import type { TranslateTextOutput, TranslateVariables, AnyProjectProposal, PresentationHistoryEntry } from '@/lib/types';

/**
 * Translates a given piece of text to a target language via the API.
 * @param variables - An object containing the text to translate and the target language.
 * @param token - The authentication token for the user.
 * @returns A promise that resolves to the translated text output.
 */
export async function translateTextApi(variables: TranslateVariables, token: string): Promise<TranslateTextOutput> {
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

/**
 * Translates a full project proposal object.
 * @param variables - An object containing the proposal object and target language.
 * @returns A promise that resolves to the translated proposal.
 */
export async function translateProposalApi(variables: { proposal: AnyProjectProposal, targetLang: string, token: string }): Promise<AnyProjectProposal> {
    const response = await fetch('/api/translate/proposal', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${variables.token}`
        },
        body: JSON.stringify({ proposal: variables.proposal, targetLang: variables.targetLang })
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to translate proposal');
    }
    return await response.json();
}


/**
 * Translates a full presentation history entry.
 * @param variables - An object containing the presentation object and target language.
 * @returns A promise that resolves to the translated presentation.
 */
export async function translatePresentationApi(variables: { presentation: PresentationHistoryEntry, targetLang: string, token: string }): Promise<PresentationHistoryEntry> {
    const response = await fetch('/api/translate/presentation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${variables.token}`
        },
        body: JSON.stringify({ presentation: variables.presentation, targetLang: variables.targetLang })
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to translate presentation');
    }
    return await response.json();
}
