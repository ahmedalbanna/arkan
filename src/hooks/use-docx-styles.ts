
'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { handleErrorUtility } from "@/lib/errorUtils";
import { getAuthenticatedToken } from "@/lib/authUtils";
import {
  fetchDocxTemplates as fetchDocxTemplatesApi,
  updateDocxTemplate,
  createDocxTemplate,
  deleteDocxTemplate,
} from "@/services/template-service";
import type { DocxTemplate, DocxTemplatesRecord } from '@/services/template-service';
import type { IStylesOptions } from 'docx';
import { templates as defaultTemplates } from '@/lib/docx-styles';
import { TemplateKey } from '@/lib/types';


export const docxTemplateKeys = {
  all: ["docx-templates"] as const,
  lists: () => [...docxTemplateKeys.all, "list"] as const,
};

export function useDocxStyles() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    const [activeTemplateKey, setActiveTemplateKey] = React.useState<TemplateKey>('modern');
    const [localChanges, setLocalChanges] = React.useState<Record<string, IStylesOptions>>({});


    const { data: templates, isLoading } = useQuery<DocxTemplatesRecord>({
        queryKey: docxTemplateKeys.lists(),
        queryFn: fetchDocxTemplatesApi,
        staleTime: 1000 * 60 * 5, // 5 minutes
        initialData: defaultTemplates as Record<string, DocxTemplate>,
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

    const activeStyles = React.useMemo(() => {
        if (!templates || !activeTemplateKey) return null;
        return localChanges[activeTemplateKey] || templates[activeTemplateKey]?.styles;
    }, [templates, localChanges, activeTemplateKey]);


    const updateStyle = (path: string, value: any, value: string | number | boolean) => {
        if (activeTemplateKey) {
            setLocalChanges(prev => {
                const newStyles = JSON.parse(JSON.stringify(prev[activeTemplateKey] || templates?.[activeTemplateKey]?.styles || {}));
                
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
