
import { NextResponse } from 'next/server';
import { getPendingTransactions } from '@/lib/db/queries';
import { auth as adminAuth } from '@/lib/firebase/admin';
import { getUserProfile } from '@/lib/db/queries';

// Helper to verify admin role
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
    const transactions = await getPendingTransactions();
    return NextResponse.json(transactions, { status: 200 });
  } catch (error) {
    console.error('Error fetching pending transactions:', error);
    return NextResponse.json({ message: 'An unexpected error occurred while fetching transactions.' }, { status: 500 });
  }
}
