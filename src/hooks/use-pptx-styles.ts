
// code explantion in docs/hooks/use-pptx-styles.md

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import {
  type PptxTemplate,
  type PptxTemplateKey,
  type PptxStyleOptions,
} from "@/lib/pptx-styles";
import { handleErrorUtility } from "@/lib/errorUtils";
import { getAuthenticatedToken } from "@/lib/authUtils";
import { createPptxTemplate, deletePptxTemplate, refreshTemplateImage } from "@/services/template-service";

export const PPTX_TEMPLATES_QUERY_KEY = "pptx-templates";

// --- API Service Functions ---

async function fetchPptxTemplates(): Promise<
  Record<PptxTemplateKey, PptxTemplate>
> {
  const response = await fetch("/api/templates/pptx");
  if (!response.ok) {
    throw new Error("Failed to fetch PPTX templates");
  }
  return await response.json();
}

async function updatePptxTemplateApi(
  { key, styles }: { key: PptxTemplateKey; styles: PptxStyleOptions },
  token: string
) {
  const response = await fetch(`/api/templates/pptx/${key}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ styles }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update PPTX template");
  }
  return response.json();
}

// Define types for mutation variables
interface UpdatePptxTemplateVariables {
  key: PptxTemplateKey;
  styles: PptxStyleOptions;
}

interface CreatePptxTemplateVariables {
    id: string;
    name: string;
    description: string;
}

// Helper to set nested property
function set(obj: any, path: string, value: any) {
  const keys = path.split(".");
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (typeof current[key] === "undefined") {
      current[key] = {};
    }
    current = current[key];
  }
  current[keys[keys.length - 1]] = value;
}

// --- Custom Hooks ---

export function usePptxStyles() {
  const { data: templates, isLoading } = useQuery<
    Record<PptxTemplateKey, PptxTemplate>
  >({
    queryKey: [PPTX_TEMPLATES_QUERY_KEY],
    queryFn: fetchPptxTemplates,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    meta: {
      onError: (error: Error) => {
        handleErrorUtility(error, "Failed to fetch PPTX templates");
      },
    },
  });

  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();

  const mutation = useMutation<any, Error, UpdatePptxTemplateVariables>({
    mutationFn: async (variables) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return updatePptxTemplateApi(variables, token);
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData([PPTX_TEMPLATES_QUERY_KEY], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          [variables.key]: { ...oldData[variables.key], styles: data.styles },
        };
      });
      toast({
        title: "Template Saved",
        description: `Your changes to the "${data.name}" template have been saved.`,
      });
    },
    onError: (error: Error) => {
      handleErrorUtility(error, "Update PPTX Template Failed");
    },
  });

  const updateStyle = (
    templateKey: PptxTemplateKey,
    path: string,
    value: string | number | boolean
  ) => {
    queryClient.setQueryData([PPTX_TEMPLATES_QUERY_KEY], (oldData: any) => {
      if (!oldData) return oldData;
      const newTemplates = JSON.parse(JSON.stringify(oldData));
      const templateToUpdate = newTemplates[templateKey];
      set(templateToUpdate.styles, path, value);
      return newTemplates;
    });
  };

  const saveChanges = (templateKey: PptxTemplateKey) => {
    if (templates) {
      mutation.mutate({
        key: templateKey,
        styles: templates[templateKey].styles,
      });
    }
  };

  return {
    templates: templates || ({} as Record<PptxTemplateKey, PptxTemplate>),
    isLoaded: !isLoading,
    updateStyle,
    saveChanges,
    isSaving: mutation.isPending,
  };
}


export function useCreatePptxTemplate() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();

    return useMutation<PptxTemplate, Error, CreatePptxTemplateVariables>({
        mutationFn: async (variables) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return createPptxTemplate(variables, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [PPTX_TEMPLATES_QUERY_KEY] });
            toast({ title: 'Success', description: 'New PPTX template created.' });
        },
        onError: (error: Error) => {
            handleErrorUtility(error, "Create PPTX Template Failed");
            throw error; // Re-throw to be caught by form
        },
    });
}

export function useDeletePptxTemplate() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();

    return useMutation<any, Error, PptxTemplateKey>({
        mutationFn: async (templateKey) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return deletePptxTemplate(templateKey, token);
        },
        onSuccess: (data, templateKey) => {
            queryClient.invalidateQueries({ queryKey: [PPTX_TEMPLATES_QUERY_KEY] });
            toast({ title: "Template Deleted", description: `Template "${templateKey}" has been deleted.` });
        },
        onError: (error: Error) => {
            handleErrorUtility(error, "Delete Template Failed");
        },
    });
}
