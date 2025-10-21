
'use client';

import { useAuth } from '@/context/AuthContext';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { handleErrorUtility } from '@/lib/errorUtils';
import type { TTSInput, TTSOutput } from '@/services';
import { textToSpeechApi } from '@/services';
import { useMutation } from '@tanstack/react-query';


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
