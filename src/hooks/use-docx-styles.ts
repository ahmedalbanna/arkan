
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Template, TemplateKey } from '@/lib/docx-styles';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { handleErrorUtility } from '@/lib/errorUtils';
import { getAuthenticatedToken } from '@/lib/authUtils';

const DOCX_TEMPLATES_QUERY_KEY = 'docx-templates';

// --- API Service Functions ---

async function fetchDocxTemplates(): Promise<Record<TemplateKey, Template>> {
    const response = await fetch('/api/templates/docx');
    if (!response.ok) {
        throw new Error('Failed to fetch DOCX templates');
    }
    return await response.json();
}

async function updateDocxTemplateApi({ key, styles }: { key: TemplateKey, styles: any }, token: string) {
    const response = await fetch(`/api/templates/docx/${key}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ styles }),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update DOCX template');
    }
    return response.json();
}

async function refreshTemplateImageApi(variables: {templateType: string, templateId: string, prompt: string}, token: string) {
    const response = await fetch('/api/templates/refresh-image', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(variables)
    });
     if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to refresh image');
    }
    return response.json();
}

// Define types for mutation variables
interface UpdateDocxTemplateVariables {
    key: TemplateKey;
    styles: any;
}

interface RefreshTemplateImageVariables {
    templateId: string;
    prompt: string;
}

// --- Custom Hooks ---

export function useDocxStyles() {
  const { data: templates, isLoading: isLoaded } = useQuery<Record<TemplateKey, Template>>({
      queryKey: [DOCX_TEMPLATES_QUERY_KEY],
      queryFn: fetchDocxTemplates,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      meta: { // Add this meta property
      onError: (error: Error) => {
          handleErrorUtility(error, 'Failed to fetch DOCX templates');
          },
      }
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
            return { ...oldData, [variables.key]: { ...oldData[variables.key], styles: data.styles }};
          });
          toast({
              title: "Template Saved",
              description: `Your changes to the "${data.name}" template have been saved.`,
          });
      },
      onError: (error: Error) => {
          handleErrorUtility(error, 'Update DOCX Template Failed');
      }
  });

  const updateStyle = (templateKey: TemplateKey, path: string, value: string | number | boolean) => {
    queryClient.setQueryData([DOCX_TEMPLATES_QUERY_KEY], (oldData: any) => {
      if (!oldData) return oldData;
      const newTemplates = JSON.parse(JSON.stringify(oldData));
      const templateToUpdate = newTemplates[templateKey];
      
      const keys = path.split('.');
      let current = templateToUpdate.styles.default;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      
      return newTemplates;
    });
  };

  const saveChanges = (templateKey: TemplateKey) => {
      if (templates) {
          mutation.mutate({ key: templateKey, styles: templates[templateKey].styles });
      }
  };


  return { templates, isLoaded: !isLoaded, updateStyle, saveChanges, isSaving: mutation.isPending };
}

export function useRefreshTemplateImage(templateType: 'docx' | 'pptx') {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();

  return useMutation<any, Error, RefreshTemplateImageVariables>({
    mutationFn: async (variables) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return refreshTemplateImageApi({ ...variables, templateType }, token);
    },
    onSuccess: (data, variables) => {
      const queryKey = templateType === 'docx' ? DOCX_TEMPLATES_QUERY_KEY : 'pptx-templates';
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      toast({
        title: "Preview Refreshed",
        description: `The preview image for "${data.name}" has been updated.`,
      });
    },
    onError: (error: Error) => {
      handleErrorUtility(error, 'Image Refresh Failed');
    },
  });
}
