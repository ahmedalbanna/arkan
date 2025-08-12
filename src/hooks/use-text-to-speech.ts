
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { userKeys } from '@/lib/query-keys';
import { handleErrorUtility } from '@/lib/errorUtils';
import { getAuthenticatedToken } from '@/lib/authUtils';

interface TTSInput {
    text: string;
}

interface TTSOutput {
    audioDataUri: string;
}

async function textToSpeechApi(variables: { data: TTSInput, token: string }): Promise<TTSOutput> {
    const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${variables.token}`,
        },
        body: JSON.stringify(variables.data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate speech');
    }
    return response.json();
}

/**
 * Custom mutation hook for converting text to speech.
 * @returns The result of the useMutation hook, including the `mutate` function to trigger TTS.
 */
export function useTextToSpeech() {
  const { firebaseUser, refetchUser } = useAuth();

  return useMutation<TTSOutput, Error, TTSInput>({
    mutationFn: async (data: TTSInput) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return textToSpeechApi({ data, token });
    },
    onSuccess: () => {
      refetchUser();
    },
    onError: (error: Error) => {
      handleErrorUtility(error, "Speech Generation Failed");
    },
  });
}
