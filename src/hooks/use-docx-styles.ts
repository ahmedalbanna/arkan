
// code explantion in docs/hooks/use-docx-styles.md

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Template, TemplateKey } from "@/lib/docx-styles";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { handleErrorUtility } from "@/lib/errorUtils";
import { getAuthenticatedToken } from "@/lib/authUtils";
import { createDocxTemplate, deleteDocxTemplate, fetchDocxTemplates, updateDocxTemplate as updateDocxTemplateApi } from "@/services/template-service";

const DOCX_TEMPLATES_QUERY_KEY = "docx-templates";

// Define types for mutation variables
interface UpdateDocxTemplateVariables {
  key: TemplateKey;
  styles: any;
}

interface CreateDocxTemplateVariables {
    id: string;
    name: string;
    description: string;
}


// --- Custom Hooks ---

export function useDocxStyles() {
  const { data: templates, isLoading: isLoaded } = useQuery<
    Record<TemplateKey, Template>
  >({
    queryKey: [DOCX_TEMPLATES_QUERY_KEY],
    queryFn: fetchDocxTemplates,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    meta: {
      // Add this meta property
      onError: (error: Error) => {
        handleErrorUtility(error, "Failed to fetch DOCX templates");
      },
    },
  });

  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();

  const mutation = useMutation<any, Error, UpdateDocxTemplateVariables>({
    mutationFn: async (variables) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return updateDocxTemplateApi(variables, token);
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData([DOCX_TEMPLATES_QUERY_KEY], (oldData: any) => {
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
      handleErrorUtility(error, "Update DOCX Template Failed");
    },
  });

  const updateStyle = (
    templateKey: TemplateKey,
    path: string,
    value: string | number | boolean
  ) => {
    queryClient.setQueryData([DOCX_TEMPLATES_QUERY_KEY], (oldData: any) => {
      if (!oldData) return oldData;
      const newTemplates = JSON.parse(JSON.stringify(oldData));
      const templateToUpdate = newTemplates[templateKey];

      const keys = path.split(".");
      let current = templateToUpdate.styles.default;
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (typeof current[key] === "undefined") {
          current[key] = {};
        }
        current = current[key];
      }
      current[keys[keys.length - 1]] = value;

      return newTemplates;
    });
  };

  const saveChanges = (templateKey: TemplateKey) => {
    if (templates) {
      mutation.mutate({
        key: templateKey,
        styles: templates[templateKey].styles,
      });
    }
  };

  return {
    templates,
    isLoaded: !isLoaded,
    updateStyle,
    saveChanges,
    isSaving: mutation.isPending,
  };
}

export function useCreateDocxTemplate() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();

    return useMutation<Template, Error, CreateDocxTemplateVariables>({
        mutationFn: async (variables) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return createDocxTemplate(variables, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [DOCX_TEMPLATES_QUERY_KEY] });
            toast({ title: 'Success', description: 'New DOCX template created.' });
        },
        onError: (error: Error) => {
            handleErrorUtility(error, "Create DOCX Template Failed");
            throw error; // Re-throw to be caught by form
        },
    });
}

export function useDeleteDocxTemplate() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();

    return useMutation<any, Error, TemplateKey>({
        mutationFn: async (templateKey) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return deleteDocxTemplate(templateKey, token);
        },
        onSuccess: (data, templateKey) => {
            queryClient.invalidateQueries({ queryKey: [DOCX_TEMPLATES_QUERY_KEY] });
            toast({ title: "Template Deleted", description: `Template "${templateKey}" has been deleted.` });
        },
        onError: (error: Error) => {
            handleErrorUtility(error, "Delete Template Failed");
        },
    });
}
