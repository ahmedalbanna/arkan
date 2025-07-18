
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import type { TranslateTextOutput } from '@/ai/flows/translate-text';

interface TranslateVariables {
  text: string;
  targetLang: string;
}

async function translateTextApi(variables: TranslateVariables, token: string): Promise<TranslateTextOutput> {
  const response = await fetch('/api/translate', {
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

export function useTranslate() {
  const { firebaseUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: TranslateVariables) => {
      const token = await firebaseUser?.getIdToken();
      if (!token) {
        throw new Error('User is not authenticated.');
      }
      return translateTextApi(variables, token);
    },
    onSuccess: () => {
      // Invalidate user query to refetch credits after successful translation
      if (firebaseUser) {
        queryClient.invalidateQueries({ queryKey: ['user', firebaseUser.uid] });
      }
    },
  });
}
