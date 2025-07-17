import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase'; // Assuming you have your firebase auth instance initialized and exported here
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { z } from 'zod';

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = signupSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors }, { status: 400 });
    }

    const { email, password } = validation.data;

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    return NextResponse.json({ userId: user.uid, email: user.email }, { status: 201 });

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