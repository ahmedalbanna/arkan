
import { NextResponse } from 'next/server';
import { getTransactionsByStatus } from '@/lib/db/queries';
import { getAdminAuth } from '@/lib/firebase/admin';
import { getUserProfile } from '@/lib/db/queries';
import { z } from 'zod';

const getTransactionsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).default(6),
  lastVisibleId: z.string().optional(),
  status: z.enum(['pending', 'verified', 'rejected']).default('pending'),
});

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

export async function GET(request: Request) {
  const adminCheck = await verifyAdmin(request);
  if (!adminCheck.authorized) {
    return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.message === 'Forbidden' ? 403 : 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const queryValidation = getTransactionsSchema.safeParse(Object.fromEntries(searchParams));

    if (!queryValidation.success) {
        return NextResponse.json({ errors: queryValidation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { limit, lastVisibleId, status } = queryValidation.data;

    const { transactions, hasNextPage } = await getTransactionsByStatus({ status, limit, lastVisibleId });
    return NextResponse.json({ transactions, hasNextPage }, { status: 200 });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ message: 'An unexpected error occurred while fetching transactions.' }, { status: 500 });
  }
}
