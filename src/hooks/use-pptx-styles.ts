
'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks";
import { useAuth } from "@/context/AuthContext";
import { handleErrorUtility } from "@/lib/errorUtils";
import { getAuthenticatedToken } from "@/lib/authUtils";
import {
  fetchPptxTemplates,
  updatePptxTemplate,
  createPptxTemplate,
  deletePptxTemplate,
  uploadPptxTemplateFile as uploadPptxTemplateFileApi,
  type PptxTemplate as PptxTemplateType,
} from "@/services";
import { PptxStyleOptions } from '@/lib/types';
import { PptxTemplate, type PptxTemplateProperties } from '@/lib/models/pptxTemplate';


export type PptxTemplateKey = 'modern' | 'dark' | 'professional' | string;

export const pptxTemplateKeys = {
  all: ["pptx-templates"] as const,
  lists: () => [...pptxTemplateKeys.all, "list"] as const,
};

export function usePptxStyles() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    const [localChanges, setLocalChanges] = React.useState<Record<string, PptxStyleOptions>>({});

    const { data: templates, isLoading } = useQuery<Record<string, PptxTemplate>, Error>({
        queryKey: pptxTemplateKeys.lists(),
        queryFn: async () => {
            const data = await fetchPptxTemplates();
            const instances: Record<string, PptxTemplate> = {};
            for (const key in data) {
                instances[key] = new PptxTemplate(data[key] as PptxTemplateProperties);
            }
            return instances;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        meta: {
            onError: (error: Error) => handleErrorUtility(error, "Failed to fetch PPTX templates"),
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (variables: { key: string, styles: PptxStyleOptions }) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return updatePptxTemplate(variables, token);
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: pptxTemplateKeys.lists() });
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

    const uploadTemplateFile = useMutation({
        mutationFn: async (variables: { templateId: string; file: File }) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return uploadPptxTemplateFileApi({ ...variables, token });
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: pptxTemplateKeys.lists() });
            toast({ title: "Template Uploaded", description: "The PPTX template file has been updated." });
        },
        onError: (error: Error) => {
            handleErrorUtility(error, "Failed to upload template file");
        }
    });

    const updateStyle = (key: string, path: string, value: any) => {
        setLocalChanges(prev => {
            const newStyles = JSON.parse(JSON.stringify(prev[key] || templates?.[key]?.styles || {}));

            let current = newStyles;
            const keys = path.split('.');
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) current[keys[i]] = {};
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;

            return { ...prev, [key]: newStyles };
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
                const newStyles = localChanges[key];
                // Need to create a new instance to make React re-render
                combined[key] = new PptxTemplate({ ...combined[key].toPlainObject(), styles: newStyles });
            }
        }
        return combined;
    }, [templates, localChanges]);


    return {
        templates: combinedTemplates,
        isLoaded: !isLoading,
        isSaving: updateMutation.isPending,
        uploadTemplateFile,
        updateStyle,
        saveChanges
    };
}

export function useCreatePptxTemplate() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    return useMutation<PptxTemplateType, Error, {id: string, name: string, description: string}>({
        mutationFn: async (data) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return createPptxTemplate(data, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: pptxTemplateKeys.lists() });
        },
        onError: (error: any) => {
            // Re-throw for form handling
            throw error;
        }
    });
}

export function useDeletePptxTemplate() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    return useMutation({
        mutationFn: async (key: string) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return deletePptxTemplate(key, token);
        },
        onSuccess: (data, key) => {
            queryClient.invalidateQueries({ queryKey: pptxTemplateKeys.lists() });
            toast({ title: "Template Deleted", description: `Template "${key}" has been deleted.` });
        },
        onError: (error: Error) => {
            handleErrorUtility(error, "Failed to delete template");
        }
    });
}
