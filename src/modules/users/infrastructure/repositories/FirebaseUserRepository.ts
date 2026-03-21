
import { injectable } from "tsyringe";
import { adminDb } from "@/infrastructure/firebase/server-init";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { UserProfile } from "../../domain/entities/User";
import { FieldValue } from 'firebase-admin/firestore';
import { Result } from "@/lib/utils/result";
import { UserError } from "../../domain/errors/UserErrors";

@injectable()
export class FirebaseUserRepository implements IUserRepository {
    private readonly collection = adminDb.collection("users");

    async getById(id: string): Promise<Result<UserProfile, UserError>> {
        try {
            if (!id) return Result.fail(UserError.notFound());
            const userDoc = await this.collection.doc(id).get();
            if (!userDoc.exists) {
                return Result.fail(UserError.notFound());
            }
            const data = userDoc.data();
            return Result.ok({ id: userDoc.id, ...data } as UserProfile);
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }

    async save(user: UserProfile): Promise<Result<UserProfile, UserError>> {
        try {
            await this.collection.doc(user.id).set(user);
            return Result.ok(user);
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }

    async update(id: string, data: Partial<UserProfile>): Promise<Result<UserProfile, UserError>> {
        try {
            const updatePayload = {
                ...data,
                updatedAt: new Date().toISOString(),
            };
            await this.collection.doc(id).update(updatePayload);
            return this.getById(id);
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }

    async delete(id: string): Promise<Result<void, UserError>> {
        try {
            await this.collection.doc(id).delete();
            return Result.ok();
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }

    async deductCredits(id: string, amount: number): Promise<Result<number, UserError>> {
        const userRef = this.collection.doc(id);

        try {
            const newBalance = await adminDb.runTransaction(async (transaction) => {
                const userDoc = await transaction.get(userRef);
                if (!userDoc.exists) {
                    throw UserError.notFound();
                }

                const userData = userDoc.data() as UserProfile;
                let currentCredits = userData.credits ?? 0;
                const lastUpdate = userData.lastDailyCreditUpdate ? new Date(userData.lastDailyCreditUpdate).getTime() : 0;
                const twentyFourHours = 24 * 60 * 60 * 1000;

                const updates: { [key: string]: any } = {};

                if (Date.now() - lastUpdate > twentyFourHours) {
                    if (currentCredits < 10) {
                        currentCredits = 10;
                        updates.credits = currentCredits;
                    }
                    updates.lastDailyCreditUpdate = new Date().toISOString();
                }

                if (currentCredits < amount) {
                    throw UserError.validation("Insufficient credits. Please purchase more credits to continue.");
                }

                const newBalanceValue = currentCredits - amount;
                updates.credits = newBalanceValue;
                updates.updatedAt = new Date().toISOString();

                transaction.update(userRef, updates);

                return newBalanceValue;
            });
            return Result.ok(newBalance);
        } catch (error: any) {
            if (error instanceof UserError) return Result.fail(error);
            return Result.fail(UserError.internal(error.message));
        }
    }

    async addCredits(id: string, amount: number): Promise<Result<void, UserError>> {
        try {
            const userRef = this.collection.doc(id);
            await userRef.update({
                credits: FieldValue.increment(amount),
                updatedAt: new Date().toISOString(),
            });
            return Result.ok();
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }

    async getPaginated({ limit, lastVisibleId }: { limit: number, lastVisibleId?: string }): Promise<Result<{ users: UserProfile[], hasNextPage: boolean, lastVisibleId: string | null }, UserError>> {
        try {
            let query = this.collection
                .orderBy('createdAt', 'desc')
                .limit(limit + 1);

            if (lastVisibleId) {
                const lastDoc = await this.collection.doc(lastVisibleId).get();
                if (lastDoc.exists) {
                    query = query.startAfter(lastDoc);
                }
            }

            const snapshot = await query.get();
            const users = snapshot.docs.slice(0, limit).map(doc => ({ id: doc.id, ...doc.data() })) as UserProfile[];
            const hasNextPage = snapshot.docs.length > limit;
            const newLastVisibleId = hasNextPage ? snapshot.docs[snapshot.docs.length - 2].id : null;

            return Result.ok({ users, hasNextPage, lastVisibleId: newLastVisibleId });
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }

    async getAdmins(): Promise<Result<UserProfile[], UserError>> {
        try {
            const snapshot = await this.collection.where('role', '==', 'admin').get();
            return Result.ok(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile)));
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }
}
