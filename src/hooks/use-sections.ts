
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchSections as fetchSectionsApi,
  createSection as createSectionApi,
  updateSection as updateSectionApi,
  deleteSection as deleteSectionApi,
} from '@/services/section-service';
import { useAuth } from '@/context/AuthContext';
import { toast } from './use-toast';
import { handleErrorUtility } from '@/lib/errorUtils';
import { getAuthenticatedToken } from '@/lib/authUtils';

import { sectionKeys } from '@/lib/query-keys';
import { Section, type SectionProperties } from '@/lib/models/section'; // NEW: Import our class

/**
 * Fetches dynamic sections.
 * Returns instances of the Section CLASS.
 */
export function useSections() {
  const { firebaseUser } = useAuth();
  return useQuery<Section[], Error, SectionProperties[]>({
    queryKey: sectionKeys.lists(),
    queryFn: async () => {
      const token = await getAuthenticatedToken(firebaseUser);
      return fetchSectionsApi(token);
    },
    enabled: !!firebaseUser,
    staleTime: 1000 * 60 * 5, // 5 minutes
    // NEW: Transform the raw data into an array of Section instances
    select: (data): Section[] => {
      if (!data) return [];
      return data.map(s => new Section(s));
    }
  });
}

export function useCreateSection() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();
  // Mutation still works with the plain SectionProperties object for the API
  return useMutation<SectionProperties, Error, Omit<SectionProperties, 'id'> & { id: string }>({
    mutationFn: async (data) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return createSectionApi(data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sectionKeys.lists() });
      toast({ title: 'Success', description: 'Section created successfully.' });
    },
    onError: (error) => handleErrorUtility(error, 'Failed to create section'),
  });
}

export function useUpdateSection() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();
  return useMutation<SectionProperties, Error, { sectionId: string; data: Partial<SectionProperties> }>({
    mutationFn: async (variables) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return updateSectionApi(variables.sectionId, variables.data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sectionKeys.lists() });
      toast({ title: 'Success', description: 'Section updated successfully.' });
    },
    onError: (error) => handleErrorUtility(error, 'Failed to update section'),
  });
}

export function useDeleteSection() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();
  return useMutation<void, Error, string>({
    mutationFn: async (sectionId) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return deleteSectionApi(sectionId, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sectionKeys.lists() });
      toast({ title: 'Success', description: 'Section deleted successfully.' });
    },
    onError: (error) => handleErrorUtility(error, 'Failed to delete section'),
  });
}
