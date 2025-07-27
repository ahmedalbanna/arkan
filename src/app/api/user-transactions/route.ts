
import { NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase/admin';
import { getTransactionsByUserId } from '@/lib/db/queries';

export async function GET(request: Request) {
    const adminAuth = getAdminAuth();
    try {
        const authorization = request.headers.get('Authorization');
        if (!authorization?.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const token = authorization.substring(7);
        const decodedToken = await adminAuth.verifyIdToken(token, true);
        const userId = decodedToken.uid;

        const transactions = await getTransactionsByUserId(userId);
        return NextResponse.json(transactions, { status: 200 });

    } catch (error) {
        console.error('Error fetching user transactions:', error);
        if (error instanceof Error && error.message.includes('token')) {
            return NextResponse.json({ message: 'Authentication failed.' }, { status: 401 });
        }
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}
