
import "reflect-metadata";
import { injectable } from "tsyringe";
import { adminDb } from "@/lib/firebase/server-init";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { UserProfile } from "../../domain/entities/User";
import { FieldValue } from 'firebase-admin/firestore';

@injectable()
export class FirebaseUserRepository implements IUserRepository {
    private readonly collection = adminDb.collection("users");

    async getById(id: string): Promise<UserProfile | null> {
        if (!id) return null;
        const userDoc = await this.collection.doc(id).get();
        if (!userDoc.exists) {
            return null;
        }
        const data = userDoc.data();
        return { id: userDoc.id, ...data } as UserProfile;
    }

    async save(user: UserProfile): Promise<UserProfile> {
        await this.collection.doc(user.id).set(user);
        return user;
    }

    async update(id: string, data: Partial<UserProfile>): Promise<UserProfile> {
        const updatePayload = {
            ...data,
            updatedAt: new Date().toISOString(),
        };
        await this.collection.doc(id).update(updatePayload);
        const updatedUser = await this.getById(id);
        if (!updatedUser) throw new Error("Failed to refetch updated user profile.");
        return updatedUser;
    }

    async delete(id: string): Promise<void> {
        await this.collection.doc(id).delete();
    }

    async deductCredits(id: string, amount: number): Promise<number> {
        const userRef = this.collection.doc(id);

        return await adminDb.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists) {
                throw new Error("User not found");
            }

            const userData = userDoc.data() as UserProfile;
            let currentCredits = userData.credits ?? 0;
            const lastUpdate = userData.lastDailyCreditUpdate ? new Date(userData.lastDailyCreditUpdate).getTime() : 0;
            const twentyFourHours = 24 * 60 * 60 * 1000;

            const updates: { [key: string]: any } = {};

            // Check if it's time for a daily credit refresh
            if (Date.now() - lastUpdate > twentyFourHours) {
                if (currentCredits < 10) {
                    currentCredits = 10;
                    updates.credits = currentCredits;
                }
                updates.lastDailyCreditUpdate = new Date().toISOString();
            }

            if (currentCredits < amount) {
                throw { status: 402, message: "Insufficient credits. Please purchase more credits to continue." };
            }

            const newBalance = currentCredits - amount;
            updates.credits = newBalance;
            updates.updatedAt = new Date().toISOString();
            
            transaction.update(userRef, updates);

            return newBalance;
        });
    }

    async addCredits(id: string, amount: number): Promise<void> {
        const userRef = this.collection.doc(id);
        await userRef.update({
            credits: FieldValue.increment(amount),
            updatedAt: new Date().toISOString(),
        });
    }

    async getPaginated({ limit, lastVisibleId }: { limit: number, lastVisibleId?: string }) {
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

        return { users, hasNextPage, lastVisibleId: newLastVisibleId };
    }

    async getAdmins(): Promise<UserProfile[]> {
        const snapshot = await this.collection.where('role', '==', 'admin').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
    }
}
