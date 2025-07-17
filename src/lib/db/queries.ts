
'use server';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  credits: number;
  createdAt: string; // Storing as ISO string
  updatedAt: string; // Storing as ISO string
  bio?: string;
  profilePictureUrl?: string;
}

export async function getUserProfile(id: string): Promise<UserProfile | null> {
    if (!id) return null;
    const userDoc = await adminDb.collection('users').doc(id).get();
    if (!userDoc.exists) {
        return null;
    }
    const data = userDoc.data();
    return { id: userDoc.id, ...data } as UserProfile;
}

export async function getPaginatedUsers({ page, limit }: { page: number; limit: number; }) {
    let query = adminDb.collection('users')
      .orderBy('createdAt', 'desc')
      .limit(limit);

    if (page > 1) {
      const snapshot = await adminDb.collection('users')
        .orderBy('createdAt', 'desc')
        .limit((page - 1) * limit)
        .get();
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as UserProfile[];
}

export async function updateUser(userId: string, data: {
    name: string;
    profilePictureUrl?: string;
    bio?: string;
}) {
    await adminDb.collection('users').doc(userId).update({
        ...data,
        updatedAt: new Date().toISOString(),
    });
}

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

    return adminDb.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) {
            throw new Error("User not found");
        }
        
        const currentCredits = userDoc.data()?.credits ?? 0;
        
        if (currentCredits < creditsToDeduct) {
            throw new Error("Insufficient credits");
        }
        
        const newBalance = currentCredits - creditsToDeduct;
        transaction.update(userRef, { 
            credits: newBalance,
            updatedAt: new Date().toISOString() 
        });
        
        return newBalance;
    });
}

export async function updateUserByAdmin(userId: string, data: Partial<UserProfile>) {
  const { id, ...updateData } = data;
  await adminDb.collection('users').doc(userId).update({
      ...updateData,
      updatedAt: new Date().toISOString()
  });
}

export async function deleteUser(userId: string) {
    await adminDb.collection('users').doc(userId).delete();
}
