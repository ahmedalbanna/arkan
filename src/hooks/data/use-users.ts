
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import {
  createUserService,
  deleteUserApi,
  fetchUserProfileApi,
  updateUserApi,
  sendNotificationApi,
} from '@/services/api/userService';
import { User, type UserProfile } from '@/lib/models';
import { userKeys } from '@/lib/query-keys';
import { handleErrorUtility } from '@/lib/utils/errorUtils';
import { toast } from '@/hooks';


// ============================================================================
// Query Hooks (for fetching data)
// ============================================================================

/**
 * Fetches a specific user's profile.
 * Requires authentication.
 * @param userId - The ID of the user to fetch.
 */
export function useUserProfile(userId: string) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: userKeys.profile(userId),
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const userProfile = await fetchUserProfileApi(userId, session.user.id);
      // Instantiate the User class to include methods
      return userProfile ? new User(userProfile) : null;
    },
    enabled: !!session?.user?.id && !!userId,
  });
}


// ============================================================================
// Mutation Hooks (for creating, updating, deleting data)
// ============================================================================

/**
 * Mutation hook for creating a new user.
 * Requires admin privileges.
 */
export function useCreateUser(options?: { onSuccess?: (data: unknown) => void }) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      if (!session?.user?.id) throw new Error("User not authenticated");
      return createUserService(data, session.user.id);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      options?.onSuccess?.(data);
    },
    onError: (error) => handleErrorUtility(error, "Create User Failed"),
  });
}

/**
 * Mutation hook for updating a user's profile.
 * Requires authentication. Admins can update any user, regular users can only update their own.
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  return useMutation({
    mutationFn: async (variables: { userId: string; data: Partial<UserProfile> }) => {
      if (!session?.user?.id) throw new Error("User not authenticated");
      return updateUserApi(variables.userId, variables.data, session.user.id);
    },
    onSuccess: (data) => {
      toast({ title: 'Success', description: 'User profile has been successfully updated.' });
      // Invalidate both the list and the specific user's detail query
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.profile(data.id) });
    },
    onError: (error) => handleErrorUtility(error, "Update Failed"),
  });
}

/**
 * Mutation hook for deleting a user.
 * Requires admin privileges.
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  return useMutation({
    mutationFn: async (userId: string) => {
      if (!session?.user?.id) throw new Error("User not authenticated");
      return deleteUserApi(userId, session.user.id);
    },
    onSuccess: (data, userId) => {
      toast({ title: "User Deleted", description: `User with ID ${userId} has been removed.` });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
    onError: (error) => handleErrorUtility(error, "Delete Failed"),
  });
}

/**
 * Mutation hook for sending a notification to a user.
 * Requires admin privileges.
 */
export function useSendNotification() {
  const { data: session } = useSession();
  return useMutation({
    mutationFn: async (variables: {
      userId: string;
      title: string;
      body: string;
      link?: string;
    }) => {
      if (!session?.user?.id) throw new Error("User not authenticated");
      return sendNotificationApi(variables, session.user.id);
    },
    onSuccess: () => {
      toast({ title: 'Notification Sent', description: 'The user has been notified of the changes.' });
    },
    onError: (error) => {
      let errorMessage = 'Failed to send notification.';
      // We don't want to bother the admin with "token not found" errors, as they are common.
      if (error instanceof Error && error.message && !error.message.includes('token not found')) {
        errorMessage = error.message;
      }
      toast({ title: 'Notification Error', description: errorMessage, variant: 'destructive' });
    }
  });
}
