
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDb, getAdminAuth } from '@/lib/firebase/admin';
import { getUserProfile } from '@/lib/db/queries';

// Helper to verify admin role
async function verifyAdmin(request: Request) {
    const adminAuth = getAdminAuth();
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
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  agentId: z.string().optional(),
  userId: z.string().optional(),
});

export async function GET(request: Request) {
    const adminCheck = await verifyAdmin(request);
    if (!adminCheck.authorized) {
        return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.message === 'Forbidden' ? 403 : 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const queryValidation = getLogsQuerySchema.safeParse({
            page: searchParams.get('page'),
            limit: searchParams.get('limit'),
            agentId: searchParams.get('agentId'),
            userId: searchParams.get('userId'),
        });

        if (!queryValidation.success) {
            return NextResponse.json({ errors: queryValidation.error.flatten().fieldErrors }, { status: 400 });
        }

        const { page, limit, agentId, userId } = queryValidation.data;

        let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = adminDb.collection('agent_generations');

        if (agentId) {
            query = query.where('agentId', '==', agentId);
        }
        if (userId) {
            query = query.where('userId', '==', userId);
        }

        query = query.orderBy('createdAt', 'desc');

        let lastDoc;
        if (page > 1) {
            const previousDocsSnapshot = await query.limit((page - 1) * limit).get();
            lastDoc = previousDocsSnapshot.docs[previousDocsSnapshot.docs.length - 1];
            if(lastDoc) {
                query = query.startAfter(lastDoc);
            }
        }
        
        const snapshot = await query.limit(limit).get();
        const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Check if there is a next page
        const nextQuery = query.limit(1).startAfter(snapshot.docs[snapshot.docs.length -1]);
        const nextSnapshot = await nextQuery.get();
        const hasNextPage = !nextSnapshot.empty;

        return NextResponse.json({
            logs,
            hasNextPage
        }, { status: 200 });

    } catch (error) {
        console.error('Error fetching generation logs:', error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}
