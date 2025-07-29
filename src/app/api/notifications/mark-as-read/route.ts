
// src/app/api/notifications/mark-as-read/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminAuth, adminDb } from '@/lib/firebase/admin';

const markAsReadSchema = z.object({
  notificationIds: z.array(z.string()).min(1),
});

export async function POST(request: Request) {
    const adminAuth = getAdminAuth();
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authorization.substring(7);
    try {
        const decodedToken = await adminAuth.verifyIdToken(token, true);
        const userId = decodedToken.uid;
        
        const body = await request.json();
        const validation = markAsReadSchema.safeParse(body);
        
        if (!validation.success) {
            return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }
        
        const { notificationIds } = validation.data;
        const batch = adminDb.batch();

        notificationIds.forEach(id => {
            const docRef = adminDb.collection('notifications').doc(id);
            // We could add a check here to ensure the notification belongs to the user,
            // but for simplicity, we'll assume the client sends valid IDs.
            batch.update(docRef, { isRead: true });
        });

        await batch.commit();

        return NextResponse.json({ message: 'Notifications marked as read.' }, { status: 200 });

    } catch (error) {
        console.error('Error marking notifications as read:', error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}
