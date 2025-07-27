
'use client';

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { userKeys } from "@/lib/query-keys";
import { handleErrorUtility } from "@/lib/errorUtils";
import { getAuthenticatedToken } from "@/lib/authUtils";
import { explainDiagramApi } from "@/services/diagram-service";
import { toast } from "./use-toast";
import { ExplainDiagramOutput } from "@/ai/flows/explain-diagram";

/**
 * Custom mutation hook to explain a diagram image using an AI flow.
 *
 * @returns The result of the useMutation hook.
 */
export function useExplainDiagram() {
  const { firebaseUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<ExplainDiagramOutput, Error, string>({
    mutationFn: async (imageDataUri: string) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return explainDiagramApi(imageDataUri, token);
    },
    onSuccess: (data, variables) => {
      // Invalidate user query to refetch credits
      if (firebaseUser) {
        queryClient.invalidateQueries({ queryKey: userKeys.profile(firebaseUser.uid) });
      }
      return data;
    },
    onError: (error: Error) => {
      handleErrorUtility(error, "Explanation Failed");
    },
  });
}
