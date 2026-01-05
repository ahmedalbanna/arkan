'use server';

import { z } from 'zod';
import { adminAuth, adminDb } from '@/lib/firebase/server-init';
import type { UserProfile } from '@/lib/models';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  name: z.string().min(1, 'Name is required'),
});

export async function signupAction(input: unknown) {
  const parsed = signupSchema.parse(input);
  const { email, password, name } = parsed;

  const settings = (await adminDb.collection('settings').doc('defaults').get()).data();
  const defaultCredits = settings?.newUserCredits ?? 10;

  const userRecord = await adminAuth.createUser({ email, password, displayName: name });

  const userProfile: Omit<UserProfile, 'id'> = {
    name,
    email,
    role: 'user',
    credits: defaultCredits,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    hasCompletedOnboarding: false,
  };

  await adminDb.collection('users').doc(userRecord.uid).set(userProfile);
  return { user: { uid: userRecord.uid, email: userRecord.email } };
}
