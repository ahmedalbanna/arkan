
'use client';

import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { handleErrorUtility } from '@/lib/errorUtils';
import type { PptxTemplate } from '@/lib/models/pptxTemplate';
import { templateKeys } from '@/lib/query-keys';
import type { PptxStyleOptions, PptxTemplateKey } from '@/lib/types';
import { deletePptxTemplateApi, fetchPptxTemplatesApi, updatePptxTemplateApi, uploadPptxTemplateFileApi } from '@/services/template-service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import set from 'lodash.set';
import { useState } from 'react';


export function usePptxStyles() {
    const { firebaseUser } = useAuth();
    const queryClient = useQueryClient();
    const [activeTemplateKey, setActiveTemplateKey] = useState<PptxTemplateKey | null>(null);

    const { data: templates, isFetched: isLoaded } = useQuery<Record<PptxTemplateKey, PptxTemplate>>({
        queryKey: templateKeys.pptx(),
        queryFn: () => fetchPptxTemplatesApi(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        meta: {
            onError: (error: Error) => handleErrorUtility(error, "Failed to fetch PPTX templates"),
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (variables: { key: PptxTemplateKey, styles: PptxStyleOptions }) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return updatePptxTemplateApi(variables, token);
        },
        onSuccess: (data, variables) => {
            queryClient.setQueryData(templateKeys.pptx(), (old: Record<string, PptxTemplate> | undefined) => {
                if (!old) return {};
                return { ...old, [variables.key]: data };
            });
            toast({ title: "Template Saved", description: "Your style changes have been saved." });
        },
        onError: (error) => {
            handleErrorUtility(error, "Failed to save template");
        }
    });

    const uploadTemplateFile = useMutation({
        mutationFn: async (variables: { templateId: string; file: File }) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return uploadPptxTemplateFileApi(variables.templateId, variables.file, token);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: templateKeys.pptx() });
            toast({ title: "Template File Uploaded", description: `The .pptx file has been updated for template ID: ${data.id}` });
        },
        onError: (error) => {
            handleErrorUtility(error, "Failed to upload template file");
        }
    });

    const updateStyle = (key: PptxTemplateKey, path: string, value: any) => {
        if (!templates) return;
        const currentTemplate = templates[key];
        const newStyles = { ...currentTemplate.styles };
        set(newStyles, path, value);
        queryClient.setQueryData(templateKeys.pptx(), (old: Record<string, PptxTemplate> | undefined) => {
            if (!old) return {};
            return {
                ...old,
                [key]: {
                    ...old[key],
                    styles: newStyles,
                },
            };
        });
    };

    const saveChanges = (key: PptxTemplateKey) => {
        if (!templates || !templates[key]) return;
        const stylesToSave = templates[key].styles;
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
        uploadTemplateFile,
    };
}


export function useDeletePptxTemplate() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();

    return useMutation<any, Error, string>({
        mutationFn: async (templateId: string) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return deletePptxTemplateApi(templateId, token);
        },
        onSuccess: (data, templateId) => {
            queryClient.invalidateQueries({ queryKey: templateKeys.pptx() });
            toast({ title: "Template Deleted", description: `Template "${templateId}" was deleted.` });
        },
        onError: (error) => {
            handleErrorUtility(error, "Failed to delete template");
        }
    });
}
