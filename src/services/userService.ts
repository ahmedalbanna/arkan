
'use server';
import { adminAuth, adminDb } from '@/lib/firebase/server-init';
import type { UserProfile } from '@/lib/models';

export async function getUserProfile(id: string): Promise<UserProfile | null> {
    if (!id) return null;
    const userDoc = await adminDb.collection('users').doc(id).get();
    if (!userDoc.exists) {
        return null;
    }
    const data = userDoc.data();
    return { id: userDoc.id, ...data } as UserProfile;
}

export async function getPaginatedUsers({ limit, lastVisibleId }: { limit: number, lastVisibleId?: string }) {
    let query = adminDb.collection('users')
        .orderBy('createdAt', 'desc')
        .limit(limit + 1); // Fetch one extra to check for hasNextPage

    if (lastVisibleId) {
        const lastDoc = await adminDb.collection('users').doc(lastVisibleId).get();
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

export async function createUser(data: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'> & { password?: string }): Promise<{ user: { uid: string, email?: string | undefined } }> {
    const { email, password, name, role, credits } = data;

    const userRecord = await adminAuth.createUser({ email, password, displayName: name });

    const newUserProfile: Omit<UserProfile, 'id'> = {
        name,
        email,
        credits: credits,
        role: role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        bio: '',
        profilePictureUrl: '',
        hasCompletedOnboarding: false,
    };

    await adminDb.collection('users').doc(userRecord.uid).set(newUserProfile);

    return { user: { uid: userRecord.uid, email: userRecord.email } };
}

export async function updateUser(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    const updatePayload = {
        ...data,
        updatedAt: new Date().toISOString(),
    };
    await adminDb.collection('users').doc(userId).update(updatePayload);
    const updatedUser = await getUserProfile(userId);
    if (!updatedUser) throw new Error("Failed to refetch updated user profile.");
    return updatedUser;
}

export async function deleteUser(userId: string) {
    await adminAuth.deleteUser(userId);
    await adminDb.collection('users').doc(userId).delete();
}

export async function resetUserPassword(userId: string, newPassword: string): Promise<void> {
    await adminAuth.updateUser(userId, { password: newPassword });
}

export async function deductUserCredits(userId: string, creditsToDeduct: number): Promise<number> {
    const userRef = adminDb.collection('users').doc(userId);

    return await adminDb.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) {
            throw new Error("User not found");
        }

        const currentCredits = userDoc.data()?.credits ?? 0;

        if (currentCredits < creditsToDeduct) {
            throw { status: 402, message: "Insufficient credits. Please purchase more credits to continue." };
        }

        const newBalance = currentCredits - creditsToDeduct;
        transaction.update(userRef, {
            credits: newBalance,
            updatedAt: new Date().toISOString()
        });

        return newBalance;
    });
}
