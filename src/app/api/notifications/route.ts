// src/app/api/notifications/route.ts
// This file is kept for backward compatibility but primary notification fetching
// is now handled through GraphQL subscriptions and real-time updates.
// See src/hooks/data/use-notifications.ts for real-time implementation.

import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch recent unread notifications from database
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        // Assuming there's an isRead field - adjust based on actual schema
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json(notifications, { status: 200 });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
