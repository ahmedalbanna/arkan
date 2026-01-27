
'use client';

// Consolidated authentication service
// Handles client-side Firebase Auth operations only
// User profile operations moved to userService

import { initializeFirebase } from '@/firebase';
import type { LoginCredentials, SignupCredentials, UserProfile } from '@/lib/types';
import {
  GoogleAuthProvider,
  getAdditionalUserInfo,
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
  type ConfirmationResult,
  type User as FirebaseUser,
  type UserCredential
} from "firebase/auth";
import { apiService } from './apiService';
import { fetchUserProfileApi } from './userService';
import { z } from 'zod';

const { auth, firebaseApp: app } = initializeFirebase();

// Re-export user profile fetching for convenience
export { fetchUserProfileApi };

// Export types for use in components and hooks
export type { ConfirmationResult };

// Validation schemas for auth operations
const LoginCredentialsSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
}).strict();

const SignupCredentialsSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  confirmPassword: z.string().optional(),
}).strict().refine(data => !data.confirmPassword || data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// ============================================================================
// CLIENT-SIDE AUTHENTICATION FUNCTIONS
// ============================================================================

/**
 * Logs in a user with email and password with validation.
 * @param credentials - Login credentials (email and password)
 * @returns Firebase UserCredential
 * @throws Error if validation fails or login fails
 */
export async function loginWithEmail(credentials: LoginCredentials): Promise<UserCredential> {
  try {
    // Validate input credentials
    const validatedCredentials = LoginCredentialsSchema.parse(credentials);
    
    return await signInWithEmailAndPassword(
      auth,
      validatedCredentials.email,
      validatedCredentials.password
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
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

export async function loginWithGoogle(): Promise<{ user: UserCredential['user'], isNewUser: boolean }> {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const info = getAdditionalUserInfo(result);
    return { user: result.user, isNewUser: !!info?.isNewUser };
  } catch (error: any) {
    throw new Error(error.message || "Google Sign-In failed.");
  }
}

export async function serviceLogoutUser() {
  await signOut(auth);
  return apiService({ endpoint: '/api/auth/logout', method: 'POST' });
}

/**
 * Signs up a new user via the dedicated API endpoint with validation.
 * This now handles both auth creation and profile creation in one go.
 * @param credentials - Signup credentials (email, password, name, etc.)
 * @returns User profile data
 * @throws Error if validation fails or signup fails
 */
export async function serviceSignupUser(credentials: SignupCredentials): Promise<UserProfile> {
  try {
    // Validate input credentials
    const validatedCredentials = SignupCredentialsSchema.parse(credentials);
    
    return await apiService({
      endpoint: '/api/auth/signup',
      method: 'POST',
      data: validatedCredentials
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}


export async function forgotPasswordService(email: string) {
  return sendPasswordResetEmail(auth, email);
}

// ============================================================================
// PHONE AUTHENTICATION FUNCTIONS
// ============================================================================

/**
 * Sends OTP via phone number with reCAPTCHA verification
 * @param phoneNumber - Phone number to send OTP to
 * @param recaptchaVerifier - reCAPTCHA verifier instance from window
 * @returns ConfirmationResult for OTP verification
 * @throws Error if phone sign-in fails
 */
export async function sendPhoneOtp(
  phoneNumber: string,
  recaptchaVerifier: any
): Promise<ConfirmationResult> {
  try {
    const authInstance = getAuth(app);
    return await signInWithPhoneNumber(authInstance, phoneNumber, recaptchaVerifier);
  } catch (error: any) {
    throw new Error(error.message || "Failed to send OTP. Please try again.");
  }
}

/**
 * Verifies OTP and returns user info with new user flag
 * @param confirmationResult - ConfirmationResult from sendPhoneOtp
 * @param otp - OTP code entered by user
 * @returns User and isNewUser flag
 * @throws Error if verification fails
 */
export async function verifyPhoneOtp(
  confirmationResult: ConfirmationResult,
  otp: string
): Promise<{ user: FirebaseUser; isNewUser: boolean }> {
  try {
    const userCredential = await confirmationResult.confirm(otp);
    const info = getAdditionalUserInfo(userCredential);
    return {
      user: userCredential.user,
      isNewUser: !!info?.isNewUser
    };
  } catch (error: any) {
    throw new Error(error.message || "Invalid OTP. Please try again.");
  }
}

// Note: sendPasswordResetEmailApi and createOrUpdateUserProfileApi have been
// moved to userService.ts for unified user management operations

