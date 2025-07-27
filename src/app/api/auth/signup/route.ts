
'use server';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminAuth, adminDb } from '@/lib/firebase/admin';
import type { UserRole } from '@/lib/db/queries';
import { getUserProfile } from '@/lib/db/queries';

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  name: z.string().min(1, "Name is required"),
});

// Separate schema for provider-based sign-ups (Google, Phone)
const providerSignupSchema = z.object({
    uid: z.string(),
    email: z.string().email().optional().nullable(),
    name: z.string().optional().nullable(),
    phoneNumber: z.string().optional().nullable(),
});

// Helper to get the default credits for new users
async function getNewUserCredits(): Promise<number> {
    try {
        const settingsDoc = await adminDb.collection('settings').doc('defaults').get();
        if (settingsDoc.exists) {
            return settingsDoc.data()?.newUserCredits || 10;
        }
        return 10; // Fallback default
    } catch (error) {
        console.error("Could not fetch default settings, falling back to 10 credits.", error);
        return 10;
    }
}

export async function POST(req: Request) {
  const adminAuth = getAdminAuth();
  try {
    const body = await req.json();
    const defaultCredits = await getNewUserCredits();
    
    // Check if this is a provider-based sign-up/sign-in request
    if (body.uid) {
        const validation = providerSignupSchema.safeParse(body);
        if (!validation.success) {
             return NextResponse.json({ message: "Invalid payload for provider sign-up.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }

        const { uid, email, name, phoneNumber } = validation.data;
        
        const existingProfile = await getUserProfile(uid);
        if (existingProfile) {
            return NextResponse.json({ message: "User profile already exists.", user: existingProfile }, { status: 200 });
        }

        const newUserProfile = {
            name: name || `User ${uid.slice(0, 6)}`, // Default name if not provided
            email: email || '', // Email can be null for phone auth
            phoneNumber: phoneNumber || '',
            credits: defaultCredits,
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
          return NextResponse.json({ message: "Invalid signup data.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
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
            phoneNumber: '',
            credits: defaultCredits,
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
    let message = "An unexpected server error occurred. Please try again later.";

    if (error.code === 'auth/email-already-exists') {
      message = "Email address is already in use by another account.";
      return NextResponse.json({ message }, { status: 409 });
    } else if (error.code === 'auth/invalid-email') {
      message = "The email address is not valid.";
      return NextResponse.json({ message }, { status: 400 });
    } else if (error.code === 'auth/weak-password') {
       message = "The password is too weak. It must be at least 6 characters long.";
       return NextResponse.json({ message }, { status: 400 });
    }

    if (error instanceof z.ZodError) {
        return NextResponse.json({ message: "Invalid data provided.", errors: error.flatten().fieldErrors }, { status: 400 });
    }

    return NextResponse.json({ message }, { status: 500 });
  }
}