'use server';

import { adminAuth, adminDb } from '@/lib/firebase/server-init';
import { cookies } from 'next/headers';
import type { UserProfile } from '@/lib/models';

/**
 * An internal server-side function to fetch a user profile directly from Firestore.
 * This should not be exported to be used by client components.
 * @param id The user's UID.
 * @returns A promise that resolves to the user's profile or null.
 */
async function getUserProfile(id: string): Promise<UserProfile | null> {
    if (!id) return null;
    const userDoc = await adminDb.collection('users').doc(id).get();
    if (!userDoc.exists) {
        return null;
    }
    const data = userDoc.data();
    return { id: userDoc.id, ...data } as UserProfile;
}

export async function requireUser() {
  const sessionCookie = (await cookies()).get('__session')?.value;
  if (!sessionCookie) throw new Error('Unauthorized');
  const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
  const user = await getUserProfile(decoded.uid);
  if (!user) throw new Error('Forbidden');
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== 'admin') throw new Error('Forbidden');
  return user;
}