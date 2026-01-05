
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { adminAuth, adminDb } from '@/lib/firebase/server-init';
import type { UserProfile } from '@/lib/models/user';
import { requireUser, requireAdmin } from './_utils/auth';
import { getStorage } from 'firebase-admin/storage';
import { FieldValue } from 'firebase-admin/firestore';

// ============================================================================
// SERVER-SIDE USER SERVICE FUNCTIONS
// ============================================================================

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
    const newLastVisibleId = hasNextPage && users.length > 0 ? users[users.length - 1].id : null;

    return { users, hasNextPage, lastVisibleId: newLastVisibleId };
}

export async function deductCredit(userId: string, creditsToDeduct: number): Promise<number> {
    const userRef = adminDb.collection('users').doc(userId);

    // Allows disabling credit deduction in development environments if needed
    if (process.env.DEDUCT_CREDITS === 'false') {
        const user = await getUserProfile(userId);
        return user?.credits ?? 0;
    };
    if (creditsToDeduct === 0) {
        const user = await getUserProfile(userId);
        return user?.credits ?? 0;
    };

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


// ============================================================================
// SERVER ACTIONS (for client-side consumption)
// ============================================================================

export async function getUserProfileAction(userId: string): Promise<UserProfile | null> {
  const requester = await requireUser();
  if (requester.role !== 'admin' && requester.id !== userId) throw new Error('Forbidden');
  return getUserProfile(userId);
}

const adminUpdateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  bio: z.string().optional(),
  credits: z.coerce.number().int().min(0).optional(),
  role: z.enum(['user','admin']).optional(),
  hasCompletedOnboarding: z.boolean().optional(),
  apiKeys: z.record(z.string()).optional(),
});

const userUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  bio: z.string().optional(),
  hasCompletedOnboarding: z.boolean().optional(),
  apiKeys: z.record(z.string()).optional(),
});

export async function updateUserAction(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
  const requester = await requireUser();
  let parsed;
  if (requester.role !== 'admin') {
    if (requester.id !== userId) throw new Error('Forbidden');
    const { name, bio, hasCompletedOnboarding, apiKeys } = data;
    const res = userUpdateSchema.safeParse({ name, bio, hasCompletedOnboarding, apiKeys });
    if (!res.success) throw new Error('Validation failed');
    parsed = res.data;
  } else {
    const res = adminUpdateUserSchema.safeParse(data);
    if (!res.success) throw new Error('Validation failed');
    parsed = res.data;
  }

  // Handle email update in Auth if present
  if (parsed.email && parsed.email !== (await getUserProfile(userId))?.email) {
    await adminAuth.updateUser(userId, { email: parsed.email });
  }

  const updatePayload = { ...parsed, updatedAt: new Date().toISOString() } as Partial<UserProfile>;
  await adminDb.collection('users').doc(userId).update(updatePayload);
  revalidatePath(`/profile/${userId}`);
  revalidatePath('/admin/manage-users');
  const updated = await getUserProfile(userId);
  if (!updated) throw new Error('User not found after update');
  return updated;
}

export async function deleteUserAction(userId: string) {
  await requireAdmin();
  await adminAuth.deleteUser(userId);
  await adminDb.collection('users').doc(userId).delete();
  revalidatePath('/admin/manage-users');
  return { message: `User ${userId} deleted successfully` };
}

const listUsersSchema = z.object({ limit: z.number().int().min(1).max(50), lastVisibleId: z.string().optional() });
export async function listUsersAction(params: { limit: number; lastVisibleId?: string }) {
  await requireAdmin();
  const parsed = listUsersSchema.parse(params);
  return getPaginatedUsers(parsed);
}

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['user','admin']).default('user'),
  credits: z.coerce.number().int().min(0).default(10),
});
export async function createUserAction(data: z.infer<typeof createUserSchema>) {
  await requireAdmin();
  const { email, password, ...profileData } = createUserSchema.parse(data);
  const userRecord = await adminAuth.createUser({ email, password, displayName: profileData.name });

  const newUserProfile: Omit<UserProfile, 'id'> = {
    ...profileData,
    email,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    hasCompletedOnboarding: false,
  };

  await adminDb.collection('users').doc(userRecord.uid).set(newUserProfile);
  return { user: { uid: userRecord.uid, email: userRecord.email } };
}

export async function uploadProfilePictureAction(formData: FormData) {
  const requester = await requireUser();
  const file = formData.get('file') as File | null;
  const targetUserId = (formData.get('userId') as string | null) || requester.id;
  if (!file) throw new Error('No file uploaded.');
  if (requester.role !== 'admin' && requester.id !== targetUserId) throw new Error('Forbidden');
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) throw new Error('Invalid file type. Only JPG, PNG, and WebP are allowed.');

  const storage = getStorage();
  const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (!bucketName) throw new Error('Firebase Storage bucket name not configured.');
  const bucket = storage.bucket(bucketName);
  const fileName = `profile_pictures/${targetUserId}/${Date.now()}-${file.name}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const uploadRef = bucket.file(fileName);
  await uploadRef.save(buffer, { metadata: { contentType: file.type } });
  await uploadRef.makePublic();
  const publicUrl = uploadRef.publicUrl();
  await adminDb.collection('users').doc(targetUserId).update({ profilePictureUrl: publicUrl, updatedAt: new Date().toISOString() });
  return { profilePictureUrl: publicUrl };
}

const sendNotificationSchema = z.object({ userId: z.string(), title: z.string(), body: z.string(), link: z.string().url().optional() });
export async function sendNotificationAction(data: z.infer<typeof sendNotificationSchema>) {
  await requireAdmin();
  const parsed = sendNotificationSchema.parse(data);
  const admin = (await import('firebase-admin')).default;
  const rtdb = admin.database();
  const ref = rtdb.ref(`notifications/${parsed.userId}`).push();
  await ref.set({
    title: parsed.title,
    description: parsed.body,
    icon: 'bell',
    isRead: false,
    createdAt: new Date().toISOString(),
    link: parsed.link || process.env.NEXT_PUBLIC_BASE_URL || '/',
  });
  const tokenDoc = await adminDb.collection('deviceTokens').doc(parsed.userId).get();
  if (!tokenDoc.exists) {
    return { messageId: 'No device token, notification saved to DB.' };
  }
  const { token } = tokenDoc.data() as { token: string };
  const message: any = {
    token,
    notification: { title: parsed.title, body: parsed.body },
    webpush: { fcmOptions: { link: parsed.link || process.env.NEXT_PUBLIC_BASE_URL || '/' } },
  };
  const response = await admin.messaging().send(message);
  return { messageId: response };
}
