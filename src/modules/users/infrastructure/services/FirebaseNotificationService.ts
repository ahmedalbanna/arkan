
import { injectable } from "tsyringe";
import { adminDb, adminRealtimeDb } from "@/infrastructure/firebase/server-init";
import admin from 'firebase-admin';
import type { INotificationService, NotificationPayload } from "../../domain/services/INotificationService";

@injectable()
export class FirebaseNotificationService implements INotificationService {
    async send(userId: string, payload: NotificationPayload): Promise<void> {
        // 1. RTDB Notification
        const notificationRef = adminRealtimeDb.ref(`notifications/${userId}`).push();
        const notificationPayload = {
            ...payload,
            isRead: false,
            createdAt: new Date().toISOString(),
        };
        await notificationRef.set(notificationPayload);

        // 2. FCM Push Notification
        const tokenDoc = await adminDb.collection('deviceTokens').doc(userId).get();
        if (tokenDoc.exists) {
            const { token } = tokenDoc.data() as { token: string };
            const pushMessage = {
                token,
                notification: {
                    title: payload.title,
                    body: payload.description,
                },
                webpush: {
                    fcmOptions: {
                        link: payload.link || '/',
                    },
                },
            };
            try {
                await admin.messaging().send(pushMessage);
            } catch (pushError) {
                console.warn(`Failed to send push notification to user ${userId}`, pushError);
            }
        }
    }

    async saveDeviceToken(userId: string, token: string): Promise<void> {
        await adminDb.collection('deviceTokens').doc(userId).set({
            token,
            updatedAt: new Date().toISOString(),
        }, { merge: true });
    }

    async markAsRead(userId: string, notificationIds: string[]): Promise<void> {
        const updates: { [key: string]: any } = {};
        notificationIds.forEach(id => {
            updates[`/notifications/${userId}/${id}/isRead`] = true;
        });
        await adminRealtimeDb.ref().update(updates);
    }

    async clear(userId: string, notificationIds: string[]): Promise<void> {
        const updates: { [key: string]: null } = {};
        notificationIds.forEach(id => {
            updates[`/notifications/${userId}/${id}`] = null;
        });
        await adminRealtimeDb.ref().update(updates);
    }

    async getNotifications(userId: string, limit: number = 10): Promise<any[]> {
        const snapshot = await adminRealtimeDb.ref(`notifications/${userId}`)
            .orderByChild('createdAt')
            .limitToLast(limit)
            .once('value');
        
        const notifications: any[] = [];
        snapshot.forEach(child => {
            notifications.push({ id: child.key, ...child.val() });
        });
        
        return notifications.reverse();
    }
}
