// src/app/api/notifications/mark-as-read/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminAuth } from '@/lib/firebase/server-init';
import { getDatabase } from 'firebase-admin/database';

const markAsReadSchema = z.object({
  notificationIds: z.array(z.string()).min(1),
});

export async function POST(request: Request) {

    let authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    let token = authorization.substring(7);
    try {
        let decodedToken = await adminAuth.verifyIdToken(token, true);
        let userId = decodedToken.uid;

        let body = await request.json();
        let validation = markAsReadSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }

        let { notificationIds } = validation.data;

        // Use the Admin SDK to interact with the Realtime Database
        let db = getDatabase();
        let updates: Record<string, boolean> = {};
        notificationIds.forEach(id => {
            updates[`/notifications/${userId}/${id}/isRead`] = true;
        });

        await db.ref().update(updates);

        return NextResponse.json({ message: 'Notifications marked as read.' }, { status: 200 });

    } catch (error) {
        console.error('Error marking notifications as read:', error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}
