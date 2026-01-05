
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  createUserAction, 
  deleteUserAction, 
  getUserProfileAction, 
  updateUserAction, 
  sendNotificationAction 
} from '@/app/actions/userActions';
import { User, type UserProfile } from '@/lib/models';
import { userKeys } from '@/lib/query-keys';
import { handleErrorUtility } from '@/lib/utils/errorUtils';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks';

// ============================================================================
// Query Hooks (for fetching data)
// ============================================================================

export function useUserProfile(userId: string) {
  const { firebaseUser } = useAuth();

  return useQuery({
    queryKey: userKeys.profile(userId),
    queryFn: async () => {
      if (!firebaseUser) return null;
      const userProfile = await getUserProfileAction(userId);
      return userProfile ? new User(userProfile) : null;
    },
    enabled: !!firebaseUser && !!userId,
  });
}

// ============================================================================
// Mutation Hooks (for creating, updating, deleting data)
// ============================================================================

export function useCreateUser(options?: { onSuccess?: (data: any) => void }) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      return createUserAction(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      options?.onSuccess?.(data);
    },
    onError: (error) => handleErrorUtility(error, "Create User Failed"),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (variables: { userId: string; data: Partial<UserProfile> }) => {
      return updateUserAction(variables.userId, variables.data);
    },
    onSuccess: (data) => {
      toast({ title: 'Success', description: 'User profile has been successfully updated.' });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.profile(data.id) });
    },
    onError: (error) => handleErrorUtility(error, "Update Failed"),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      return deleteUserAction(userId);
    },
    onSuccess: (_, userId) => {
      toast({ title: "User Deleted", description: `User with ID ${userId} has been removed.` });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
    onError: (error) => handleErrorUtility(error, "Delete Failed"),
  });
}

export function useSendNotification() {
  return useMutation({
    mutationFn: async (variables: {
      userId: string;
      title: string;
      body: string;
      link?: string;
    }) => {
      return sendNotificationAction(variables);
    },
    onSuccess: () => {
      toast({ title: 'Notification Sent', description: 'The user has been notified of the changes.' });
    },
    onError: (error: any) => {
      let errorMessage = 'Failed to send notification.';
      if (error?.message && !error.message.includes('token not found')) {
        errorMessage = error.message;
      }
      toast({ title: 'Notification Error', description: errorMessage, variant: 'destructive' });
    }
  });
}
