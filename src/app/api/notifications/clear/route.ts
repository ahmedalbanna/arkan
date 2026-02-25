// src/app/api/notifications/clear/route.ts
import { NextResponse } from 'next/server';
import { adminAuth } from '@/infrastructure/firebase/server-init';
import { getDatabase } from 'firebase-admin/database';
import { z } from 'zod';

const clearSchema = z.object({
  notificationIds: z.array(z.string()).min(1, "At least one notification ID is required."),
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
        let validation = clearSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }

        let { notificationIds } = validation.data;

        let db = getDatabase();
        let updates: { [key: string]: null } = {};
        notificationIds.forEach(id => {
            updates[`/notifications/${userId}/${id}`] = null; // Setting to null deletes the key in RTDB
        });

        await db.ref().update(updates);

        return NextResponse.json({ message: 'Notifications cleared.' }, { status: 200 });

    } catch (error) {
        console.error('Error clearing notifications:', error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}
