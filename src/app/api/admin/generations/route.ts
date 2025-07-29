
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminAuth } from '@/lib/firebase/admin';
import { adminDb } from '@/lib/firebase/server-init';
import { getUserProfile } from '@/lib/db/queries';

// Helper to verify admin role
async function verifyAdmin(request: Request) {
    const adminAuth = await getAdminAuth();
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
        return { authorized: false, message: 'Unauthorized' };
    }
    const token = authorization.substring(7);
    try {
        const decodedToken = await adminAuth.verifyIdToken(token, true);
        const user = await getUserProfile(decodedToken.uid);
        if (user?.role !== 'admin') {
            return { authorized: false, message: 'Forbidden' };
        }
        return { authorized: true };
    } catch (error) {
        return { authorized: false, message: 'Unauthorized' };
    }
}

const getLogsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(15),
  agentId: z.string().optional(),
  userId: z.string().optional(),
  lastVisibleId: z.string().optional(),
});

export async function GET(request: Request) {
    const adminCheck = await verifyAdmin(request);
    if (!adminCheck.authorized) {
        return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.message === 'Forbidden' ? 403 : 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const queryValidation = getLogsQuerySchema.safeParse(Object.fromEntries(searchParams));

        if (!queryValidation.success) {
            return NextResponse.json({ errors: queryValidation.error.flatten().fieldErrors }, { status: 400 });
        }

        const { limit, agentId, userId, lastVisibleId } = queryValidation.data;

        let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = adminDb.collection('agent_generations');

        if (agentId) {
            query = query.where('agentId', '==', agentId);
        }
        if (userId) {
            query = query.where('userId', '==', userId);
        }

        query = query.orderBy('createdAt', 'desc');

        if (lastVisibleId) {
            const lastDoc = await adminDb.collection('agent_generations').doc(lastVisibleId).get();
            if (lastDoc.exists) {
                query = query.startAfter(lastDoc);
            }
        }
        
        const snapshot = await query.limit(limit + 1).get(); // Fetch one extra to check for next page
        
        const logs = snapshot.docs.slice(0, limit).map(doc => ({ id: doc.id, ...doc.data() }));
        const hasNextPage = snapshot.docs.length > limit;

        return NextResponse.json({
            logs,
            hasNextPage,
            lastVisibleId: hasNextPage ? logs[logs.length - 1].id : null,
        }, { status: 200 });

    } catch (error) {
        console.error('Error fetching generation logs:', error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}
