

'use client';

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { userKeys } from "@/lib/query-keys";
import { handleErrorUtility } from "@/lib/errorUtils";
import { getAuthenticatedToken } from "@/lib/authUtils";
import { toast } from "./use-toast";
import type { GenerateDiagramOutput } from "@/ai/schemas";
import {
    generateDiagramApi,
    updateDiagramApi,
} from "@/services";

/**
 * Custom mutation hook to generate a new diagram using an AI flow.
 */
export function useGenerateDiagram(onSuccessCallback?: (data: GenerateDiagramOutput & { imageUrl: string }, variables: any) => void) {
  const { firebaseUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: any) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return generateDiagramApi(body, token);
    },
    onSuccess: (data, variables) => {
      if (firebaseUser) {
        queryClient.invalidateQueries({ queryKey: userKeys.profile(firebaseUser.uid) });
      }
      if(onSuccessCallback) {
        onSuccessCallback(data, variables);
      }
    },
    onError: (error: Error, variables) => {
      handleErrorUtility(error, `Failed to generate ${variables.diagramToGenerate} diagram`);
    },
  });
}

/**
 * Custom mutation hook to update an existing diagram from its PlantUML code.
 */
export function useUpdateDiagram(onSuccessCallback?: (data: { plantUmlCode: string; imageUrl: string }, variables: string) => void) {
  const { firebaseUser } = useAuth();

  return useMutation<any, Error, string>({
    mutationFn: async (plantUmlCode: string) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return updateDiagramApi(plantUmlCode, token);
    },
    onSuccess: (data, variables) => {
       toast({ title: "Diagram Updated", description: "The diagram image has been refreshed." });
       if(onSuccessCallback) {
           onSuccessCallback(data, variables);
       }
    },
    onError: (error: Error) => {
      handleErrorUtility(error, "Diagram update failed");
    },
  });
}
