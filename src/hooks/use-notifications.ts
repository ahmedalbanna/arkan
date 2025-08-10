
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { Notification } from '@/lib/types';
import { getDatabase, ref, onValue, off, query, orderByChild, limitToLast } from "firebase/database";
import { app } from "@/lib/firebaseConfig";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { handleErrorUtility } from '@/lib/errorUtils';

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
 * Custom hook to fetch notifications for the current user using Realtime Database.
 */
export function useNotifications() {
  const { firebaseUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!firebaseUser) {
      setNotifications([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const db = getDatabase(app);
    const notificationsRef = query(
        ref(db, 'notifications/' + firebaseUser.uid),
        orderByChild('createdAt'),
        limitToLast(20)
    );

    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      const notificationsList: Notification[] = [];
      if (data) {
        Object.keys(data).forEach(key => {
          notificationsList.push({
            id: key,
            ...data[key]
          } as Notification);
        });
        notificationsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      setNotifications(notificationsList);
      setIsLoading(false);
    }, (err) => {
      console.error("Error fetching notifications from Realtime Database:", err);
      setError(err);
      setIsLoading(false);
    });

    return () => {
      off(notificationsRef, 'value', unsubscribe);
    };
  }, [firebaseUser]);

  return { data: notifications, isLoading, isError: !!error };
}

/**
 * Custom mutation hook to mark notifications as read in the Realtime Database.
 */
export function useMarkNotificationsAsRead() {
    const { firebaseUser } = useAuth();
    
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
