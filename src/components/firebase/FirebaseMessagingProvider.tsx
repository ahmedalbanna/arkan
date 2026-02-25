'use client';

import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks';
import { initializeFirebase } from '@/firebase';

const { firebaseApp: app } = initializeFirebase();
import { saveDeviceToken } from '@/modules/users/adapters/api-client/DeviceTokenApiClient';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { useEffect, useState } from 'react';

export default function FirebaseMessagingProvider({ children }: { children: React.ReactNode }) {
    const { firebaseUser } = useAuth();
    const { toast } = useToast();
    const [, setToken] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            const messaging = getMessaging(app);

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
        }
    }, [firebaseUser, toast]);

    return <>{children}</>;
}
