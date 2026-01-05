'use server';

import { z } from 'zod';
import { requireUser } from './_utils/auth';
import { getDatabase } from 'firebase-admin/database';

const markAsReadSchema = z.object({ notificationIds: z.array(z.string()).min(1) });
const clearSchema = z.object({ notificationIds: z.array(z.string()).min(1) });

export async function markNotificationsAsReadAction(notificationIds: string[]) {
  const user = await requireUser();
  const { notificationIds: ids } = markAsReadSchema.parse({ notificationIds });
  const db = getDatabase();
  const updates: Record<string, any> = {};
  ids.forEach((id) => { updates[`/notifications/${user.id}/${id}/isRead`] = true; });
  await db.ref().update(updates);
  return { message: 'Notifications marked as read.' };
}

export async function clearNotificationsAction(notificationIds: string[]) {
  const user = await requireUser();
  const { notificationIds: ids } = clearSchema.parse({ notificationIds });
  const db = getDatabase();
  const updates: Record<string, null> = {};
  ids.forEach((id) => { updates[`/notifications/${user.id}/${id}`] = null; });
  await db.ref().update(updates);
  return { message: 'Notifications cleared.' };
}
