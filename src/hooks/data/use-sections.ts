
// src/hooks/data/useSections.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { sectionKeys } from '@/lib/query-keys';
import { fetchSections as fetchSectionsApi, createSection as createSectionApi, updateSection as updateSectionApi, deleteSection as deleteSectionApi } from '@/services/api/sectionService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/util/use-toast';
import { useAuth } from '@/context/AuthContext';
import { getAuthenticatedToken } from '@/lib/utils/authUtils';
import { Section, type SectionProperties } from '@/lib/models';

export function useSections() {
  const { firebaseUser } = useAuth();
  return useQuery({
    queryKey: sectionKeys.lists(),
    queryFn: async () => {
      if (!firebaseUser) throw new Error("User not authenticated");
      const token = await firebaseUser.getIdToken();
      const sectionsData = await fetchSectionsApi(token);
      // Instantiate Section objects
      return sectionsData.map(s => new Section(s));
    },
    enabled: !!firebaseUser,
  });
}

export function useCreateSection() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    return useMutation({
        mutationFn: async (data: Omit<SectionProperties, 'id'> & { id: string }) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return createSectionApi(data, token);
        },
        onSuccess: () => {
            toast({ title: 'Section Created', description: 'The new section has been successfully added.' });
            queryClient.invalidateQueries({ queryKey: sectionKeys.lists() });
        },
        onError: (error: any) => {
            toast({ title: "Creation Failed", description: error.message || 'Could not create section.', variant: "destructive" });
        }
    });
}

export function useUpdateSection() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    return useMutation({
        mutationFn: async ({ sectionId, data }: { sectionId: string, data: Partial<SectionProperties>}) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return updateSectionApi(sectionId, data, token);
        },
        onSuccess: (data) => {
            toast({ title: 'Section Updated', description: `Section "${data.title}" has been updated.` });
            queryClient.invalidateQueries({ queryKey: sectionKeys.lists() });
            queryClient.invalidateQueries({ queryKey: sectionKeys.detail(data.id) });
        },
        onError: (error: any) => {
            toast({ title: "Update Failed", description: error.message || 'Could not update section.', variant: "destructive" });
        }
    });
}


export function useDeleteSection() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    return useMutation({
        mutationFn: async (sectionId: string) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return deleteSectionApi(sectionId, token);
        },
        onSuccess: () => {
            toast({ title: 'Section Deleted', description: 'The section has been removed.' });
            queryClient.invalidateQueries({ queryKey: sectionKeys.lists() });
        },
        onError: (error: any) => {
            toast({ title: "Delete Failed", description: error.message || 'Could not delete section.', variant: "destructive" });
        }
    });
}
