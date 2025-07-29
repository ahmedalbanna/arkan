
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin-db';

export async function GET() {
    try {
        const adminsSnapshot = await adminDb.collection('users').where('role', '==', 'admin').get();
        if (adminsSnapshot.empty) {
            return NextResponse.json([], { status: 200 });
        }
        const admins = adminsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(admins, { status: 200 });
    } catch (error) {
        console.error("Error fetching admins:", error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}
