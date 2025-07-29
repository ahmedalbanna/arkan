// src/app/api/notifications/clear/route.ts
import { NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase/admin';
import { getDatabase } from 'firebase-admin/database';

export async function DELETE(request: Request) {
    const adminAuth = getAdminAuth();
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authorization.substring(7);
    try {
        const decodedToken = await adminAuth.verifyIdToken(token, true);
        const userId = decodedToken.uid;
        
        const db = getDatabase();
        const notificationsRef = db.ref(`notifications/${userId}`);

        await notificationsRef.remove();

        return NextResponse.json({ message: 'All notifications cleared.' }, { status: 200 });

    } catch (error) {
        console.error('Error clearing notifications:', error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}
