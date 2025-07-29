
'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { handleErrorUtility } from "@/lib/errorUtils";
import { getAuthenticatedToken } from "@/lib/authUtils";
import {
  fetchPptxTemplates,
  updatePptxTemplate,
  createPptxTemplate,
  deletePptxTemplate,
  type PptxTemplate,
} from "@/services/template-service";
import type { PptxStyleOptions, PptxTemplateKey } from '@/lib/types';


export const pptxTemplateKeys = {
  all: ["pptx-templates"] as const,
  lists: () => [...pptxTemplateKeys.all, "list"] as const,
};

export function usePptxStyles() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    const [localChanges, setLocalChanges] = React.useState<Record<string, PptxStyleOptions>>({});

    const { data: templates, isLoading, isError } = useQuery<Record<string, PptxTemplate>>({
        queryKey: pptxTemplateKeys.lists(),
        queryFn: fetchPptxTemplates, // This is a public endpoint now, no token needed
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

export function useCreatePptxTemplate() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    return useMutation({
        mutationFn: async (data: {id: string, name: string, description: string}) => {
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
        mutationFn: async (templateKey: string) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return deletePptxTemplate(templateKey, token);
        },
        onSuccess: (data, templateKey) => {
            queryClient.invalidateQueries({ queryKey: pptxTemplateKeys.lists() });
            toast({ title: "Template Deleted", description: `Template "${templateKey}" has been deleted.` });
        },
        onError: (error: Error) => {
            handleErrorUtility(error, "Failed to delete template");
        }
    });
}
