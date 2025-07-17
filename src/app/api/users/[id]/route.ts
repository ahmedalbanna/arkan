
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserProfile, updateUser } from '@/lib/db/queries';
import { auth as adminAuth } from '@/lib/firebase/admin';

// Helper to verify admin role
async function verifyAdmin(request: Request) {
    const sessionCookie = request.cookies.get('__session')?.value;
    if (!sessionCookie) {
        return { authorized: false, message: 'Unauthorized' };
    }
    try {
        const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
        const user = await getUserProfile(decodedToken.uid);
        if (user?.role !== 'admin') {
            return { authorized: false, message: 'Forbidden' };
        }
        return { authorized: true, userId: decodedToken.uid };
    } catch (error) {
        return { authorized: false, message: 'Unauthorized' };
    }
}


// GET /api/users/[id]
export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const adminCheck = await verifyAdmin(request);
  if (!adminCheck.authorized) {
    return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.message === 'Forbidden' ? 403 : 401 });
  }

  const params = await props.params;
  try {
    const userId = params.id;
    if (!userId) {
        return NextResponse.json({ message: 'User ID is required.' }, { status: 400 });
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

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const adminCheck = await verifyAdmin(request);
  if (!adminCheck.authorized) {
    return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.message === 'Forbidden' ? 403 : 401 });
  }

  const params = await props.params;
  try {
    const userId = params.id;
    if (!userId) {
        return NextResponse.json({ message: 'User ID is required.' }, { status: 400 });
    }
    // Check if user exists first
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

    // Handle profile update
    if (name || avatarUrl || bio) {
        await updateUser(userId, {
            name: name ?? user.name,
            profilePictureUrl: avatarUrl ?? user.profilePictureUrl ?? undefined,
            bio: bio ?? user.bio ?? undefined,
        });
    }

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
