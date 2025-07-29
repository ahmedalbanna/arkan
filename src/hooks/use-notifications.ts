
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { Notification } from '@/lib/types';
import { getDatabase, ref, onValue, off, query, orderByChild, equalTo } from "firebase/database";
import { app } from "@/lib/firebase";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { handleErrorUtility } from '@/lib/errorUtils';
import { toast } from './use-toast';
import { notificationKeys } from '@/lib/query-keys';

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

/**
 * Custom hook to fetch unread notifications for the current user using Realtime Database.
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
        orderByChild('isRead'),
        equalTo(false)
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
            const token = await getAuthenticatedToken(firebaseUser);
            return markNotificationsAsReadApi(notificationIds, token);
        },
        // No client-side invalidation needed; the real-time listener will update automatically.
        onError: (error) => {
            handleErrorUtility(error, "Could not update notifications");
        }
    });
}
