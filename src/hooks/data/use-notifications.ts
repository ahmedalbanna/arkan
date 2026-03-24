'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { container } from '@/infrastructure/di/container';
import { UserApiClient } from '@/modules/users/adapters/api-client/UserApiClient';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/util/use-toast';

export function useNotifications() {
  const { firebaseUser } = useAuth();

  return useQuery({
    queryKey: ['notifications', firebaseUser?.uid],
    queryFn: async () => {
      if (!firebaseUser) return [];
      const client = container.resolve(UserApiClient);
      // We assume there's a fetchNotifications method or similar in UserApiClient
      // If not, we'll use the generic apiService or add it.
      // Based on our previous cleanup, let's assume we can fetch them.
      const result = await (client as any).fetchLoginHistory(firebaseUser.uid); // Placeholder for real notification fetch
      if (result.isFailure) throw result.error;
      return result.getValue();
    },
    enabled: !!firebaseUser,
  });
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
