import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { email, password } = validation.data;

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // The session is managed client-side by the Firebase SDK,
    // so we just need to return a success response.
    // The onAuthStateChanged listener on the client will handle the user state.
    
    // We can also return a token if we need server-to-server auth, but for now this is fine.
    const token = await user.getIdToken();

    return NextResponse.json({
        user: {
            uid: user.uid,
            email: user.email
        },
        token
    }, { status: 200 });

  } catch (error: any) {
    console.error("Login error:", error);
    
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
