
'use client';

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { handleErrorUtility } from "@/lib/errorUtils";
import { getAuthenticatedToken } from "@/lib/authUtils";
import {
  fetchDocxTemplates,
  updateDocxTemplate,
  createDocxTemplate,
  deleteDocxTemplate,
  refreshTemplateImage,
  type DocxTemplate,
} from "@/services/template-service";
import type { IStylesOptions } from 'docx';

export const docxTemplateKeys = {
  all: ["docx-templates"] as const,
  lists: () => [...docxTemplateKeys.all, "list"] as const,
  detail: (id: string) => [...docxTemplateKeys.all, "detail", id] as const,
};


export function useDocxStyles() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    const [localChanges, setLocalChanges] = React.useState<Record<string, IStylesOptions>>({});

    const { data: templates, isLoading, isError } = useQuery<Record<string, DocxTemplate>>({
        queryKey: docxTemplateKeys.lists(),
        queryFn: fetchDocxTemplates,
        staleTime: 1000 * 60 * 5, // 5 minutes
        meta: {
            onError: (error: Error) => handleErrorUtility(error, "Failed to fetch DOCX templates"),
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (variables: { key: string, styles: IStylesOptions }) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return updateDocxTemplate(variables, token);
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: docxTemplateKeys.lists() });
            toast({ title: "Template Saved", description: `Template "${variables.key}" has been updated.` });
            setLocalChanges(prev => {
                const newChanges = { ...prev };
                delete newChanges[variables.key];
                return newChanges;
            });
        },
        onError: (error) => {
            handleErrorUtility(error, "Failed to save template");
        }
    });

    const updateStyle = (templateKey: string, path: string, value: any) => {
        setLocalChanges(prev => {
            const newStyles = JSON.parse(JSON.stringify(prev[templateKey] || templates?.[templateKey]?.styles || {}));
            
            let current = newStyles;
            const keys = path.split('.');
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) current[keys[i]] = {};
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;

            return { ...prev, [templateKey]: newStyles };
        });
    };
    
    const saveChanges = (key: string) => {
        if (localChanges[key]) {
            updateMutation.mutate({ key, styles: localChanges[key] });
        }
    };
    
    const combinedTemplates = React.useMemo(() => {
        if (!templates) return {};
        const combined = { ...templates };
        for (const key in localChanges) {
            if (combined[key]) {
                combined[key] = { ...combined[key], styles: localChanges[key] };
            }
        }
        return combined;
    }, [templates, localChanges]);


    return { 
        templates: combinedTemplates, 
        isLoaded: !isLoading, 
        isSaving: updateMutation.isPending,
        updateStyle,
        saveChanges
    };
}

export function useCreateDocxTemplate() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    return useMutation({
        mutationFn: async (data: {id: string, name: string, description: string}) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return createDocxTemplate(data, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: docxTemplateKeys.lists() });
        },
        onError: (error: any) => {
            // Re-throw for form handling
            throw error;
        }
    });
}

export function useDeleteDocxTemplate() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    return useMutation({
        mutationFn: async (templateKey: string) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return deleteDocxTemplate(templateKey, token);
        },
        onSuccess: (data, templateKey) => {
            queryClient.invalidateQueries({ queryKey: docxTemplateKeys.lists() });
            toast({ title: "Template Deleted", description: `Template "${templateKey}" has been deleted.` });
        },
        onError: (error: Error) => {
            handleErrorUtility(error, "Failed to delete template");
        }
    });
}

export function useRefreshTemplateImage(templateType: 'docx' | 'pptx') {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();

    return useMutation({
        mutationFn: async (variables: { templateId: string; prompt: string }) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return refreshTemplateImage({ ...variables, templateType }, token);
        },
        onSuccess: () => {
            if (templateType === 'docx') {
                queryClient.invalidateQueries({ queryKey: docxTemplateKeys.lists() });
            }
            // Add similar logic for pptx if needed
            toast({ title: 'Success', description: 'Template image has been refreshed.' });
        },
        onError: (error) => {
            handleErrorUtility(error, 'Image Refresh Failed');
        },
    });
}
