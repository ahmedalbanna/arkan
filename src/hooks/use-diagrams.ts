
'use client';

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { handleErrorUtility } from "@/lib/errorUtils";
import { getAuthenticatedToken } from "@/lib/authUtils";
import { toast } from "./use-toast";
import type { GenerateDiagramOutput, ImageToTextInput } from '@/ai/schemas';
import {
    generateDiagramApi,
    updateDiagramApi,
    explainDiagramApi,
} from "@/services";
import { useBuilderStore } from "./useBuilderStore";
import { type DiagramType } from "@/ai/schemas";

interface ExplainDiagramVariables extends ImageToTextInput {
    prompt: string;
}

/**
 * Custom mutation hook to explain a diagram image.
 */
export function useExplainDiagram(diagramKey: DiagramType, options?: { onSuccess?: (data: any, variables: ExplainDiagramVariables) => void; onError?: (error: any, variables: ExplainDiagramVariables) => void; }) {
  const { firebaseUser, refetchUser } = useAuth();

  return useMutation({
    mutationFn: async (variables: ExplainDiagramVariables) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return explainDiagramApi({ imageDataUri: variables.imageDataUri, prompt: variables.prompt }, token);
    },
    onSuccess: (data, variables) => {
      refetchUser(); // To update credits
      options?.onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      handleErrorUtility(error, "Diagram Explanation Failed");
      options?.onError?.(error, variables);
    },
  });
}


/**
 * Custom mutation hook to generate a new diagram using an AI flow.
 */
export function useGenerateDiagram() {
  const { firebaseUser, refetchUser } = useAuth();
  const { updateProject } = useBuilderStore();

  return useMutation({
    mutationFn: async (body: any) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return generateDiagramApi(body, token);
    },
    onSuccess: (data: GenerateDiagramOutput & { imageUrl: string }, variables: any) => {
        const diagramKey = variables.diagramToGenerate as DiagramType;
        
        updateProject(p => {
            p.setDiagram(diagramKey, {
                plantUmlCode: data.plantUmlCode,
                imageUrl: data.imageUrl,
                explanation: data.explanation
            });
        });
        
        refetchUser();
        toast({ title: "Diagram Generated", description: `Successfully created the ${diagramKey} diagram.` });
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
