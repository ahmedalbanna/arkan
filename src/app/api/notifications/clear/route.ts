// src/app/api/notifications/clear/route.ts
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const clearSchema = z.object({
  notificationIds: z.array(z.string()).min(1, 'At least one notification ID is required.'),
});

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const validation = clearSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { notificationIds } = validation.data;

    // Delete notifications from database
    await prisma.notification.deleteMany({
      where: {
        id: { in: notificationIds },
        userId, // Ensure user can only delete their own notifications
      },
    });

    return NextResponse.json({ message: 'Notifications cleared.' }, { status: 200 });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
