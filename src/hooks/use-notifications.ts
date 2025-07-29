
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationKeys } from '@/lib/query-keys';
import { useAuth } from '@/context/AuthContext';
import { handleErrorUtility } from '@/lib/errorUtils';
import { getAuthenticatedToken } from '@/lib/authUtils';
import type { Notification } from '@/lib/types';
import { toast } from './use-toast';

async function fetchNotificationsApi(token: string): Promise<Notification[]> {
    const response = await fetch('/api/notifications', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error('Failed to fetch notifications');
    }
    return response.json();
}

async function markNotificationsAsReadApi(notificationIds: string[], token: string): Promise<any> {
    const response = await fetch('/api/notifications/mark-as-read', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ notificationIds }),
    });
    if (!response.ok) {
        throw new Error('Failed to mark notifications as read');
    }
    return response.json();
}

/**
 * Custom hook to fetch unread notifications for the current user.
 */
export function useNotifications() {
  const { firebaseUser } = useAuth();
  
  return useQuery<Notification[]>({
    queryKey: notificationKeys.lists(),
    queryFn: async () => {
        const token = await getAuthenticatedToken(firebaseUser);
        return fetchNotificationsApi(token);
    },
    enabled: !!firebaseUser,
    staleTime: 1000 * 60, // 1 minute
    refetchOnWindowFocus: true,
  });
}

/**
 * Custom mutation hook to mark notifications as read.
 */
export function useMarkNotificationsAsRead() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    
    return useMutation<any, Error, string[]>({
        mutationFn: async (notificationIds) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return markNotificationsAsReadApi(notificationIds, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
        },
        onError: (error) => {
            handleErrorUtility(error, "Could not update notifications");
        }
    });
}
