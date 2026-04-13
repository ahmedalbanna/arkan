import { injectable } from "tsyringe";
import { db } from "@/infrastructure/db";
import { notifications, users, deviceTokens, scheduledNotifications } from "@/infrastructure/db/schema";
import type { INotificationService, NotificationPayload } from "../../domain/services/INotificationService";
import { Result } from "@/infrastructure/utils/result";
import { UserError } from "../../domain/errors/UserErrors";
import { eq, desc, and, inArray, lte } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

@injectable()
export class DrizzleNotificationService implements INotificationService {
    async send(userId: string, payload: NotificationPayload): Promise<Result<void, UserError>> {
        try {
            // 1. Store in local Drizzle database
            await db.insert(notifications).values({
                id: uuidv4(),
                userId,
                title: payload.title,
                description: payload.description,
                type: (payload as any).type || 'info',
                link: payload.link || null,
                isRead: false,
                createdAt: new Date().toISOString(),
            });
            
            // 2. FCM Push notification (Real implementation placeholder)
            const userTokens = await db.query.deviceTokens.findMany({
                where: eq(deviceTokens.userId, userId),
            });

            if (userTokens.length > 0) {
                console.log(`[FCM] Sending push to ${userTokens.length} devices for user ${userId}`);
                // In production, use firebase-admin:
                // const admin = require('firebase-admin');
                // await admin.messaging().sendEachForMulticast({
                //     tokens: userTokens.map(t => t.token),
                //     notification: { title: payload.title, body: payload.description },
                //     data: { link: payload.link || '/dashboard' }
                // });
            }
            
            return Result.ok();
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }

    async saveDeviceToken(userId: string, token: string): Promise<Result<void, UserError>> {
        try {
            await db.insert(deviceTokens).values({
                token,
                userId,
                updatedAt: new Date().toISOString(),
            }).onConflictDoUpdate({
                target: deviceTokens.token,
                set: { userId, updatedAt: new Date().toISOString() },
            });
            return Result.ok();
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }

    async sendToAll(payload: NotificationPayload): Promise<Result<void, UserError>> {
        try {
            const allUsers = await db.query.users.findMany({ columns: { id: true } });
            
            // Perform in a transaction for large batches
            await db.transaction(async (tx) => {
                const now = new Date().toISOString();
                for (const user of allUsers) {
                    await tx.insert(notifications).values({
                        id: uuidv4(),
                        userId: user.id,
                        title: payload.title,
                        description: payload.description,
                        type: (payload as any).type || 'info',
                        link: payload.link || null,
                        isRead: false,
                        createdAt: now,
                    });
                }
            });

            console.log(`[BATCH NOTIFICATION] Sent to ${allUsers.length} users.`);
            return Result.ok();
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }

    async schedule(payload: NotificationPayload & { scheduledFor: string, targetUserId?: string }): Promise<Result<void, UserError>> {
        try {
            await db.insert(scheduledNotifications).values({
                id: uuidv4(),
                title: payload.title,
                description: payload.description,
                type: (payload as any).type || 'info',
                link: payload.link || null,
                scheduledFor: payload.scheduledFor,
                targetUserId: payload.targetUserId || null,
                status: 'pending',
                createdAt: new Date().toISOString(),
            });
            return Result.ok();
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }

    async processScheduled(): Promise<Result<number, UserError>> {
        try {
            const now = new Date().toISOString();
            const pending = await db.query.scheduledNotifications.findMany({
                where: and(
                    eq(scheduledNotifications.status, 'pending'),
                    lte(scheduledNotifications.scheduledFor, now)
                ),
            });

            if (pending.length === 0) return Result.ok(0);

            let processedCount = 0;
            for (const scheduled of pending) {
                try {
                    if (scheduled.targetUserId) {
                        await this.send(scheduled.targetUserId, {
                            title: scheduled.title,
                            description: scheduled.description,
                            link: scheduled.link || undefined,
                        });
                    } else {
                        await this.sendToAll({
                            title: scheduled.title,
                            description: scheduled.description,
                            link: scheduled.link || undefined,
                        });
                    }

                    await db.update(scheduledNotifications)
                        .set({ status: 'sent' })
                        .where(eq(scheduledNotifications.id, scheduled.id));
                    
                    processedCount++;
                } catch (err) {
                    console.error(`Failed to process scheduled notification ${scheduled.id}:`, err);
                    await db.update(scheduledNotifications)
                        .set({ status: 'failed' })
                        .where(eq(scheduledNotifications.id, scheduled.id));
                }
            }

            return Result.ok(processedCount);
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }

    async getScheduled(options?: { status?: string, limit?: number }): Promise<Result<any[], UserError>> {
        try {
            const whereClause = options?.status ? eq(scheduledNotifications.status, options.status as any) : undefined;
            const results = await db.query.scheduledNotifications.findMany({
                where: whereClause,
                orderBy: [desc(scheduledNotifications.scheduledFor)],
                limit: options?.limit || 50,
            });
            return Result.ok(results);
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }

    async cancelScheduled(id: string): Promise<Result<void, UserError>> {
        try {
            await db.update(scheduledNotifications)
                .set({ status: 'cancelled' })
                .where(eq(scheduledNotifications.id, id));
            return Result.ok();
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }

    async markAsRead(userId: string, notificationIds: string[]): Promise<Result<void, UserError>> {
        try {
            await db.update(notifications)
                .set({ isRead: true })
                .where(and(
                    eq(notifications.userId, userId),
                    inArray(notifications.id, notificationIds)
                ));
            return Result.ok();
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }

    async clear(userId: string, notificationIds: string[]): Promise<Result<void, UserError>> {
        try {
            await db.delete(notifications)
                .where(and(
                    eq(notifications.userId, userId),
                    inArray(notifications.id, notificationIds)
                ));
            return Result.ok();
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }

    async getNotifications(userId: string, limit: number = 10): Promise<Result<any[], UserError>> {
        try {
            const results = await db.query.notifications.findMany({
                where: eq(notifications.userId, userId),
                orderBy: [desc(notifications.createdAt)],
                limit,
            });
            
            return Result.ok(results.map(n => ({
                ...n,
                isRead: !!n.isRead
            })));
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }
}
