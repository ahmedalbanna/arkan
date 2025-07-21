
import { NextResponse } from 'next/server';
import { getPendingTransactions } from '@/lib/db/queries';
import { auth as adminAuth } from '@/lib/firebase/admin';
import { getUserProfile } from '@/lib/db/queries';
import { z } from 'zod';

const getPendingSchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).default(5),
  lastVisibleId: z.string().optional(),
});


// Helper to verify admin role from Authorization header
async function verifyAdmin(request: Request) {
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
        return { authorized: true, userId: decodedToken.uid };
    } catch (error) {
        return { authorized: false, message: 'Unauthorized' };
    }
}

export async function GET(request: Request) {
  const adminCheck = await verifyAdmin(request);
  if (!adminCheck.authorized) {
    return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.message === 'Forbidden' ? 403 : 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const queryValidation = getPendingSchema.safeParse(Object.fromEntries(searchParams));

    if (!queryValidation.success) {
        return NextResponse.json({ errors: queryValidation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { limit, lastVisibleId } = queryValidation.data;

    const { transactions, hasNextPage } = await getPendingTransactions(limit, lastVisibleId);
    return NextResponse.json({ transactions, hasNextPage }, { status: 200 });
  } catch (error) {
    console.error('Error fetching pending transactions:', error);
    return NextResponse.json({ message: 'An unexpected error occurred while fetching transactions.' }, { status: 500 });
  }
}
