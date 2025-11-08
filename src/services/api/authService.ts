
'use client';

import { auth } from '@/lib/firebase/client-init';
import type { LoginCredentials, SignupCredentials } from '@/lib/types';
import {
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";


// --- Authentication Functions ---

export async function loginWithEmail(credentials: LoginCredentials) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      credentials.email,
      credentials.password
    );
    return userCredential.user;
  } catch (error: any) {
    if (
      error.code === "auth/invalid-credential" ||
      error.code === "auth/user-not-found" ||
      error.code === "auth/wrong-password" ||
      error.code === "auth/invalid-email"
    ) {
      throw new Error("Invalid email or password.");
    }
    throw new Error(error.message || "Login failed. Please try again.");
  }
}

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error: any) {
    throw new Error(error.message || "Google Sign-In failed.");
  }
}

export async function serviceLogoutUser() {
  await signOut(auth);
  const response = await fetch("/api/auth/logout", { method: "POST" });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Logout failed.");
  }
  return response.json();
}

export async function serviceSignupUser(credentials: SignupCredentials) {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  return response.json();
}


export async function forgotPasswordService(email: string) {
  return sendPasswordResetEmail(auth, email);
}

export async function sendPasswordResetEmailApi(userId: string, token: string) {
  const response = await fetch(`/api/users/${userId}/reset-password`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to send password reset email.");
  }
  return response.json();
}
