
'use client';

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { userKeys } from "@/lib/query-keys";
import { handleErrorUtility } from "@/lib/errorUtils";
import { getAuthenticatedToken } from "@/lib/authUtils";
import { explainDiagramApi } from "@/services/diagram-service";
import { toast } from "./use-toast";

/**
 * Custom mutation hook to explain a diagram image using an AI flow.
 *
 * @returns The result of the useMutation hook.
 */
export function useExplainDiagram() {
  const { firebaseUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (imageDataUri: string) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return explainDiagramApi(imageDataUri, token);
    },
    onSuccess: () => {
      // Invalidate user query to refetch credits
      if (firebaseUser) {
        queryClient.invalidateQueries({ queryKey: userKeys.profile(firebaseUser.uid) });
      }
      toast({
        title: "Explanation Ready",
        description: "The AI has finished explaining the diagram.",
      });
    },
    onError: (error: Error) => {
      handleErrorUtility(error, "Explanation Failed");
    },
  });
}
