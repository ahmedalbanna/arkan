'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { rtdb } from '@/lib/firebase/client-init';
import { ref, onValue, off } from 'firebase/database';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markNotificationsAsReadAction, clearNotificationsAction } from '@/app/actions/notificationActions';
import type { Notification } from '@/lib/types';
import { toast } from '@/hooks/util/use-toast';
import { notificationKeys } from '@/lib/query-keys';

// Real-time notifications via RTDB
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
      } else {
        setNotifications([]);
      }
    });

    return () => off(notificationsRef, 'value', listener);
  }, [firebaseUser?.uid]);

  return { notifications };
}

export function useMarkNotificationsAsRead() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();

  return useMutation({
    mutationFn: async (notificationIds: string[]) => {
      if (!firebaseUser) throw new Error('User not authenticated');
      return markNotificationsAsReadAction(notificationIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useClearAllNotifications() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();

  return useMutation({
    mutationFn: async (notificationIds: string[]) => {
      if (!firebaseUser) throw new Error('User not authenticated');
      return clearNotificationsAction(notificationIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      toast({ title: 'Success', description: 'All notifications cleared.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error Clearing Notifications', description: error.message, variant: 'destructive' });
    },
  });
}
