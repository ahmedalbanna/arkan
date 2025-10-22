
'use client';

import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { handleErrorUtility } from '@/lib/errorUtils';
import { DocxTemplate } from '@/lib/models/docxTemplate'; // Corrected import
import type { DocxTemplateKey } from '@/lib/types';
import { fetchDocxTemplatesApi, updateDocxTemplateApi } from '@/services/template-service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import set from 'lodash.set';
import { useState } from 'react';

export const DOCX_TEMPLATES_QUERY_KEY = 'docx-templates';

/**
 * Custom hook to manage fetching and updating DOCX template styles.
 */
export function useDocxStyles() {
    const { firebaseUser } = useAuth();
    const queryClient = useQueryClient();
    const [activeTemplateKey, setActiveTemplateKey] = useState<DocxTemplateKey | null>(null);

    const { data: templates, isFetched: isLoaded } = useQuery<Record<DocxTemplateKey, DocxTemplate>>({
        queryKey: [DOCX_TEMPLATES_QUERY_KEY],
        queryFn: fetchDocxTemplatesApi, // API returns DocxTemplate instances
        staleTime: 1000 * 60 * 5, // 5 minutes
        meta: {
            onError: (error: Error) => handleErrorUtility(error, "Failed to fetch DOCX templates"),
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (variables: { key: DocxTemplateKey, styles: any }) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return updateDocxTemplateApi(variables, token);
        },
        onSuccess: (data, variables) => {
            queryClient.setQueryData([DOCX_TEMPLATES_QUERY_KEY], (old: Record<string, DocxTemplate> | undefined) => {
                if (!old) return {};
                return { ...old, [variables.key]: new DocxTemplate(data) }; // Ensure new data is a class instance
            });
            toast({ title: "Template Saved", description: "Your style changes have been saved." });
        },
        onError: (error) => {
            handleErrorUtility(error, "Failed to save template");
        }
    });

    const updateStyle = (path: string, value: any) => {
        if (!templates || !activeTemplateKey) return;
        const currentTemplate = templates[activeTemplateKey];
        const newStyles = { ...currentTemplate.styles };
        set(newStyles, path, value); 

        queryClient.setQueryData<Record<string, DocxTemplate>>([DOCX_TEMPLATES_QUERY_KEY], (old) => {
            if (!old) return {};
            const updatedTemplate = old[activeTemplateKey].clone(); // Use clone method
            updatedTemplate.styles = newStyles;
            return {
                ...old,
                [activeTemplateKey]: updatedTemplate,
            };
        });
    };

    const saveChanges = (key: DocxTemplateKey) => {
        if (!templates || !templates[key]) return;
        const stylesToSave = templates[key].styles; // Correctly access styles
        updateMutation.mutate({ key, styles: stylesToSave });
    };

    return {
        templates: templates || {},
        isLoaded,
        activeTemplateKey,
        setActiveTemplateKey,
        updateStyle,
        saveChanges,
        isSaving: updateMutation.isPending,
    };
}

export function useDeleteDocxTemplate() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();

    return useMutation<any, Error, string>({
        mutationFn: async (templateId: string) => {
            // const token = await getAuthenticatedToken(firebaseUser);
            // return deleteDocxTemplateApi(templateId, token);
            console.log(`Simulating delete for DOCX template: ${templateId}`);
            return Promise.resolve();
        },
        onSuccess: (data, templateId) => {
            queryClient.invalidateQueries({ queryKey: [DOCX_TEMPLATES_QUERY_KEY] });
            toast({ title: 'Template Deleted', description: `Template "${templateId}" was deleted.` });
        },
        onError: (error) => {
            handleErrorUtility(error, "Failed to delete template");
        }
    });
}
