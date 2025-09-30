
'use client';

import { useAuth } from '@/context/AuthContext';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { handleErrorUtility } from '@/lib/errorUtils';
import {
  createSection as createSectionApi,
  deleteSection as deleteSectionApi,
  fetchSections as fetchSectionsApi,
  updateSection as updateSectionApi,
} from '@/services';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from './use-toast';

import { sectionKeys } from '@/lib/core/query-keys';
import { Section, type SectionProperties } from '@/lib/models/section'; // NEW: Import our class

/**
 * Fetches dynamic sections.
 * Returns instances of the Section CLASS.
 */
export function useSections() {
  const { firebaseUser } = useAuth();
  return useQuery<Section[]>({ // Return type is now Section[]
    queryKey: sectionKeys.lists(),
    queryFn: async () => {
      const token = await getAuthenticatedToken(firebaseUser);
      const data = await fetchSectionsApi(token);
      // Transform plain objects to class instances
      return data.map(s => new Section(s as SectionProperties));
    },
    enabled: !!firebaseUser,
    staleTime: 1000 * 60 * 5, // 5 minutes
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
