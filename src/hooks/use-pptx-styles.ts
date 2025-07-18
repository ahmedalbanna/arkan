
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { type PptxTemplate, type PptxTemplateKey, type PptxStyleOptions } from '@/lib/pptx-styles';

const PPTX_TEMPLATES_QUERY_KEY = 'pptx-templates';


// --- API Service Functions ---

async function fetchPptxTemplates(): Promise<Record<PptxTemplateKey, PptxTemplate>> {
    const response = await fetch('/api/templates/pptx');
    if (!response.ok) {
        throw new Error('Failed to fetch PPTX templates');
    }
    return response.json();
}

async function updatePptxTemplateApi({ key, styles }: { key: PptxTemplateKey, styles: PptxStyleOptions }, token: string) {
    const response = await fetch(`/api/templates/pptx/${key}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ styles }),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update PPTX template');
    }
    return response.json();
}

// Helper to set nested property
function set(obj: any, path: string, value: any) {
  const keys = path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (typeof current[key] === 'undefined') {
        current[key] = {};
    }
    current = current[key];
  }
  current[keys[keys.length - 1]] = value;
}

// --- Custom Hooks ---

export function usePptxStyles() {
    const { data: templates, isLoading: isLoaded } = useQuery<Record<PptxTemplateKey, PptxTemplate>>({
        queryKey: [PPTX_TEMPLATES_QUERY_KEY],
        queryFn: fetchPptxTemplates,
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
    });

    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();

    const mutation = useMutation({
        mutationFn: async (variables: { key: PptxTemplateKey; styles: PptxStyleOptions }) => {
            if (!firebaseUser) throw new Error("User not authenticated.");
            const token = await firebaseUser.getIdToken();
            return updatePptxTemplateApi(variables, token);
        },
        onSuccess: (data, variables) => {
            queryClient.setQueryData([PPTX_TEMPLATES_QUERY_KEY], (oldData: any) => {
              if (!oldData) return oldData;
              return { ...oldData, [variables.key]: { ...oldData[variables.key], styles: data.styles }};
            });
            toast({
                title: "Template Saved",
                description: `Your changes to the "${data.name}" template have been saved.`,
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Update Failed",
                description: error.message,
                variant: 'destructive',
            });
        }
    });

    const updateStyle = (templateKey: PptxTemplateKey, path: string, value: string | number | boolean) => {
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
            mutation.mutate({ key: templateKey, styles: templates[templateKey].styles });
        }
    };

  return { templates: templates || {} as Record<PptxTemplateKey, PptxTemplate>, isLoaded: !isLoaded, updateStyle, saveChanges, isSaving: mutation.isPending };
}
