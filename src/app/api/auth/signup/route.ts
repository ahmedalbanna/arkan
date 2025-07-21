
'use server';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth as adminAuth, adminDb } from '@/lib/firebase/admin';
import { UserRole } from '@/lib/types';
import { getUserProfile } from '@/lib/db/queries';

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  name: z.string().min(1, "Name is required"),
});

// Separate schema for Google sign-ups, which don't have a password
const googleSignupSchema = z.object({
    uid: z.string(),
    email: z.string().email(),
    name: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Check if this is a Google sign-up request
    if (body.uid) {
        const validation = googleSignupSchema.safeParse(body);
        if (!validation.success) {
             return NextResponse.json({ error: validation.error.flatten().fieldErrors }, { status: 400 });
        }

        const { uid, email, name } = validation.data;
        
        const existingProfile = await getUserProfile(uid);
        if (existingProfile) {
            return NextResponse.json({ message: "User profile already exists.", user: existingProfile }, { status: 200 });
        }

        const newUserProfile = {
            name,
            email,
            credits: 10,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            bio: '',
            profilePictureUrl: '',
            role: 'user' as UserRole,
            hasCompletedOnboarding: false,
        };
        
        await adminDb.collection('users').doc(uid).set(newUserProfile);
        return NextResponse.json({ user: { uid, ...newUserProfile } }, { status: 201 });

    } else {
        // Handle standard email/password signup
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

        const newUserProfile = {
            name,
            email,
            credits: 10,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            bio: '',
            profilePictureUrl: '',
            role: 'user' as UserRole,
            hasCompletedOnboarding: false,
        };

        await adminDb.collection('users').doc(userRecord.uid).set(newUserProfile);
        
        return NextResponse.json({ 
          user: {
            uid: userRecord.uid, 
            email: userRecord.email 
          }
        }, { status: 201 });
    }

  } catch (error: any) {
    console.error("Signup error:", error);

    if (error.code === 'auth/email-already-exists') {
      return NextResponse.json({ error: { _form: ["Email address already in use"] } }, { status: 409 });
    } else if (error.code === 'auth/invalid-email') {
      return NextResponse.json({ error: { email: ["Invalid email format"] } }, { status: 400 });
    } else if (error.code === 'auth/weak-password') {
       return NextResponse.json({ error: { password: ["Password is too weak. It must be at least 6 characters long."] } }, { status: 400 });
    }

    if (error instanceof z.ZodError) {
        return NextResponse.json({ error: error.flatten().fieldErrors }, { status: 400 });
    }

    return NextResponse.json({ error: { _form: ["An unexpected server error occurred. Please try again later."] } }, { status: 500 });
  }
}
