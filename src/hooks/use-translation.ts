
// code explantion in docs/hooks/use-translation.md

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { userKeys } from "@/lib/query-keys";
import type { TranslateTextInput, TranslateTextOutput } from "@/ai/schemas";
import { handleErrorUtility } from "@/lib/errorUtils";
import { getAuthenticatedToken } from "@/lib/authUtils";
import { translateText as translateTextApi } from "@/services/translation-service";

/**
 * Custom mutation hook for translating text using an AI flow.
 * Handles API calls, authentication, and credit deduction feedback.
 *
 * @returns The result of the useMutation hook.
 */
export function useTranslate() {
  const { firebaseUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<TranslateTextOutput, Error, TranslateTextInput>({
    mutationFn: async (variables) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return translateTextApi(variables, token);
    },
    onSuccess: () => {
      // Invalidate user query to refetch credits after successful translation
      if (firebaseUser) {
        queryClient.invalidateQueries({
          queryKey: userKeys.profile(firebaseUser.uid),
        });
      }
    },
    onError: (error: Error) => {
      handleErrorUtility(error, "Translation Failed");
    },
  });
}
