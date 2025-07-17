
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth, adminDb } from '@/lib/firebase/admin';

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

    // Step 1: Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    // Step 2: Create user in our own database (Firestore)
    const newUserProfile = {
        name,
        email,
        credits: 10, // Default starting credits
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        bio: '',
        profilePictureUrl: '',
    };
    await adminDb.collection('users').doc(userRecord.uid).set(newUserProfile);
    
    // Return only non-sensitive data
    return NextResponse.json({ 
      user: {
        uid: userRecord.uid, 
        email: userRecord.email 
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error("Signup error:", error);

    // Firebase Authentication error handling
    if (error.code === 'auth/email-already-exists') {
      return NextResponse.json({ error: "Email address already in use" }, { status: 409 });
    } else if (error.code === 'auth/invalid-email') {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    } else if (error.code === 'auth/weak-password') {
       return NextResponse.json({ error: "Password is too weak" }, { status: 400 });
    }

    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
