'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { container } from '@/infrastructure/di/container';
import { UserApiClient, CreateUserInput } from '@/modules/users/adapters/api-client/UserApiClient';
import { userKeys } from '@/lib/query-keys';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/util/use-toast';
import { UserProfile } from '@/modules/users/domain/entities/User';

export function useUserProfile(userId: string) {
  const { firebaseUser } = useAuth();

  return useQuery({
    queryKey: userKeys.profile(userId),
    queryFn: async () => {
      if (!firebaseUser || !userId) return null;
      const client = container.resolve(UserApiClient);
      const result = await client.fetchUserProfile(userId);
      if (result.isFailure) throw result.error;
      return result.getValue();
    },
    enabled: !!firebaseUser && !!userId,
  });
}

export function usePaginatedUsers(options: { limit: number; lastVisibleId?: string | null }) {
  const { firebaseUser } = useAuth();

  return useQuery({
    queryKey: userKeys.list(options),
    queryFn: async () => {
      if (!firebaseUser) return null;
      const client = container.resolve(UserApiClient);
      const result = await client.getPaginatedUsers({
          limit: options.limit,
          lastVisibleId: options.lastVisibleId ?? undefined
      });
      if (result.isFailure) throw result.error;
      return result.getValue();
    },
    enabled: !!firebaseUser,
  });
}

export function useCreateUser(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: any) => {
      const client = container.resolve(UserApiClient);
      const result = await client.createUser(data);
      if (result.isFailure) throw result.error;
      return result.getValue();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all() });
      toast({ title: 'Success', description: 'User created successfully.' });
      options?.onSuccess?.();
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to create user.', variant: 'destructive' });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data, userId }: { id: string; data: Partial<UserProfile>, userId?: string }) => {
      const client = container.resolve(UserApiClient);
      const result = await client.updateUser(id || userId || '', data);
      if (result.isFailure) throw result.error;
      return result.getValue();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.profile(data.id) });
      queryClient.invalidateQueries({ queryKey: userKeys.all() });
      toast({ title: 'Success', description: 'User updated successfully.' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to update user.', variant: 'destructive' });
    },
  });
}

export function useAdminUpdateUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data, userId }: { id: string; data: Partial<UserProfile>, userId?: string }) => {
      const client = container.resolve(UserApiClient);
      const result = await client.adminUpdateUser({ id: id || userId || '', data });
      if (result.isFailure) throw result.error;
      return result.getValue();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.profile(data.id) });
      queryClient.invalidateQueries({ queryKey: userKeys.all() });
      toast({ title: 'Success', description: 'User updated successfully.' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to update user.', variant: 'destructive' });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const client = container.resolve(UserApiClient);
      const result = await client.deleteUser(id);
      if (result.isFailure) throw result.error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all() });
      toast({ title: 'Success', description: 'User deleted successfully.' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to delete user.', variant: 'destructive' });
    },
  });
}
