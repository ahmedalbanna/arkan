
'use server';

import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase/server-init';

export async function setSessionCookieAction(idToken: string) {
  if (!idToken) throw new Error('ID token is required');
  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
  const store = await cookies();
  store.set('__session', sessionCookie, {
    maxAge: expiresIn,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax',
  });
  return { status: 'success' } as const;
}

export async function clearSessionCookieAction() {
  const store = await cookies();
  store.set('__session', '', { maxAge: 0, path: '/' });
  return { message: 'Logout successful' } as const;
}
