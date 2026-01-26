

'use server';
import { adminAuth } from '@/lib/firebase/server-init';
import type { UserProfile } from '@/lib/models';
import {
  getUserHelper,
  listUsersHelper,
  createUserDocHelper,
  updateUserHelper,
  deleteUserDocHelper,
  deductUserCreditsHelper,
  addUserCreditsHelper,
} from '@/lib/firebase/db-helpers';

export async function getUserProfile(id: string): Promise<UserProfile | null> {
    if (!id) return null;
    return getUserHelper(id);
}

export async function getPaginatedUsers({ limit, lastVisibleId }: { limit: number, lastVisibleId?: string }) {
    const result = await listUsersHelper(limit, lastVisibleId);
    return {
      users: result.items,
      hasNextPage: result.hasNextPage,
      lastVisibleId: result.lastVisibleId,
    };
}

export async function createUser(data: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'> & { password?: string }): Promise<{ user: { uid: string, email?: string | undefined } }> {
    const { email, password, name, role, credits } = data;

    const userRecord = await adminAuth.createUser({ email, password, displayName: name });

    const newUserProfile: Omit<UserProfile, 'id'> = {
        name,
        email,
        credits: credits,
        role: role,
        bio: '',
        profilePictureUrl: '',
        hasCompletedOnboarding: false,
        lastDailyCreditUpdate: new Date(0).toISOString(), // Set to epoch to ensure eligibility
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    await createUserDocHelper(userRecord.uid, newUserProfile);

    return { user: { uid: userRecord.uid, email: userRecord.email } };
}

export async function updateUser(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    return updateUserHelper(userId, data);
}

export async function deleteUser(userId: string) {
    await adminAuth.deleteUser(userId);
    await deleteUserDocHelper(userId);
}

export async function resetUserPassword(userId: string, newPassword: string): Promise<void> {
    await adminAuth.updateUser(userId, { password: newPassword });
}

export async function deductUserCredits(userId: string, creditsToDeduct: number): Promise<number> {
    return deductUserCreditsHelper(userId, creditsToDeduct);
}

export async function addUserCredits(userId: string, creditsToAdd: number): Promise<void> {
    return addUserCreditsHelper(userId, creditsToAdd);
}
