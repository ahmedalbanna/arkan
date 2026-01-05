'use server';

import { z } from 'zod';
import { requireUser } from './_utils/auth';
import { adminDb } from '@/lib/firebase/server-init';

const saveDeviceTokenSchema = z.object({ token: z.string().min(1) });
export async function saveDeviceTokenAction(token: string) {
  const user = await requireUser();
  const { token: deviceToken } = saveDeviceTokenSchema.parse({ token });
  await adminDb.collection('deviceTokens').doc(user.id).set({ token: deviceToken, updatedAt: new Date().toISOString() }, { merge: true });
  return { message: 'Device token saved successfully.' };
}
