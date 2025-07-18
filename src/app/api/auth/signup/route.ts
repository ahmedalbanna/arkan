
'use server';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth as adminAuth, adminDb } from '@/lib/firebase/admin';

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  name: z.string().min(1, "Name is required"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = signupSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { email, password, name } = validation.data;

    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
    });

    // Create a corresponding user profile in Firestore
    const newUserProfile = {
        name,
        email,
        credits: 10, // Assign some starting credits
        role: 'user', // Assign the default role
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        bio: '',
        profilePictureUrl: '',
        role: 'user' as UserRole, // Assign a default role, e.g., 'user'
    };

    await adminDb.collection('users').doc(userRecord.uid).set(newUserProfile);
    
    // Return a success response with the new user's basic info
    return NextResponse.json({ 
      user: {
        uid: userRecord.uid, 
        email: userRecord.email 
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error("Signup error:", error);

    // Specific Firebase Auth error codes
    if (error.code === 'auth/email-already-exists') {
      return NextResponse.json({ error: { _form: ["Email address already in use"] } }, { status: 409 });
    } else if (error.code === 'auth/invalid-email') {
      return NextResponse.json({ error: { email: ["Invalid email format"] } }, { status: 400 });
    } else if (error.code === 'auth/weak-password') {
       return NextResponse.json({ error: { password: ["Password is too weak. It must be at least 6 characters long."] } }, { status: 400 });
    }

    // Handle Zod errors specifically, although safeParse should prevent this catch block.
    if (error instanceof z.ZodError) {
        return NextResponse.json({ error: error.flatten().fieldErrors }, { status: 400 });
    }

    // Generic error fallback that ensures a JSON response
    // This will catch any other errors and prevent the JSON.parse error on the client.
    return NextResponse.json({ error: { _form: ["An unexpected server error occurred. Please try again later."] } }, { status: 500 });
  }
}
