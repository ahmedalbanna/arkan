'use server';
import { adminAuth, adminDb } from '@/lib/firebase/server-init';
import { FieldValue } from 'firebase-admin/firestore';
import type { UserProfile } from '@/lib/models';
import type { ReportTemplateProperties } from '@/lib/models';
import type { DocxTemplateProperties } from '@/lib/models';
import type { PptxTemplateProperties } from '@/lib/models';
import { AgentProperties } from '../models';
import { TransactionProperties } from '../models';


// === User Queries ===

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


// === Credit Queries ===

export async function updateUserCredits(userId: string, creditsToAdd: number): Promise<number> {
    const userRef = adminDb.collection('users').doc(userId);

    await userRef.update({
        credits: FieldValue.increment(creditsToAdd),
        updatedAt: new Date().toISOString(),
    });

    const updatedUser = await userRef.get();
    return updatedUser.data()?.credits ?? 0;
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

// === Transaction Queries ===

export async function createTransaction(data: Omit<TransactionProperties, 'createdAt' | 'id'>) {
    const transactionRef = adminDb.collection('transactions').doc();
    await transactionRef.set({
        ...data,
        createdAt: new Date().toISOString(),
    });
    return { id: transactionRef.id };
}

export async function getTransactionsByStatus({ status, limit, lastVisibleId }: { status: 'pending' | 'verified' | 'rejected', limit: number, lastVisibleId?: string }): Promise<{ transactions: TransactionProperties[], hasNextPage: boolean, lastVisibleId?: string | null }> {
    let query = adminDb.collection('transactions')
        .where('status', '==', status)
        .orderBy('createdAt', 'desc')
        .limit(limit + 1);

    if (lastVisibleId) {
        const lastDoc = await adminDb.collection('transactions').doc(lastVisibleId).get();
        if (lastDoc.exists) {
          query = query.startAfter(lastDoc);
        }
    }

    const snapshot = await query.get();

    const transactions = snapshot.docs.slice(0, limit).map(doc => ({ id: doc.id, ...doc.data() } as TransactionProperties));
    const hasNextPage = snapshot.docs.length > limit;
    const newLastVisibleId = hasNextPage ? transactions[transactions.length - 1].id : null;

    return { transactions, hasNextPage, lastVisibleId: newLastVisibleId };
}


export async function getTransactionsByUserId(userId: string): Promise<TransactionProperties[]> {
    const snapshot = await adminDb.collection('transactions')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as TransactionProperties);
}

export async function getTransactionsByDateRange(startDate: string, endDate: string): Promise<TransactionProperties[]> {
    const snapshot = await adminDb.collection('transactions')
        .where('createdAt', '>=', startDate)
        .where('createdAt', '<=', endDate)
        .orderBy('createdAt', 'desc')
        .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as TransactionProperties);
}


// --- Agent Queries ---
export async function getAgent(agentId: string): Promise<AgentProperties | null> {
    try {
        const agentDoc = await adminDb.collection('agents').doc(agentId).get();

        if (agentDoc.exists) {
            return agentDoc.data() as AgentProperties;
        }

        console.warn(`Agent with ID '${agentId}' not found in Firestore.`);
        return null;

    } catch (error) {
        console.error(`Error fetching agent configuration for '${agentId}':`, error);
        return null;
    }
}


// --- Template Queries ---
export type TemplateType = 'proposal' | 'report' | 'presentation' | 'docx' | 'pptx';
export type TemplateData = ReportTemplateProperties |DocxTemplateProperties | PptxTemplateProperties;

export async function createGenerativeTemplate(templateType: TemplateType, id: string, data: Omit<TemplateData, 'id' | 'createdAt'>): Promise<TemplateData> {
    const collectionName = ['docx', 'pptx'].includes(templateType) ? 'styles' : 'items';
    const docRef = adminDb.collection('templates').doc(templateType).collection(collectionName).doc(id);

    const doc = await docRef.get();
    if(doc.exists) {
        throw { status: 409, message: 'A template with this ID already exists.' };
    }

    const newTemplate = {
        id,
        ...data,
        createdAt: new Date().toISOString(),
    };

    await docRef.set(newTemplate);

    const createdDoc = await docRef.get();
    return createdDoc.data() as TemplateData;
}
