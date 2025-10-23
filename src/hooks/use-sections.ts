
'use client';

import { useAuth } from '@/context/AuthContext';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { handleErrorUtility } from '@/lib/errorUtils';
import { sectionKeys } from '@/lib/query-keys';
import {
  createSection as createSectionApi,
  deleteSection as deleteSectionApi,
  fetchSections as fetchSectionsApi,
  updateSection as updateSectionApi,
} from '@/services';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from './use-toast';

import { Section, type SectionData } from '@/lib/models/section'; 

/**
 * Fetches dynamic sections and returns them as Section instances.
 */
export function useSections() {
  const { firebaseUser } = useAuth();
  return useQuery<Section[], Error>({ 
    queryKey: sectionKeys.lists(),
    queryFn: async () => {
      const token = await getAuthenticatedToken(firebaseUser);
      const data = await fetchSectionsApi(token);
      return data.map(s => new Section(s as SectionData));
    },
    enabled: !!firebaseUser,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Creates a new section.
 */
export function useCreateSection() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();
  return useMutation<SectionData, Error, Omit<SectionData, 'id'> & { id: string }>({
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

/**
 * Updates an existing section.
 */
export function useUpdateSection() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();
  return useMutation<SectionData, Error, { sectionId: string; data: Partial<SectionData> }>({
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

/**
 * Deletes a section.
 */
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
