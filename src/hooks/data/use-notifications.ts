'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { container } from '@/infrastructure/di/container';
import { UserApiClient } from '@/modules/users/adapters/api-client/UserApiClient';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/util/use-toast';

export function useNotifications() {
  const { firebaseUser } = useAuth();

  const query = useQuery({
    queryKey: ['notifications', firebaseUser?.uid],
    queryFn: async () => {
      if (!firebaseUser) return [];
      const client = container.resolve(UserApiClient);
      const result = await (client as any).fetchLoginHistory(firebaseUser.uid); 
      if (result.isFailure) throw result.error;
      return result.getValue();
    },
    enabled: !!firebaseUser,
  });

  const markMutation = useMarkNotificationsAsRead();
  const clearMutation = useClearNotifications();

  return {
    notifications: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    sendNotification: (data: any) => {
        const client = container.resolve(UserApiClient);
        return client.sendNotification(data);
    },
    markAsRead: (ids: string[]) => markMutation.mutate(ids),
    clearNotifications: (ids: string[]) => clearMutation.mutate(ids),
    isSending: false, // Placeholder
  };
}

export function useMarkNotificationsAsRead() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();

  return useMutation({
    mutationFn: async (notificationIds: string[]) => {
      if (!firebaseUser) throw new Error('Not authenticated');
      const client = container.resolve(UserApiClient);
      // Assuming a method exists or adding it to the client
      const result = await (client as any).markNotificationsAsRead(firebaseUser.uid, notificationIds);
      if (result.isFailure) throw result.error;
      return result.getValue();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useClearNotifications() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();

  return useMutation({
    mutationFn: async (notificationIds: string[]) => {
      if (!firebaseUser) throw new Error('Not authenticated');
      const client = container.resolve(UserApiClient);
      const result = await (client as any).clearNotifications(firebaseUser.uid, notificationIds);
      if (result.isFailure) throw result.error;
      return result.getValue();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
