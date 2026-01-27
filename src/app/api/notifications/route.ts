// src/app/api/notifications/route.ts
// This file is no longer used for fetching notifications with the new real-time approach,
// but it's kept here in case a non-real-time fetch is needed in the future.
// The primary fetching logic is now in `src/hooks/use-notifications.ts`.
import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/server-init';
import { listDocs } from '@/lib/firebase/db-helpers';

async function getUserIdFromRequest(request: Request): Promise<string | null> {
  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) return null;

  const token = authorization.substring(7);
  try {
    const decodedToken = await adminAuth.verifyIdToken(token, true);
    return decodedToken.uid;
  } catch (error) {
    return null;
  }
}

export async function GET(request: Request): Promise<NextResponse> {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch unread notifications for the user
    const notifications = await listDocs('notifications', {
      filters: [
        { field: 'userId', operator: '==', value: userId },
        { field: 'read', operator: '==', value: false },
      ],
      orderBy: { field: 'createdAt', direction: 'desc' },
      limit: 10,
    });

    return NextResponse.json(notifications, { status: 200 });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
