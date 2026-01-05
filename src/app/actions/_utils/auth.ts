'use server';

import { adminAuth } from '@/lib/firebase/server-init';
import { cookies } from 'next/headers';
import { getUserProfile } from '@/services/userService';

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
