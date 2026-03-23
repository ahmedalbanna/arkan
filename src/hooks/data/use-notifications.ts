'use client';

import { useState, useEffect } from 'react';
import type { Notification } from '@/modules/users/domain/entities/Notification';
import { useAuth } from '@/context/AuthContext';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import { initializeFirebase } from '@/firebase';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/util/use-toast';
import { notificationKeys } from '@/lib/query-keys';
import { apiService } from '@/infrastructure/api/ApiService';

const { firebaseApp } = initializeFirebase();
const rtdb = getDatabase(firebaseApp);

export function useNotifications() {
  const { firebaseUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!firebaseUser?.uid) {
      setNotifications([]);
      return;
    }

    const notificationsRef = ref(rtdb, `notifications/${firebaseUser.uid}`);

    const listener = onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const notificationsList = Object.keys(data)
          .map((key) => ({ id: key, ...data[key] }))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setNotifications(notificationsList);
        return;
      }

      setNotifications([]);
    });

    return () => off(notificationsRef, 'value', listener);
  }, [firebaseUser?.uid]);

  return { notifications };
}

export function useMarkNotificationsAsRead() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();

  return useMutation({
    mutationFn: async (notificationIds: string[]) =>
      apiService<{ notificationIds: string[] }, unknown>({
        endpoint: '/api/notifications/mark-as-read',
        method: 'POST',
        data: { notificationIds },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    },
    onError: (error: unknown) => {
      const description = error instanceof Error ? error.message : 'Failed to mark notifications as read';
      toast({
        title: 'Error',
        description,
        variant: 'destructive',
      });
    },
  });
}

export function useClearAllNotifications() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();

  return useMutation({
    mutationFn: async (notificationIds: string[]) =>
      apiService<{ notificationIds: string[] }, unknown>({
        endpoint: '/api/notifications/clear',
        method: 'POST',
        data: { notificationIds },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      toast({ title: 'Success', description: 'All notifications cleared.' });
    },
    onError: (error: unknown) => {
      const description = error instanceof Error ? error.message : 'Failed to clear notifications';
      toast({
        title: 'Error Clearing Notifications',
        description,
        variant: 'destructive',
      });
    },
  });
}
