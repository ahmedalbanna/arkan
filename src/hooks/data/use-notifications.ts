'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getDatabase } from 'firebase/database';
import { initializeFirebase } from '@/firebase'; // Assuming this correctly initializes firebaseApp
import { ref, onValue, off } from 'firebase/database';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Notification } from '@/lib/types';
import { toast } from '@/hooks/util/use-toast';
import { notificationKeys } from '@/lib/query-keys';




/**
 * A real-time hook to fetch notifications for the current user from Firebase Realtime Database.
 * @returns An object containing the list of notifications.
 */
export function useNotifications() {
    const { firebaseUser } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const { firebaseApp } = initializeFirebase();
    // Ensure that firebaseApp is properly initialized with databaseURL in your firebase config
    // The getDatabase function should be able to pick up the initialized app if it's the default app,
    // or you can explicitly pass the app instance.
    const rtdb = getDatabase(firebaseApp); 
    useEffect(() => {
        if (!firebaseUser?.uid) {
            setNotifications([]);
            return;
        }

        const notificationsRef = ref(rtdb, `notifications/${firebaseUser.uid}`);

        const listener = onValue(notificationsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const notificationsList = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Sort newest first
                setNotifications(notificationsList);
            } else {
                setNotifications([]);
            }
        });

        // Cleanup listener on component unmount
        return () => off(notificationsRef, 'value', listener);

    }, [firebaseUser?.uid]);

    return { notifications };
}


async function markNotificationsAsReadApi(notificationIds: string[], token: string) {
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

async function clearAllNotificationsApi(notificationIds: string[], token: string) {
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

export function useMarkNotificationsAsRead() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();

    return useMutation({
        mutationFn: async (notificationIds: string[]) => {
            if (!firebaseUser) throw new Error("User not authenticated");
            const token = await firebaseUser.getIdToken();
            return markNotificationsAsReadApi(notificationIds, token);
        },
        onSuccess: () => {
             // Invalidate notifications to refetch.
             // With RTDB, this isn't strictly necessary as the UI updates automatically,
             // but it's good practice for consistency with React Query's model.
            queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
        },
         onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });
}

export function useClearAllNotifications() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();

     return useMutation({
        mutationFn: async (notificationIds: string[]) => {
            if (!firebaseUser) throw new Error("User not authenticated");
            const token = await firebaseUser.getIdToken();
            return clearAllNotificationsApi(notificationIds, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
            toast({ title: 'Success', description: 'All notifications cleared.'});
        },
         onError: (error: Error) => {
            toast({
                title: "Error Clearing Notifications",
                description: error.message,
                variant: "destructive",
            });
        },
    });
}