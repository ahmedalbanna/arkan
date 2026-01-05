
'use server';

import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase/server-init';
import type { UserProfile, SignupCredentials } from '@/lib/models';
import { getUserProfile } from './userActions';

export async function setSessionCookieAction(idToken: string) {
  if (!idToken) {
    throw new Error('ID token is required');
  }
  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
  const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
  
  cookies().set('__session', sessionCookie, {
    maxAge: expiresIn,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax',
  });

  // After setting the cookie, determine the redirect path based on user role
  const decodedToken = await adminAuth.verifySessionCookie(sessionCookie);
  const userProfile = await getUserProfile(decodedToken.uid);

  if (userProfile?.role === 'admin') {
    return { status: 'success', redirectPath: '/admin/dashboard' };
  }
  return { status: 'success', redirectPath: '/builder' };
}

export async function clearSessionCookieAction() {
  cookies().set('__session', '', { maxAge: 0, path: '/' });
  return { message: 'Logout successful' } as const;
}

export async function signupAction(credentials: SignupCredentials) {
  const { email, password, name } = credentials;

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

export async function resetPasswordAction(userId: string) {
  const userDoc = await adminDb.collection('users').doc(userId).get();
  const userEmail = userDoc.data()?.email;
  if (!userEmail) throw new Error('User not found or has no email');
  const link = await adminAuth.generatePasswordResetLink(userEmail);
  // In a real app, you would email this link to the user.
  console.log(`Password reset link for ${userEmail}: ${link}`);
  return { message: `A password reset link has been generated for ${userEmail}.` };
}
