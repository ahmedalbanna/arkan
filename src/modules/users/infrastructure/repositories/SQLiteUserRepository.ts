import { injectable } from "tsyringe";
import { db } from "@/infrastructure/db";
import { users } from "@/infrastructure/db/schema";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { UserProfile } from "../../domain/entities/User";
import { Result } from "@/lib/utils/result";
import { UserError } from "../../domain/errors/UserErrors";
import { eq, sql, desc, lt } from "drizzle-orm";

@injectable()
export class SQLiteUserRepository implements IUserRepository {
    async getById(id: string): Promise<Result<UserProfile, UserError>> {
        try {
            if (!id) return Result.fail(UserError.notFound());
            const user = await db.query.users.findFirst({
                where: eq(users.id, id),
            });
            if (!user) {
                return Result.fail(UserError.notFound());
            }
            return Result.ok(this.toDomain(user));
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }

    async save(user: UserProfile): Promise<Result<UserProfile, UserError>> {
        try {
            const data = this.toPersistence(user);
            await db.insert(users).values(data).onConflictDoUpdate({
                target: users.id,
                set: data,
            });
            return Result.ok(user);
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }

    async update(id: string, data: Partial<UserProfile>): Promise<Result<UserProfile, UserError>> {
        try {
            const persistenceData = this.toPersistencePartial(data);
            await db.update(users)
                .set({ ...persistenceData, updatedAt: new Date().toISOString() })
                .where(eq(users.id, id));
            return this.getById(id);
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }

    async delete(id: string): Promise<Result<void, UserError>> {
        try {
            await db.delete(users).where(eq(users.id, id));
            return Result.ok();
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }

    async deductCredits(id: string, amount: number): Promise<Result<number, UserError>> {
        try {
            return await db.transaction(async (tx) => {
                const user = await tx.query.users.findFirst({
                    where: eq(users.id, id),
                });

                if (!user) throw new Error("User not found");

                let currentCredits = user.credits ?? 0;
                const lastUpdate = user.lastDailyCreditUpdate ? new Date(user.lastDailyCreditUpdate).getTime() : 0;
                const twentyFourHours = 24 * 60 * 60 * 1000;

                const updates: any = {};

                if (Date.now() - lastUpdate > twentyFourHours) {
                    if (currentCredits < 10) {
                        currentCredits = 10;
                        updates.credits = currentCredits;
                    }
                    updates.lastDailyCreditUpdate = new Date().toISOString();
                }

                if (currentCredits < amount) {
                    return Result.fail(UserError.validation("Insufficient credits. Please purchase more credits to continue.")) as any;
                }

                const newBalance = currentCredits - amount;
                updates.credits = newBalance;
                updates.updatedAt = new Date().toISOString();

                await tx.update(users).set(updates).where(eq(users.id, id));
                return Result.ok(newBalance);
            });
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }

    async addCredits(id: string, amount: number): Promise<Result<void, UserError>> {
        try {
            await db.update(users)
                .set({ 
                    credits: sql`${users.credits} + ${amount}`,
                    updatedAt: new Date().toISOString()
                })
                .where(eq(users.id, id));
            return Result.ok();
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }

    async getPaginated({ limit, lastVisibleId }: { limit: number, lastVisibleId?: string }): Promise<Result<{ users: UserProfile[], hasNextPage: boolean, lastVisibleId: string | null }, UserError>> {
        try {
            let whereClause = undefined;
            if (lastVisibleId) {
                const lastUser = await db.query.users.findFirst({ where: eq(users.id, lastVisibleId) });
                if (lastUser) {
                    whereClause = lt(users.createdAt, lastUser.createdAt);
                }
            }

            const results = await db.query.users.findMany({
                where: whereClause,
                orderBy: [desc(users.createdAt)],
                limit: limit + 1,
            });

            const hasNextPage = results.length > limit;
            const usersList = results.slice(0, limit).map(this.toDomain);
            const newLastVisibleId = hasNextPage ? usersList[usersList.length - 1].id : null;

            return Result.ok({ users: usersList, hasNextPage, lastVisibleId: newLastVisibleId });
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }

    async getAdmins(): Promise<Result<UserProfile[], UserError>> {
        try {
            const results = await db.query.users.findMany({
                where: eq(users.role, 'admin'),
            });
            return Result.ok(results.map(this.toDomain));
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }

    private toDomain(user: any): UserProfile {
        return {
            ...user,
            apiKeys: user.apiKeys ? JSON.parse(user.apiKeys) : undefined,
            hasCompletedOnboarding: !!user.hasCompletedOnboarding,
        };
    }

    private toPersistence(user: UserProfile): any {
        return {
            ...user,
            apiKeys: user.apiKeys ? JSON.stringify(user.apiKeys) : null,
            hasCompletedOnboarding: user.hasCompletedOnboarding ? 1 : 0,
        };
    }

    private toPersistencePartial(user: Partial<UserProfile>): any {
        const data: any = { ...user };
        if (user.apiKeys) data.apiKeys = JSON.stringify(user.apiKeys);
        if (user.hasCompletedOnboarding !== undefined) data.hasCompletedOnboarding = user.hasCompletedOnboarding ? 1 : 0;
        return data;
    }
}
