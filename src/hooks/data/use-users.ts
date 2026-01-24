
'use client';

import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks';
import { User, type UserProfile } from '@/lib/models';
import { userKeys } from '@/lib/query-keys';
import { getAuthenticatedToken } from '@/lib/utils/authUtils';
import { handleErrorUtility } from '@/lib/utils/errorUtils';
import {
  adminUpdateUserApi,
  createUserService,
  deleteUserApi,
  fetchUserProfileApi,
  sendNotificationApi,
  updateUserApi,
} from '@/services/api/userService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';


// ============================================================================
// Query Hooks (for fetching data)
// ============================================================================

/**
 * Fetches a specific user's profile.
 * Requires authentication.
 * @param userId - The ID of the user to fetch.
 */
export function useUserProfile(userId: string) {
  const { firebaseUser } = useAuth();

  return useQuery({
    queryKey: userKeys.profile(userId),
    queryFn: async () => {
      if (!firebaseUser) return null;
      const token = await getAuthenticatedToken(firebaseUser);
      const userProfile = await fetchUserProfileApi(userId, token);
      // Instantiate the User class to include methods
      return userProfile ? new User(userProfile) : null;
    },
    enabled: !!firebaseUser && !!userId,
  });
}


// ============================================================================
// Mutation Hooks (for creating, updating, deleting data)
// ============================================================================

/**
 * Mutation hook for creating a new user.
 * Requires admin privileges.
 */
export function useCreateUser(options?: { onSuccess?: (data: any) => void }) {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();
  return useMutation({
    mutationFn: async (data: any) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return createUserService(data, token);
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
 * Requires authentication. This is for users updating their OWN profile.
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();
  return useMutation({
    mutationFn: async (variables: { userId: string; data: Partial<UserProfile> }) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return updateUserApi(variables.userId, variables.data, token);
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
 * Mutation hook for ADMINS updating a user's profile.
 */
export function useAdminUpdateUser() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();
  return useMutation({
    mutationFn: async (variables: { userId: string; data: Partial<UserProfile> }) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return adminUpdateUserApi(variables.userId, variables.data, token);
    },
    onSuccess: (data) => {
      toast({ title: 'Success', description: 'User profile has been successfully updated.' });
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
  const { firebaseUser } = useAuth();
  return useMutation({
    mutationFn: async (userId: string) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return deleteUserApi(userId, token);
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
  const { firebaseUser } = useAuth();
  return useMutation({
    mutationFn: async (variables: {
      userId: string;
      title: string;
      body: string;
      link?: string;
    }) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return sendNotificationApi(variables, token);
    },
    onSuccess: () => {
      toast({ title: 'Notification Sent', description: 'The user has been notified of the changes.' });
    },
    onError: (error: any) => {
      let errorMessage = 'Failed to send notification.';
      // We don't want to bother the admin with "token not found" errors, as they are common.
      if (error?.message && !error.message.includes('token not found')) {
        errorMessage = error.message;
      }
      toast({ title: 'Notification Error', description: errorMessage, variant: 'destructive' });
    }
  });
}
