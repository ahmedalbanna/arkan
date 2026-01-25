// src/app/api/notifications/route.ts
// This file is no longer used for fetching notifications with the new real-time approach,
// but it's kept here in case a non-real-time fetch is needed in the future.
// The primary fetching logic is now in `src/hooks/use-notifications.ts`.
import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/server-init';

async function getUserIdFromRequest(request: Request) {

    let authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) return null;

    let token = authorization.substring(7);
    try {
        let decodedToken = await adminAuth.verifyIdToken(token, true);
        return decodedToken.uid;
    } catch (error) {
        return null;
    }
}

export async function GET(request: Request) {
    let userId = await getUserIdFromRequest(request);
    if (!userId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        // This is a Firestore query. The app is now using RTDB for notifications.
        // This endpoint would need to be updated to use the RTDB admin SDK if it were to be used.
        let snapshot = await adminDb.collection('notifications')
            .where('userId', '==', userId)
            .where('isRead', '==', false)
            .orderBy('createdAt', 'desc')
            .limit(10)
            .get();

        let notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return NextResponse.json(notifications, { status: 200 });

    } catch (error) {
        console.error('Error fetching notifications (Firestore):', error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}
