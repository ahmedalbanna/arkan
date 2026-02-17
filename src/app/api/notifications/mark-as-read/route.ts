// src/app/api/notifications/mark-as-read/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

const markAsReadSchema = z.object({
  notificationIds: z.array(z.string()).min(1),
});

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const validation = markAsReadSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { notificationIds } = validation.data;

    // Mark notifications as read in database
    await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId, // Ensure user can only update their own notifications
      },
      data: {
        // Assuming there's an isRead field - adjust based on actual schema
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ message: 'Notifications marked as read.' }, { status: 200 });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
