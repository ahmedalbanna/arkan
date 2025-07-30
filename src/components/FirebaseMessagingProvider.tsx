
'use client';

import { useEffect, useState } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { useAuth } from '@/context/AuthContext';
import { app } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { saveDeviceToken } from '@/services/user-service';

export default function FirebaseMessagingProvider({ children }: { children: React.ReactNode }) {
    const { firebaseUser } = useAuth();
    const { toast } = useToast();
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            const messaging = getMessaging(app);
            
            const requestPermission = async () => {
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
            };
            
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
