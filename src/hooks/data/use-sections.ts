
// src/hooks/data/useSections.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { sectionKeys } from '@/lib/query-keys';
import { fetchSections as fetchSectionsApi, createSection as createSectionApi, updateSection as updateSectionApi, deleteSection as deleteSectionApi } from '@/services/api/sectionService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/util/use-toast';
import { useSession } from 'next-auth/react';
import { Section, type SectionProperties } from '@/lib/models';

export function useSections() {
  const { data: session } = useSession();
  return useQuery({
    queryKey: sectionKeys.lists(),
    queryFn: async () => {
      if (!session?.user?.id) throw new Error("User not authenticated");
      const token = session.user.id;
      const sectionsData = await fetchSectionsApi(token);
      // Instantiate Section objects
      return sectionsData.map(s => new Section(s));
    },
    enabled: !!session?.user?.id,
  });
}

export function useCreateSection() {
    const queryClient = useQueryClient();
    const { data: session } = useSession();
    return useMutation({
        mutationFn: async (data: Omit<SectionProperties, 'id'> & { id: string }) => {
            if (!session?.user?.id) throw new Error("User not authenticated");
            return createSectionApi(data, session.user.id);
        },
        onSuccess: () => {
            toast({ title: 'Section Created', description: 'The new section has been successfully added.' });
            queryClient.invalidateQueries({ queryKey: sectionKeys.lists() });
        },
        onError: (error) => {
            toast({ title: "Creation Failed", description: error instanceof Error ? error.message : 'Could not create section.', variant: "destructive" });
        }
    });
}

export function useUpdateSection() {
    const queryClient = useQueryClient();
    const { data: session } = useSession();
    return useMutation({
        mutationFn: async ({ sectionId, data }: { sectionId: string, data: Partial<SectionProperties>}) => {
            if (!session?.user?.id) throw new Error("User not authenticated");
            return updateSectionApi(sectionId, data, session.user.id);
        },
        onSuccess: (data) => {
            toast({ title: 'Section Updated', description: `Section "${data.title}" has been updated.` });
            queryClient.invalidateQueries({ queryKey: sectionKeys.lists() });
            if (data.id) {
                queryClient.invalidateQueries({ queryKey: sectionKeys.detail(data.id) });
            }
        },
        onError: (error) => {
            toast({ title: "Update Failed", description: error instanceof Error ? error.message : 'Could not update section.', variant: "destructive" });
        }
    });
}


export function useDeleteSection() {
    const queryClient = useQueryClient();
    const { data: session } = useSession();
    return useMutation({
        mutationFn: async (sectionId: string) => {
            if (!session?.user?.id) throw new Error("User not authenticated");
            return deleteSectionApi(sectionId, session.user.id);
        },
        onSuccess: () => {
            toast({ title: 'Section Deleted', description: 'The section has been removed.' });
            queryClient.invalidateQueries({ queryKey: sectionKeys.lists() });
        },
        onError: (error) => {
            toast({ title: "Delete Failed", description: error instanceof Error ? error.message : 'Could not delete section.', variant: "destructive" });
        }
    });
}
