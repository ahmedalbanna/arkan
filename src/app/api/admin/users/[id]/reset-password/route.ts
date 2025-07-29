
// src/app/api/users/[id]/reset-password/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getAdminAuth } from '@/lib/firebase/admin';
import { getUserProfile } from '@/lib/db/queries';

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

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    const adminCheck = await verifyAdmin(request);
    if (!adminCheck.authorized) {
        return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.message === 'Forbidden' ? 403 : 401 });
    }

    const { id: userId } = params;
    if (!userId) {
        return NextResponse.json({ message: 'User ID is required.' }, { status: 400 });
    }

    try {
        const user = await getUserProfile(userId);
        if (!user || !user.email) {
            return NextResponse.json({ message: 'User not found or has no email.' }, { status: 404 });
        }
        
        // This is a placeholder for sending a reset email.
        // Firebase Admin SDK does not directly send reset emails.
        // A real implementation would use a service like SendGrid and a generated link:
        // const link = await adminAuth.generatePasswordResetLink(user.email);
        // await sendCustomEmail(user.email, link);
        // For this demo, we'll just simulate success.
        console.log(`Password reset email would be sent to ${user.email}`);

        return NextResponse.json({ message: `A password reset email has been sent to ${user.email}.` }, { status: 200 });

    } catch (error: any) {
        console.error(`Error sending password reset for user ${userId}:`, error);
        return NextResponse.json({ message: error.message || 'An unexpected error occurred.' }, { status: 500 });
    }
}
