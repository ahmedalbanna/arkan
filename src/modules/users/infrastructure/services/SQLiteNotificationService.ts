import { injectable } from "tsyringe";
import { db } from "@/infrastructure/db";
import { notifications } from "@/infrastructure/db/schema";
import type { INotificationService, NotificationPayload } from "../../domain/services/INotificationService";
import { Result } from "@/lib/utils/result";
import { UserError } from "../../domain/errors/UserErrors";
import { eq, desc, and, inArray } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

@injectable()
export class SQLiteNotificationService implements INotificationService {
    async send(userId: string, payload: NotificationPayload): Promise<Result<void, UserError>> {
        try {
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
            
            // Note: FCM Push notification logic could still be kept here 
            // if you want to keep push notifications via Firebase while storing 
            // the notification list in SQLite.
            
            return Result.ok();
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }

    async saveDeviceToken(userId: string, token: string): Promise<Result<void, UserError>> {
        // This still requires Firebase/FCM infrastructure if we want real push
        // For now, we can stub it or keep using the old service for just the token part
        return Result.ok();
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
