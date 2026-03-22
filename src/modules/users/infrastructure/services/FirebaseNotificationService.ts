
import { injectable } from "tsyringe";
import { adminDb, adminRealtimeDb } from "@/infrastructure/firebase/server-init";
import admin from 'firebase-admin';
import type { INotificationService, NotificationPayload } from "../../domain/services/INotificationService";
import { Result } from "@/lib/utils/result";
import { UserError } from "../../domain/errors/UserErrors";

@injectable()
export class FirebaseNotificationService implements INotificationService {
    async send(userId: string, payload: NotificationPayload): Promise<Result<void, UserError>> {
        try {
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
            return Result.ok();
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }

    async saveDeviceToken(userId: string, token: string): Promise<Result<void, UserError>> {
        try {
            await adminDb.collection('deviceTokens').doc(userId).set({
                token,
                updatedAt: new Date().toISOString(),
            }, { merge: true });
            return Result.ok();
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }

    async markAsRead(userId: string, notificationIds: string[]): Promise<Result<void, UserError>> {
        try {
            const updates: { [key: string]: any } = {};
            notificationIds.forEach(id => {
                updates[`/notifications/${userId}/${id}/isRead`] = true;
            });
            await adminRealtimeDb.ref().update(updates);
            return Result.ok();
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }

    async clear(userId: string, notificationIds: string[]): Promise<Result<void, UserError>> {
        try {
            const updates: { [key: string]: null } = {};
            notificationIds.forEach(id => {
                updates[`/notifications/${userId}/${id}`] = null;
            });
            await adminRealtimeDb.ref().update(updates);
            return Result.ok();
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }

    async getNotifications(userId: string, limit: number = 10): Promise<Result<any[], UserError>> {
        try {
            const snapshot = await adminRealtimeDb.ref(`notifications/${userId}`)
                .orderByChild('createdAt')
                .limitToLast(limit)
                .once('value');
            
            const notifications: any[] = [];
            snapshot.forEach(child => {
                notifications.push({ id: child.key, ...child.val() });
            });
            
            return Result.ok(notifications.reverse());
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }
}
