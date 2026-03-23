import { injectable } from "tsyringe";
import { db } from "@/infrastructure/db";
import { notifications } from "@/infrastructure/db/schema";
import { Result } from "@/lib/utils/result";
import { UserError } from "../../domain/errors/UserErrors";
import { eq, desc, and, inArray } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

@injectable()
export class SQLiteNotificationRepository {
    async create(userId: string, data: any): Promise<Result<void, UserError>> {
        try {
            await db.insert(notifications).values({
                id: uuidv4(),
                userId,
                title: data.title,
                description: data.description,
                type: data.type || 'info',
                link: data.link || null,
                isRead: false,
                createdAt: new Date().toISOString(),
            });
            return Result.ok();
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }

    async getByUserId(userId: string, limit: number = 20): Promise<Result<any[], UserError>> {
        try {
            const results = await db.query.notifications.findMany({
                where: eq(notifications.userId, userId),
                orderBy: [desc(notifications.createdAt)],
                limit,
            });
            return Result.ok(results);
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
