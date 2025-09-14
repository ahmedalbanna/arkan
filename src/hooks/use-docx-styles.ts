'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks";
import { useAuth } from "@/context/AuthContext";
import { handleErrorUtility } from "@/lib/errorUtils";
import { getAuthenticatedToken } from "@/lib/authUtils";
import {
  fetchDocxTemplates as fetchDocxTemplatesApi,
  updateDocxTemplate,
  createDocxTemplate,
  deleteDocxTemplate,
  type DocxTemplate as DocxTemplateType,
  type DocxTemplatesRecord,
} from "@/services";
import { DocxTemplate, type DocxTemplateProperties } from '@/lib/models/docxTemplate';
import type { IStylesOptions } from 'docx';
import { templates as defaultTemplates } from '@/lib/docx-styles';


export type DocxTemplateKey  = 'modern' | 'classic' | 'academic' | string;

export const docxTemplateKeys = {
  all: ["docx-templates"] as const,
  lists: () => [...docxTemplateKeys.all, "list"] as const,
};

export function useDocxStyles() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    const [activeTemplateKey, setActiveTemplateKey] = React.useState<DocxTemplateKey >('modern');
    const [localChanges, setLocalChanges] = React.useState<Record<string, IStylesOptions>>({});


    const { data: templates, isLoading } = useQuery<Record<string, DocxTemplate>, Error>({
        queryKey: docxTemplateKeys.lists(),
        queryFn: async () => {
            const data = await fetchDocxTemplatesApi();
            const instances: Record<string, DocxTemplate> = {};
            for (const key in data) {
                instances[key] = new DocxTemplate(data[key] as DocxTemplateProperties);
            }
            return instances;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        initialData: () => {
            const initialInstances: Record<string, DocxTemplate> = {};
            for (const key in defaultTemplates) {
                initialInstances[key] = new DocxTemplate(defaultTemplates[key] as DocxTemplateProperties);
            }
            return initialInstances;
        },
        meta: {
            onError: (error: Error) => handleErrorUtility(error, "Failed to fetch DOCX templates"),
        },
    });

    const mutation = useMutation({
        mutationFn: async (variables: { key: string, styles: IStylesOptions }) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return updateDocxTemplate(variables, token);
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: docxTemplateKeys.lists() });
            toast({ title: "Template Updated", description: `Template "${variables.key}" has been updated.` });
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

    const activeStyles = React.useMemo(() => {
        if (!templates || !activeTemplateKey) return null;
        // Access styles from the DocxTemplate instance
        return localChanges[activeTemplateKey] || templates[activeTemplateKey]?.styles;
    }, [templates, localChanges, activeTemplateKey]);


    const updateStyle = (path: string, value: string | number | boolean) => {
        if (activeTemplateKey) {
            setLocalChanges(prev => {
                // Ensure we are working with a mutable copy of the styles
                const currentStyles = prev[activeTemplateKey] || templates?.[activeTemplateKey]?.styles || {};
                const newStyles = JSON.parse(JSON.stringify(currentStyles));

                let current = newStyles;
                const keys = path.split('.');
                for (let i = 0; i < keys.length - 1; i++) {
                    if (!current[keys[i]]) current[keys[i]] = {};
                    current = current[keys[i]];
                }
                current[keys[keys.length - 1]] = value;

                return { ...prev, [activeTemplateKey]: newStyles };
            });
        }
    };

    const saveChanges = (key: string) => {
        const changesToSave = localChanges[key];
        if (changesToSave) {
            mutation.mutate({ key, styles: changesToSave });
        }
    };

    return {
        templates,
        isLoaded: !isLoading,
        activeTemplateKey,
        setActiveTemplateKey,
        activeStyles,
        updateStyle,
        saveChanges,
        isSaving: mutation.isPending,
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
        mutationFn: async (key: string) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return deleteDocxTemplate(key, token);
        },
        onSuccess: (data, key) => {
            queryClient.invalidateQueries({ queryKey: docxTemplateKeys.lists() });
            toast({ title: "Template Deleted", description: `Template "${key}" has been deleted.` });
        },
        onError: (error: Error) => {
            handleErrorUtility(error, "Failed to delete template");
        }
    });
}
