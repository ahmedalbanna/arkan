'use server';

import { z } from 'zod';
import { requireAdmin } from './_utils/auth';
import { adminDb, adminRealtimeDb } from '@/lib/firebase/server-init';

const giftCreditsSchema = z.object({ userId: z.string(), credits: z.number().int().positive(), message: z.string().optional() });

export async function giftCreditsAction(input: z.infer<typeof giftCreditsSchema>) {
  const adminUser = await requireAdmin();
  const { userId, credits, message } = giftCreditsSchema.parse(input);
  await adminDb.runTransaction(async (t: any) => {
    const userRef = adminDb.collection('users').doc(userId);
    t.update(userRef, { credits: (await userRef.get()).data()?.credits + credits });
  });
  // Notify the user via RTDB
  const ref = adminRealtimeDb.ref(`notifications/${userId}`).push();
  await ref.set({
    title: 'Credits Gifted',
    description: message || `An admin has gifted you ${credits} credits.`,
    icon: 'gift',
    isRead: false,
    createdAt: new Date().toISOString(),
    link: '/dashboard',
  });
  return { message: `Gifted ${credits} credits to user ${userId}.` };
}
