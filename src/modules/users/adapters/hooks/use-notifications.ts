'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { container } from '@/infrastructure/di/container';
import { NotificationApiClient } from '@/modules/users/adapters/api-client/NotificationApiClient';
import { notificationKeys } from '@/infrastructure/api/query-keys';
import { handleErrorUtility } from '@/infrastructure/api/errorUtils';

export function useNotifications() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: notificationKeys.lists(),
    queryFn: async () => {
      if (!user) return [];
      const client = container.resolve(NotificationApiClient);
      const result = await client.fetchNotifications();
      if (result.isFailure) throw result.error;
      return result.getValue();
    },
    enabled: !!user,
  });

  const markMutation = useMarkNotificationsAsRead();
  const clearMutation = useClearNotifications();

  return {
    notifications: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    sendNotification: async (data: any) => {
        const client = container.resolve(NotificationApiClient);
        const result = await client.sendNotification(data);
        if (result.isFailure) handleErrorUtility(result.error, 'Failed to send notification');
        return result;
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
    onError: (error) => handleErrorUtility(error, 'Failed to mark notifications as read'),
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
    onError: (error) => handleErrorUtility(error, 'Failed to clear notifications'),
  });
}
