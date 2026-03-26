'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { container } from '@/infrastructure/di/container';
import { NotificationApiClient } from '@/modules/users/adapters/api-client/NotificationApiClient';
import { notificationKeys } from '@/infrastructure/api/query-keys';

export function useNotifications() {
  const { firebaseUser } = useAuth();

  const query = useQuery({
    queryKey: notificationKeys.lists(),
    queryFn: async () => {
      if (!firebaseUser) return [];
      const client = container.resolve(NotificationApiClient);
      const result = await client.fetchNotifications();
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
        const client = container.resolve(NotificationApiClient);
        return client.sendNotification(data);
    },
    markAsRead: (ids: string[]) => markMutation.mutate(ids),
    clearNotifications: (ids: string[]) => clearMutation.mutate(ids),
    isSending: false, // Placeholder
  };
}

export function useMarkNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationIds: string[]) => {
      const client = container.resolve(NotificationApiClient);
      const result = await client.markAsRead(notificationIds);
      if (result.isFailure) throw result.error;
      return result.getValue();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all() });
    },
  });
}

export function useClearNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationIds: string[]) => {
      const client = container.resolve(NotificationApiClient);
      const result = await client.clearNotifications(notificationIds);
      if (result.isFailure) throw result.error;
      return result.getValue();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all() });
    },
  });
}
