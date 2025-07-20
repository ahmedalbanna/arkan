
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserProfile, updateUser } from '@/lib/db/queries';
import { auth as adminAuth } from '@/lib/firebase/admin';
import { adminDb } from '@/lib/firebase/admin';

// Helper to verify if the requester is an admin OR the user themselves
async function verifyAccess(request: Request, targetUserId: string) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return { authorized: false, message: 'Unauthorized' };
    }
    const token = authHeader.substring(7);

    try {
        const decodedToken = await adminAuth.verifyIdToken(token, true);
        const requesterId = decodedToken.uid;

        // Allow if the requester is the user they are trying to access
        if (requesterId === targetUserId) {
            return { authorized: true, userId: requesterId };
        }

        // Allow if the requester is an admin
        const requesterProfile = await getUserProfile(requesterId);
        if (requesterProfile?.role === 'admin') {
            return { authorized: true, userId: requesterId };
        }

        // If neither, forbid access
        return { authorized: false, message: 'Forbidden' };
    } catch (error) {
        return { authorized: false, message: 'Unauthorized' };
    }
}

// GET /api/users/[id]
export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const userId = params.id;
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


// PUT /api/users/[id]
const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  avatarUrl: z.string().url().optional(),
  bio: z.string().optional(),
  credits: z.coerce.number().int().optional(),
});

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const userId = params.id;
        if (!userId) {
            return NextResponse.json({ message: 'User ID is required.' }, { status: 400 });
        }
        const accessCheck = await verifyAccess(request, userId);
        // Only the user themselves can edit their own profile via this route.
        if (!accessCheck.authorized || accessCheck.userId !== userId) {
            return NextResponse.json({ message: 'Forbidden: You can only edit your own profile.' }, { status: 403 });
        }

        const user = await getUserProfile(userId);
        if (!user) {
            return NextResponse.json({ message: 'User not found.' }, { status: 404 });
        }

        const body = await request.json();
        const validation = updateUserSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }

        const { name, avatarUrl, bio } = validation.data;

        await updateUser(userId, {
            name: name ?? user.name,
            profilePictureUrl: avatarUrl ?? user.profilePictureUrl ?? undefined,
            bio: bio ?? user.bio ?? undefined,
        });

        const updatedUser = await getUserProfile(userId);
        return NextResponse.json(updatedUser, { status: 200 });

    } catch (error) {
        console.error(`Error updating user ${params.id}:`, error);
        if (error instanceof Error) {
            return NextResponse.json({ message: error.message }, { status: 500 });
        }
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}


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

        return NextResponse.json({ message: `User ${targetUserId} deleted successfully` });

    } catch (error: any) {
        console.error("Error deleting user:", error);
        return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 });
    }
}
