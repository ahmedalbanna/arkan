'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { container } from '@/infrastructure/di/container';
import { SettingsApiClient } from '@/modules/admin/adapters/api-client/SettingsApiClient';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/util/use-toast';
import { AppSettings } from '@/modules/admin/domain/entities/Settings';

export function useSettings() {
  const { firebaseUser } = useAuth();

  return useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      if (!firebaseUser) return null;
      const client = container.resolve(SettingsApiClient);
      const result = await client.fetchSettings();
      if (result.isFailure) throw result.error;
      return result.getValue();
    },
    enabled: !!firebaseUser,
  });
}

export function usePublicSettings() {
  return useQuery({
    queryKey: ['public-settings'],
    queryFn: async () => {
      const client = container.resolve(SettingsApiClient);
      const result = await client.fetchSettings();
      if (result.isFailure) throw result.error;
      return result.getValue();
    }
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: AppSettings) => {
      const client = container.resolve(SettingsApiClient);
      const result = await client.updateSettings(data);
      if (result.isFailure) throw result.error;
      return result.getValue();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      queryClient.invalidateQueries({ queryKey: ['public-settings'] });
      toast({ title: 'Success', description: 'Settings updated successfully.' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to update settings.', variant: 'destructive' });
    },
  });
}
