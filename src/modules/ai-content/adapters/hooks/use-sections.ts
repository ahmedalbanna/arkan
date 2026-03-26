'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { container } from '@/infrastructure/di/container';
import { SectionApiClient } from '@/modules/ai-content/adapters/api-client/SectionApiClient';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/util/use-toast';
import { SectionProperties } from '@/modules/ai-content/domain/entities/Section';

const sectionKeys = {
  all: ['sections'] as const,
};

export function useSections() {
  const { firebaseUser } = useAuth();

  return useQuery({
    queryKey: sectionKeys.all,
    queryFn: async () => {
      if (!firebaseUser) return [];
      const client = container.resolve(SectionApiClient);
      const result = await client.fetchSections();
      if (result.isFailure) throw result.error;
      return result.getValue();
    },
    enabled: !!firebaseUser,
  });
}

export function useSaveSection() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Omit<SectionProperties, 'id'> & { id: string }) => {
      const client = container.resolve(SectionApiClient);
      const result = await client.createSection(data);
      if (result.isFailure) throw result.error;
      return result.getValue();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sectionKeys.all });
      toast({ title: 'Success', description: 'Section saved successfully.' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to save section.', variant: 'destructive' });
    },
  });
}

export function useCreateSection() {
    return useSaveSection();
}

export function useUpdateSection() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SectionProperties> }) => {
      const client = container.resolve(SectionApiClient);
      const result = await client.updateSection({ id, data });
      if (result.isFailure) throw result.error;
      return result.getValue();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sectionKeys.all });
      toast({ title: 'Success', description: 'Section updated successfully.' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to update section.', variant: 'destructive' });
    },
  });
}

export function useDeleteSection() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const client = container.resolve(SectionApiClient);
      const result = await client.deleteSection(id);
      if (result.isFailure) throw result.error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sectionKeys.all });
      toast({ title: 'Success', description: 'Section deleted successfully.' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to delete section.', variant: 'destructive' });
    },
  });
}
