
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createUserService,
  deleteUser as deleteUserApi,
  fetchUserProfileApi,
  fetchUsersApi,
  sendPasswordResetEmailApi,
  updateUser as updateUserApi,
} from '@/services';
import type { UserProfile } from '@/lib/models';
import { userKeys } from '@/lib/query-keys';
import { handleErrorUtility } from '@/lib/errorUtils';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks';
import { getAuthenticatedToken } from '@/lib/authUtils';


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

  return useQuery<UserProfile | null>({
    queryKey: userKeys.profile(userId),
    queryFn: async () => {
      if (!firebaseUser) return null;
      const token = await getAuthenticatedToken(firebaseUser);
      return fetchUserProfileApi(userId, token);
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
 * Requires authentication. Admins can update any user, regular users can only update their own.
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
