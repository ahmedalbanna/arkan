
'use client';

import { getAuthenticatedToken } from '@/core/utils/authUtils';
import { handleErrorUtility } from '@/core/utils/errorUtils';
import { useMutation } from '@tanstack/react-query';

// Note: The `useNotifications` hook which used `onValue` is now integrated into `useChatStore`.
// This file is kept for the mutation hooks which are still relevant.

export interface Notification {
  id: string;
  title: string;
  description: string;
  icon: 'credit-card' | 'bot' | 'file-text' | 'user-plus';
  isRead: boolean;
  createdAt: string;
  link?: string;
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
        const error = await response.json();
        throw new Error(error.message || 'Failed to mark notifications as read');
    }
    return response.json();
}

async function clearNotificationsApi(notificationIds: string[], token: string): Promise<any> {
    const response = await fetch('/api/notifications/clear', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ notificationIds }),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to clear notifications');
    }
    return response.json();
}

/**
 * Custom mutation hook to mark notifications as read in the Realtime Database.
 */
export function useMarkNotificationsAsRead() {
    // This hook doesn't need to invalidate queries anymore because the real-time listener will handle UI updates.
    return useMutation<any, Error, string[]>({
        mutationFn: async (notificationIds) => {
            if (notificationIds.length === 0) return;
            // The token is now fetched within the component/action that calls the mutation
            // This is a placeholder for where the auth logic would be.
            const { getAuth } = await import('firebase/auth');
            const auth = getAuth();
            const user = auth.currentUser;
            const token = await getAuthenticatedToken(user);
            return markNotificationsAsReadApi(notificationIds, token);
        },
        onError: (error) => {
            handleErrorUtility(error, "Could not update notifications");
        }
    });
}


/**
 * Custom mutation hook to clear a specific list of notifications for the current user.
 */
export function useClearAllNotifications() {
     // This hook doesn't need to invalidate queries anymore because the real-time listener will handle UI updates.
    return useMutation<any, Error, string[]>({
        mutationFn: async (notificationIds) => {
            if (notificationIds.length === 0) return;
             const { getAuth } = await import('firebase/auth');
            const auth = getAuth();
            const user = auth.currentUser;
            const token = await getAuthenticatedToken(user);
            return clearNotificationsApi(notificationIds, token);
        },
        onError: (error) => {
            handleErrorUtility(error, "Could not clear notifications");
        }
    });
}
