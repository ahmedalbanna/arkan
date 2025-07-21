
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserProfile, updateUser, updateUserByAdmin } from '@/lib/db/queries';
import { auth as adminAuth, adminDb } from '@/lib/firebase/admin';
import { UserRole } from '@/lib/types';
import { revalidatePath } from 'next/cache';

// Helper to verify if the requester is an admin OR the user themselves
async function verifyAccess(request: Request, targetUserId: string) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return { authorized: false, message: 'Unauthorized', isSelf: false, isAdmin: false };
    }
    const token = authHeader.substring(7);

    try {
        const decodedToken = await adminAuth.verifyIdToken(token, true);
        const requesterId = decodedToken.uid;

        const requesterProfile = await getUserProfile(requesterId);
        const isAdmin = requesterProfile?.role === 'admin';
        const isSelf = requesterId === targetUserId;

        if (isAdmin || isSelf) {
            return { authorized: true, userId: requesterId, isSelf, isAdmin };
        }

        // If neither, forbid access
        return { authorized: false, message: 'Forbidden', isSelf: false, isAdmin: false };
    } catch (error) {
        return { authorized: false, message: 'Unauthorized', isSelf: false, isAdmin: false };
    }
}

// GET /api/users/[id]
export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id: userId } = params; 
        if (!userId) {
            return NextResponse.json({ message: 'User ID is required.' }, { status: 400 });
        }

        const accessCheck = await verifyAccess(request, userId);
        if (!accessCheck.authorized) {
            return NextResponse.json({ message: accessCheck.message }, { status: accessCheck.message === 'Forbidden' ? 403 : 401 });
        }

        const user = await getUserProfile(userId);
        if (!user) {
            return NextResponse.json({ message: 'User not found.' }, { status: 404 });
        }
        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        console.error(`Error fetching user ${params.id}:`, error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}


// PUT is no longer used for form submissions, which now use a Server Action.
// This endpoint can be kept for other API-based updates or removed if not needed.
// For now, we will leave it but note that the primary edit form does not use it.


export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const targetUserId = params.id;
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const token = authHeader.substring(7);

        const decodedToken = await adminAuth.verifyIdToken(token, true);
        const requesterId = decodedToken.uid;

        const requesterProfile = await getUserProfile(requesterId);
        if (requesterProfile?.role !== 'admin') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await adminAuth.deleteUser(targetUserId);
        await adminDb.collection('users').doc(targetUserId).delete();

        revalidatePath('/admin/manage-users');

        return NextResponse.json({ message: `User ${targetUserId} deleted successfully` });

    } catch (error: any) {
        console.error("Error deleting user:", error);
        return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 });
    }
}
