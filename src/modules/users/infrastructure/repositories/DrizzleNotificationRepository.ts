import { injectable } from "tsyringe";
import { db } from "@/infrastructure/db";
import { notifications } from "@/infrastructure/db/schema";
import { Result } from "@/infrastructure/utils/result";
import { UserError } from "../../domain/errors/UserErrors";
import { eq, desc, and, inArray } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { Notification } from "../../domain/entities/Notification";

@injectable()
export class DrizzleNotificationRepository {
    async create(userId: string, data: any): Promise<Result<Notification, UserError>> {
        try {
            const id = uuidv4();
            const createdAt = new Date().toISOString();
            const persistenceData = {
                id,
                userId,
                title: data.title,
                description: data.description,
                type: (data.icon || 'default') as any,
                link: data.link || null,
                isRead: false,
                createdAt,
            };
            
            await db.insert(notifications).values(persistenceData);
            
            return Result.ok(new Notification({
                ...persistenceData,
                icon: persistenceData.type
            }));
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }

    async getByUserId(userId: string, limit: number = 20): Promise<Result<Notification[], UserError>> {
        try {
            const results = await db.query.notifications.findMany({
                where: eq(notifications.userId, userId),
                orderBy: [desc(notifications.createdAt)],
                limit,
            });
            
            const domainNotifications = results.map(n => new Notification({
                id: n.id,
                title: n.title,
                description: n.description,
                icon: n.type as any || 'default',
                isRead: !!n.isRead,
                createdAt: n.createdAt,
                link: n.link || undefined
            }));
            
            return Result.ok(domainNotifications);
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }

    async markRead(userId: string, ids: string[]): Promise<Result<void, UserError>> {
        try {
            await db.update(notifications)
                .set({ isRead: true })
                .where(and(
                    eq(notifications.userId, userId),
                    inArray(notifications.id, ids)
                ));
            return Result.ok();
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }

    async delete(userId: string, ids: string[]): Promise<Result<void, UserError>> {
        try {
            await db.delete(notifications)
                .where(and(
                    eq(notifications.userId, userId),
                    inArray(notifications.id, ids)
                ));
            return Result.ok();
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }
}
