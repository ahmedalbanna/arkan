
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
} from "@/services/template-service";
import type { DocxTemplate } from '@/services/template-service';
import { useDesignStore } from '@/components/design/useDesignStore';
import type { IStylesOptions } from 'docx';
import { templates as defaultTemplates } from '@/lib/docx-styles';

export const docxTemplateKeys = {
  all: ["docx-templates"] as const,
  lists: () => [...docxTemplateKeys.all, "list"] as const,
};

export function useDocxStyles() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    
    const {
        activeTemplateKey,
        setActiveTemplateKey,
        localChanges,
        updateStyle: updateLocalStyle,
        resetLocalChanges,
    } = useDesignStore();


    const { data: templates, isLoading } = useQuery<Record<string, DocxTemplate>>({
        queryKey: docxTemplateKeys.lists(),
        queryFn: fetchDocxTemplatesApi,
        staleTime: 1000 * 60 * 5, // 5 minutes
        initialData: defaultTemplates,
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
            resetLocalChanges(variables.key);
        },
        onError: (error) => {
            handleErrorUtility(error, "Failed to save template");
        }
    });

    const activeStyles = React.useMemo(() => {
        if (!templates || !activeTemplateKey) return null;
        return localChanges[activeTemplateKey] || templates[activeTemplateKey]?.styles;
    }, [templates, localChanges, activeTemplateKey]);


    const updateStyle = (path: string, value: any) => {
        if (activeTemplateKey) {
            updateLocalStyle(activeTemplateKey, path, value);
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
