
'use client';

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { userKeys } from "@/lib/query-keys";
import { handleErrorUtility } from "@/lib/errorUtils";
import { getAuthenticatedToken } from "@/lib/authUtils";
import { toast } from "./use-toast";
import type { GenerateDiagramOutput } from "@/ai/flows/generate-diagrams";
import type { ExplainDiagramOutput } from "@/ai/flows/explain-diagram";
import { 
    generateDiagramApi, 
    updateDiagramApi, 
    explainDiagramApi 
} from "@/services/diagram-service";

/**
 * Custom mutation hook to generate a new diagram using an AI flow.
 */
export function useGenerateDiagram(onSuccessCallback?: (data: GenerateDiagramOutput & { imageUrl: string }, variables: { body: any; token: string }) => void) {
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
        onSuccessCallback(data, { body: variables, token: ''});
      }
    },
    onError: (error: Error, variables) => {
      handleErrorUtility(error, `Failed to generate ${variables.diagramToGenerate} diagram`);
    },
  });
}

/**
 * Custom mutation hook to update an existing diagram from PlantUML code.
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


/**
 * Custom mutation hook to explain a diagram image using an AI flow.
 */
export function useExplainDiagram() {
  const { firebaseUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<ExplainDiagramOutput, Error, string>({
    mutationFn: async (imageDataUri: string) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return explainDiagramApi(imageDataUri, token);
    },
    onSuccess: () => {
      if (firebaseUser) {
        queryClient.invalidateQueries({ queryKey: userKeys.profile(firebaseUser.uid) });
      }
    },
    onError: (error: Error) => {
      handleErrorUtility(error, "Explanation Failed");
    },
  });
}
