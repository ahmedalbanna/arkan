
'use client';

import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { handleErrorUtility } from '@/lib/errorUtils';
import { onValue, ref } from 'firebase/database';
import { useAuth } from '@/context/AuthContext';
import { RealtimeDatabase } from '@/lib/firebase/client-init';


export interface Notification {
  id: string;
  title: string;
  description: string;
  icon: 'credit-card' | 'bot' | 'file-text' | 'user-plus' | string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

/**
 * Subscribes to and manages real-time notifications for the current user.
 * @returns An object containing the list of notifications.
 */
export function useNotifications() {
  const { firebaseUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!firebaseUser) {
      setNotifications([]);
      return;
    }

    const notificationsRef = ref(RealtimeDatabase, `notifications/${firebaseUser.uid}`);
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const notificationsList = Object.keys(data)
          .map(key => ({ id: key, ...data[key] }))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setNotifications(notificationsList);
      } else {
        setNotifications([]);
      }
    });

    return () => unsubscribe();
  }, [firebaseUser]);

  return { notifications };
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
    const { firebaseUser } = useAuth();
    // This hook doesn't need to invalidate queries anymore because the real-time listener will handle UI updates.
    return useMutation<any, Error, string[]>({
        mutationFn: async (notificationIds) => {
            if (notificationIds.length === 0) return;
            const token = await getAuthenticatedToken(firebaseUser);
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
    const { firebaseUser } = useAuth();
     // This hook doesn't need to invalidate queries anymore because the real-time listener will handle UI updates.
    return useMutation<any, Error, string[]>({
        mutationFn: async (notificationIds) => {
            if (notificationIds.length === 0) return;
            const token = await getAuthenticatedToken(firebaseUser);
            return clearNotificationsApi(notificationIds, token);
        },
        onError: (error) => {
            handleErrorUtility(error, "Could not clear notifications");
        }
    });
}
