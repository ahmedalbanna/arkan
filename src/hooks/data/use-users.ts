'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userKeys } from '@/lib/query-keys';
import { handleErrorUtility } from '@/lib/utils/errorUtils';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks';
import {
  UserApiClient,
  type CreateUserInput,
  type CreateUserResponse,
  type SendNotificationInput,
} from '@/modules/users/adapters/api-client/UserApiClient';
import { User, type UserProfile } from '@/modules/users/domain/entities/User';
import { runAuthenticatedResultCall } from './authenticated-client-call';

export function useUserProfile(userId: string) {
  const { firebaseUser } = useAuth();

  return useQuery({
    queryKey: userKeys.profile(userId),
    queryFn: async () => {
      if (!firebaseUser) {
        return null;
      }

      const userProfile = await runAuthenticatedResultCall(firebaseUser, UserApiClient, (client, token) =>
        client.fetchUserById(userId, token),
      );

      return userProfile ? new User(userProfile) : null;
    },
    enabled: Boolean(firebaseUser && userId),
  });
}

export function useCreateUser(options?: { onSuccess?: (data: CreateUserResponse) => void }) {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateUserInput) =>
      runAuthenticatedResultCall(firebaseUser, UserApiClient, (client, token) => client.createUser(data, token)),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      options?.onSuccess?.(data);
    },
    onError: (error) => handleErrorUtility(error, 'Create User Failed'),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();

  return useMutation({
    mutationFn: async (variables: { userId: string; data: Partial<UserProfile> }) =>
      runAuthenticatedResultCall(firebaseUser, UserApiClient, (client, token) =>
        client.updateUser(variables.userId, variables.data, token),
      ),
    onSuccess: (data) => {
      toast({ title: 'Success', description: 'User profile has been successfully updated.' });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.profile(data.id) });
    },
    onError: (error) => handleErrorUtility(error, 'Update Failed'),
  });
}

export function useAdminUpdateUser() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();

  return useMutation({
    mutationFn: async (variables: { userId: string; data: Partial<UserProfile> }) =>
      runAuthenticatedResultCall(firebaseUser, UserApiClient, (client, token) =>
        client.adminUpdateUser(variables.userId, variables.data, token),
      ),
    onSuccess: (data) => {
      toast({ title: 'Success', description: 'User profile has been successfully updated.' });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.profile(data.id) });
    },
    onError: (error) => handleErrorUtility(error, 'Update Failed'),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();

  return useMutation({
    mutationFn: async (userId: string) =>
      runAuthenticatedResultCall(firebaseUser, UserApiClient, (client, token) => client.deleteUser(userId, token)),
    onSuccess: (_data, userId) => {
      toast({ title: 'User Deleted', description: `User with ID ${userId} has been removed.` });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
    onError: (error) => handleErrorUtility(error, 'Delete Failed'),
  });
}

export function useSendNotification() {
  const { firebaseUser } = useAuth();

  return useMutation({
    mutationFn: async (variables: SendNotificationInput) =>
      runAuthenticatedResultCall(firebaseUser, UserApiClient, (client, token) =>
        client.sendNotification(variables, token),
      ),
    onSuccess: () => {
      toast({ title: 'Notification Sent', description: 'The user has been notified of the changes.' });
    },
    onError: (error: unknown) => {
      let errorMessage = 'Failed to send notification.';

      if (error instanceof Error && !error.message.includes('token not found')) {
        errorMessage = error.message;
      }

      toast({ title: 'Notification Error', description: errorMessage, variant: 'destructive' });
    },
  });
}
