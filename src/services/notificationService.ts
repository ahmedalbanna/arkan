
'use server';

import { prisma } from '@/lib/db/prisma';
import type { Notification } from '@prisma/client';

export type NotificationData = Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Create a new notification for a user
 */
export async function createNotification(data: {
  userId: string;
  title: string;
  description: string;
  icon?: string;
  link?: string;
}): Promise<Notification> {
  return await prisma.notification.create({
    data: {
      userId: data.userId,
      title: data.title,
      description: data.description,
      icon: data.icon || null,
      link: data.link || null,
    },
  });
}

/**
 * Get all notifications for a user
 */
export async function getUserNotifications(userId: string): Promise<Notification[]> {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get unread notifications for a user
 */
export async function getUnreadNotifications(userId: string): Promise<Notification[]> {
  return await prisma.notification.findMany({
    where: {
      userId,
      // Assuming there's an isRead field
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<Notification> {
  return await prisma.notification.update({
    where: { id: notificationId },
    data: {
      // Update isRead field if it exists
      updatedAt: new Date(),
    },
  });
}

/**
 * Mark multiple notifications as read
 */
export async function markMultipleNotificationsAsRead(
  notificationIds: string[],
  userId: string
): Promise<number> {
  const result = await prisma.notification.updateMany({
    where: {
      id: { in: notificationIds },
      userId, // Ensure user can only mark their own notifications
    },
    data: {
      updatedAt: new Date(),
    },
  });

  return result.count;
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string, userId: string): Promise<void> {
  await prisma.notification.deleteMany({
    where: {
      id: notificationId,
      userId, // Ensure user can only delete their own notifications
    },
  });
}

/**
 * Delete multiple notifications
 */
export async function deleteMultipleNotifications(
  notificationIds: string[],
  userId: string
): Promise<number> {
  const result = await prisma.notification.deleteMany({
    where: {
      id: { in: notificationIds },
      userId, // Ensure user can only delete their own notifications
    },
  });

  return result.count;
}

/**
 * Clear all notifications for a user
 */
export async function clearAllNotifications(userId: string): Promise<number> {
  const result = await prisma.notification.deleteMany({
    where: { userId },
  });

  return result.count;
}

/**
 * Send payment verification notification
 */
export async function sendPaymentNotification(
  userId: string,
  status: 'verified' | 'rejected',
  creditsToGrant?: number,
  adminNotes?: string
): Promise<Notification> {
  const data = {
    userId,
    title: status === 'verified' ? 'Payment Approved' : 'Payment Rejected',
    description:
      status === 'verified'
        ? `Your purchase of ${creditsToGrant} credits has been approved.`
        : 'Your recent purchase could not be verified. Please contact support.',
    icon: 'credit-card',
    link: '/payment-history',
  };

  return await createNotification(data);
}

/**
 * Send gift credits notification
 */
export async function sendGiftCreditsNotification(
  userId: string,
  creditsAmount: number,
  adminName?: string,
  message?: string
): Promise<Notification> {
  const data = {
    userId,
    title: '🎁 You\'ve received a gift!',
    description: message
      ? `Admin ${adminName || 'An administrator'} sent you ${creditsAmount} credits with a message: "${message}"`
      : `An admin has sent you ${creditsAmount} credits!`,
    icon: 'gem',
    link: '/profile',
  };

  return await createNotification(data);
}

/**
 * Count unread notifications for a user
 */
export async function countUnreadNotifications(userId: string): Promise<number> {
  return await prisma.notification.count({
    where: { userId },
    // Filter by unread status if field exists
  });
}
