
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserProfile, updateUser } from '@/lib/db/queries';

// GET /api/users/[id]
export async function GET(request: Request, { params }: { params: { id: string } }) {
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

export async function PUT(request: Request, { params }: { params: { id: string } }) {
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
            avatarUrl: avatarUrl ?? user.avatarUrl ?? undefined,
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
