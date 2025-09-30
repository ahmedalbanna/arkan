
// src/app/api/notifications/route.ts
// This file is no longer used for fetching notifications with the new real-time approach,
// but it's kept here in case a non-real-time fetch is needed in the future.
// The primary fetching logic is now in `src/hooks/use-notifications.ts`.
import { createApiResponseEnhanced, handleApiErrorEnhanced, withEnhancedAuth } from '@/lib/core/api';
import { adminDb } from '@/lib/firebase/server-init';

export const GET = withEnhancedAuth(async ({ user }) => {
    try {
        // This is a Firestore query. The app is now using RTDB for notifications.
        // This endpoint would need to be updated to use the RTDB admin SDK if it were to be used.
        const snapshot = await adminDb.collection('notifications')
            .where('userId', '==', user.id)
            .where('isRead', '==', false)
            .orderBy('createdAt', 'desc')
            .limit(10)
            .get();

        const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return createApiResponseEnhanced(notifications, 200);

    } catch (error) {
        return handleApiErrorEnhanced(error, 'notifications_fetch');
    }
});
