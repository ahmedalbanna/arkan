
import { injectable } from "tsyringe";
import { adminDb, adminRealtimeDb } from "@/lib/firebase/server-init";
import admin from 'firebase-admin';
import { INotificationService, NotificationPayload } from "../../domain/services/INotificationService";

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
}
