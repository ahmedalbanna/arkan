
// code explantion in docs/hooks/use-translation.md

"use client";

import { useAuth } from "@/context/AuthContext";
import { getAuthenticatedToken } from "@/core/utils/authUtils";
import { handleErrorUtility } from "@/core/utils/errorUtils";
import { userKeys } from '@/core/utils/query-keys';
import { type TranslateTextOutput, type TranslateVariables } from "@/lib/types";
import { translateTextApi } from "@/services";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Custom mutation hook for translating text using an AI flow.
 * Handles API calls, authentication, and credit deduction feedback.
 *
 * @returns The result of the useMutation hook.
 */
export function useTranslate() {
  const { firebaseUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<TranslateTextOutput, Error, TranslateVariables>({
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
