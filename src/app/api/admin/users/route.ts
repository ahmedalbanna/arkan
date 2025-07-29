import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getPaginatedUsers, getUserProfile } from '@/lib/db/queries';
import { getAdminAuth, adminDb } from '@/lib/firebase/admin';
import type { UserRole } from '@/lib/db/queries';

// Helper to verify admin role
async function verifyAdmin(request: Request) {
    const adminAuth = getAdminAuth();
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return { authorized: false, message: 'Unauthorized' };
    }
    const token = authHeader.substring(7);

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

const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  role: z.enum(['user', 'admin']).default('user'),
  credits: z.coerce.number().int().min(0).default(10),
});

export async function POST(request: Request) {
  const adminAuth = getAdminAuth();
  const adminCheck = await verifyAdmin(request);
  if (!adminCheck.authorized) {
    return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.message === 'Forbidden' ? 403 : 401 });
  }

  try {
    const body = await request.json();
    const validation = createUserSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { name, email, password, role, credits } = validation.data;

    const userRecord = await adminAuth.createUser({
        email,
        password,
        displayName: name,
    });

    const newUserProfile = {
        name,
        email,
        credits,
        role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        bio: '',
        profilePictureUrl: '',
        hasCompletedOnboarding: true, // Admin-created users don't need onboarding
    };
    
    await adminDb.collection('users').doc(userRecord.uid).set(newUserProfile);

    return NextResponse.json({ 
      user: {
        id: userRecord.uid, 
        ...newUserProfile 
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating user:', error);
    if (error.code === 'auth/email-already-exists') {
      return NextResponse.json({ message: 'A user with this email already exists.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}

const userListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
  lastVisibleId: z.string().optional(),
});


export async function GET(request: Request) {
  const adminCheck = await verifyAdmin(request);
  if (!adminCheck.authorized) {
    return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.message === 'Forbidden' ? 403 : 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = userListQuerySchema.safeParse({
        limit: searchParams.get('limit'),
        lastVisibleId: searchParams.get('lastVisibleId'),
    });
    
    if (!query.success) {
        return NextResponse.json({ errors: query.error.flatten().fieldErrors }, { status: 400 });
    }

    const { limit, lastVisibleId } = query.data;

    const results = await getPaginatedUsers({ limit, lastVisibleId });
    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'An unexpected error occurred while fetching users.' }, { status: 500 });
  }
}
