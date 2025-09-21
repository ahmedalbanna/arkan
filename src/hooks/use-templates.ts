

'use client';

import { useAuth } from "@/context/AuthContext";
import { getAuthenticatedToken } from "@/lib/authUtils";
import { handleErrorUtility } from "@/lib/errorUtils";
import { ReportTemplate, type ReportTemplateProperties } from "@/lib/models/reportTemplate";
import { templateKeys } from "@/lib/query-keys";
import {
  refreshTemplateImage,
} from "@/services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { docxTemplateKeys } from "./use-docx-styles";
import { pptxTemplateKeys } from "./use-pptx-styles";
import { toast } from "./use-toast";

export { templateKeys };

interface UpdateTemplateVariables<T> {
  templateId: string;
  data: Partial<T>;
}


export function useRefreshTemplateImage(templateType: 'docx' | 'pptx') {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();

  return useMutation({
    mutationFn: async (variables: { templateId: string, prompt: string }) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return refreshTemplateImage({ ...variables, templateType }, token);
    },
    onSuccess: () => {
      toast({ title: "Image Refreshing", description: "The new preview image is being generated." });
      if (templateType === 'docx') {
        queryClient.invalidateQueries({ queryKey: docxTemplateKeys.lists() });
      } else {
        queryClient.invalidateQueries({ queryKey: pptxTemplateKeys.lists() });
      }
    },
    onError: (error: Error) => {
      handleErrorUtility(error, "Failed to refresh image");
    }
  })
}

    
    