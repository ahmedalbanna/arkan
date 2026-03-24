'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/infrastructure/api/ApiService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/util/use-toast';
import { container } from '@/infrastructure/di/container';
import { UserApiClient } from '@/modules/users/adapters/api-client/UserApiClient';

export function useNotifications() {
  const { firebaseUser } = useAuth();

  const query = useQuery({
    queryKey: ['notifications', firebaseUser?.uid],
    queryFn: async () => {
      if (!firebaseUser) return [];
      const result = await apiService<undefined, any[]>({ endpoint: '/api/notifications' });
      return result;
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

  return useMutation({
    mutationFn: async (notificationIds: string[]) => {
      return apiService({ 
          endpoint: '/api/notifications/mark-as-read', 
          method: 'POST', 
          data: { notificationIds } 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useClearNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationIds: string[]) => {
      return apiService({ 
          endpoint: '/api/notifications/clear', 
          method: 'POST', 
          data: { notificationIds } 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
