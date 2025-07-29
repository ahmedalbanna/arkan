
import { NextResponse } from 'next/server';
import { getTransactionsByDateRange } from '@/lib/db/queries';
import { getAdminAuth } from '@/lib/firebase/admin';
import { getUserProfile } from '@/lib/db/queries';
import { z } from 'zod';

const getReportSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
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
    const queryValidation = getReportSchema.safeParse(Object.fromEntries(searchParams));

    if (!queryValidation.success) {
        return NextResponse.json({ errors: queryValidation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { startDate, endDate } = queryValidation.data;

    const transactions = await getTransactionsByDateRange(startDate, endDate);
    return NextResponse.json(transactions, { status: 200 });
  } catch (error) {
    console.error('Error fetching transactions for report:', error);
    return NextResponse.json({ message: 'An unexpected error occurred while fetching transactions.' }, { status: 500 });
  }
}
