// src/hooks/data/useSections.ts
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sectionKeys } from '@/lib/query-keys';
import { SectionApiClient } from '@/modules/ai-content/adapters/api-client/SectionApiClient';
import { toast } from '@/hooks/util/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Section, type SectionProperties } from '@/lib/types';
import { runAuthenticatedResultCall } from './authenticated-client-call';

export function useSections() {
  const { firebaseUser } = useAuth();

  return useQuery({
    queryKey: sectionKeys.lists(),
    queryFn: async () => {
      const sectionsData = await runAuthenticatedResultCall(firebaseUser, SectionApiClient, (client, token) =>
        client.fetchSections(token),
      );
      return sectionsData.map((section) => new Section(section));
    },
    enabled: Boolean(firebaseUser),
  });
}

export function useCreateSection() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();

  return useMutation({
    mutationFn: async (data: Omit<SectionProperties, 'id'> & { id: string }) =>
      runAuthenticatedResultCall(firebaseUser, SectionApiClient, (client, token) => client.createSection(data, token)),
    onSuccess: () => {
      toast({ title: 'Section Created', description: 'The new section has been successfully added.' });
      queryClient.invalidateQueries({ queryKey: sectionKeys.lists() });
    },
    onError: (error: unknown) => {
      const description = error instanceof Error ? error.message : 'Could not create section.';
      toast({ title: 'Creation Failed', description, variant: 'destructive' });
    },
  });
}

export function useUpdateSection() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();

  return useMutation({
    mutationFn: async ({ sectionId, data }: { sectionId: string; data: Partial<SectionProperties> }) =>
      runAuthenticatedResultCall(firebaseUser, SectionApiClient, (client, token) => client.updateSection(sectionId, data, token)),
    onSuccess: (data) => {
      toast({ title: 'Section Updated', description: `Section "${data.title}" has been updated.` });
      queryClient.invalidateQueries({ queryKey: sectionKeys.lists() });
      if (data.id) {
        queryClient.invalidateQueries({ queryKey: sectionKeys.detail(data.id) });
      }
    },
    onError: (error: unknown) => {
      const description = error instanceof Error ? error.message : 'Could not update section.';
      toast({ title: 'Update Failed', description, variant: 'destructive' });
    },
  });
}

export function useDeleteSection() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();

  return useMutation({
    mutationFn: async (sectionId: string) =>
      runAuthenticatedResultCall(firebaseUser, SectionApiClient, (client, token) => client.deleteSection(sectionId, token)),
    onSuccess: () => {
      toast({ title: 'Section Deleted', description: 'The section has been removed.' });
      queryClient.invalidateQueries({ queryKey: sectionKeys.lists() });
    },
    onError: (error: unknown) => {
      const description = error instanceof Error ? error.message : 'Could not delete section.';
      toast({ title: 'Delete Failed', description, variant: 'destructive' });
    },
  });
}
