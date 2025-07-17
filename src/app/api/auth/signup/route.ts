import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { z } from 'zod';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';

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
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Step 2: Create user in our own database
    try {
      await db.insert(users).values({
        id: user.uid,
        email: user.email!,
        name: name,
        credits: 10, // Default starting credits
        createdAt: new Date().toISOString(),
      });
    } catch (dbError) {
      // If DB insert fails, we should ideally delete the Firebase user to avoid orphaned accounts.
      // This is a more advanced transactional pattern. For now, we log the error.
      console.error("Failed to create user in DB after creating in Firebase Auth:", dbError);
      // We can choose to return an error to the user here.
      return NextResponse.json({ error: "Failed to create user profile in database." }, { status: 500 });
    }

    // Return only non-sensitive data
    return NextResponse.json({ 
      user: {
        uid: user.uid, 
        email: user.email 
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error("Signup error:", error);

    // Firebase Authentication error handling
    if (error.code === 'auth/email-already-in-use') {
      return NextResponse.json({ error: "Email address already in use" }, { status: 409 });
    } else if (error.code === 'auth/invalid-email') {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    } else if (error.code === 'auth/weak-password') {
       return NextResponse.json({ error: "Password is too weak" }, { status: 400 });
    }

    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
