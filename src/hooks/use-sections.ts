// C:\Users\ahmed\source\repos\arkan\src\hooks\use-sections.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchSections,
  createSection,
  updateSection,
  deleteSection,
} from '@/services/section-service';
import { useAuth } from '@/context/AuthContext';
import { toast } from './use-toast';
import { handleErrorUtility } from '@/lib/errorUtils';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { DynamicSection } from './useSectionStore';
import { sectionKeys } from '@/lib/query-keys';

export function useSections() {
  const { firebaseUser } = useAuth();
  return useQuery<DynamicSection[]>({
    queryKey: sectionKeys.lists(),
    queryFn: async () => {
      const token = await getAuthenticatedToken(firebaseUser);
      return fetchSections(token);
    },
    enabled: !!firebaseUser,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCreateSection() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();
  return useMutation<DynamicSection, Error, Omit<DynamicSection, 'id'> & { id: string }>({
    mutationFn: async (data) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return createSection(data, token);
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
  return useMutation<DynamicSection, Error, { sectionId: string; data: Partial<DynamicSection> }>({
    mutationFn: async (variables) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return updateSection(variables.sectionId, variables.data, token);
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
      return deleteSection(sectionId, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sectionKeys.lists() });
      toast({ title: 'Success', description: 'Section deleted successfully.' });
    },
    onError: (error) => handleErrorUtility(error, 'Failed to delete section'),
  });
}
