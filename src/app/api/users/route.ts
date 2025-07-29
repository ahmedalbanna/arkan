
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getPaginatedUsers, getUserProfile } from '@/lib/db/queries';
import { adminDb } from '@/lib/firebase/server-init';
import { getAdminAuth } from '@/lib/firebase/admin';


// Helper to verify admin role
async function verifyAdmin(request: Request) {
    const adminAuth = await getAdminAuth();
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return { authorized: false, message: 'Unauthorized' };
    }
    const token = authHeader.substring(7);

    try {
        const decodedToken = await adminAuth.verifyIdToken(token, true);
        const user = await getUserProfile(decodedToken.uid);
        if (user?.role !== 'admin') {
            return { authorized: false, message: 'Forbidden' };
        }
        return { authorized: true, userId: decodedToken.uid };
    } catch (error) {
        return { authorized: false, message: 'Unauthorized' };
    }
}

const userListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
  lastVisibleId: z.string().optional(),
});


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = userListQuerySchema.safeParse({
      limit: searchParams.get('limit'),
      lastVisibleId: searchParams.get('lastVisibleId'),
  });
  
  if (!query.success) {
      return NextResponse.json({ errors: query.error.flatten().fieldErrors }, { status: 400 });
  }

  const { limit, lastVisibleId } = query.data;

  try {
    const results = await getPaginatedUsers({ limit, lastVisibleId });
    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'An unexpected error occurred while fetching users.' }, { status: 500 });
  }
}
