'use client';

import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks';
import { initializeFirebase } from '@/firebase';
import { saveDeviceToken } from '@/services/api/deviceTokenService';
import { getMessaging, getToken, Messaging, onMessage } from 'firebase/messaging';
import { useEffect, useState } from 'react';

export default function FirebaseMessagingProvider({ children }: { children: React.ReactNode }) {
    const { firebaseUser } = useAuth();
    const { firebaseApp } = initializeFirebase();
    const { toast } = useToast();
    const [, setToken] = useState<string | null>(null);

    useEffect(() => {
        // Only initialize messaging in supported browsers
        if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
            return;
        }

        let messaging: Messaging;
        try {
            messaging = getMessaging(firebaseApp);
        } catch (err) {
            console.warn('Firebase Messaging is not supported in this browser:', err);
            return;
        }

        async function requestPermission() {
            try {
                const permission = await Notification.requestPermission();
                if (permission === 'granted' && firebaseUser) {
                    const currentToken = await getToken(messaging, { vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY });
                    if (currentToken) {
                        setToken(currentToken);
                        await saveDeviceToken(firebaseUser.uid, currentToken);
                    } else {
                        console.log('No registration token available. Request permission to generate one.');
                    }
                } else {
                    console.log('Unable to get permission to notify.');
                }
            } catch (err) {
                console.error('An error occurred while retrieving token. ', err);
            }
        }

        requestPermission();

        const unsubscribe = onMessage(messaging, (payload) => {
            console.log('Message received. ', payload);
            toast({
                title: payload.notification?.title,
                description: payload.notification?.body,
            });
        });

        return () => {
            unsubscribe();
        };
    }, [firebaseUser, firebaseApp, toast]);

    return <>{children}</>;
}
