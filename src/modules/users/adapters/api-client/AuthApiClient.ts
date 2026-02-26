
'use client';

import "reflect-metadata";
import { injectable } from "tsyringe";
import { initializeFirebase } from '@/firebase';
import {
  GoogleAuthProvider,
  getAdditionalUserInfo,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type Auth,
  type UserCredential
} from "firebase/auth";
import { apiService } from '@/infrastructure/api/ApiService';
import { LoginCredentials } from '@/lib/utils/authUtils';
import { SignupCredentials } from '@/components/auth/SignupForm';
import { UserProfile } from '@/modules/users/domain/entities/User';

@injectable()
export class AuthApiClient {
    private auth: Auth;

    constructor() {
        const { auth } = initializeFirebase();
        this.auth = auth;
    }

    // --- Authentication Functions ---

    async loginWithEmail(credentials: LoginCredentials): Promise<UserCredential> {
        try {
            return await signInWithEmailAndPassword(
                this.auth,
                credentials.email,
                credentials.password
            );
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

    async loginWithGoogle(): Promise<{ user: UserCredential['user'], isNewUser: boolean }> {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(this.auth, provider);
            const info = getAdditionalUserInfo(result);
            return { user: result.user, isNewUser: !!info?.isNewUser };
        } catch (error: any) {
            throw new Error(error.message || "Google Sign-In failed.");
        }
    }

    async serviceLogoutUser() {
        await signOut(this.auth);
        return apiService({ endpoint: '/api/auth/logout', method: 'POST' });
    }

    /**
     * Signs up a new user via the dedicated API endpoint.
     * This now handles both auth creation and profile creation in one go.
     */
    async serviceSignupUser(credentials: SignupCredentials) {
        return apiService({
            endpoint: '/api/auth/signup',
            method: 'POST',
            data: credentials
        });
    }


    async forgotPasswordService(email: string) {
        return sendPasswordResetEmail(this.auth, email);
    }

    async sendPasswordResetEmailApi(userId: string, token: string) {
        return apiService({
            endpoint: `/api/users/${userId}/reset-password`,
            method: 'POST',
            token,
        });
    }

    /**
     * Creates or updates a user profile document in Firestore.
     * This is now the single source of truth for creating profiles.
     */
    async createOrUpdateUserProfileApi(userId: string, data: Partial<UserProfile>, token: string): Promise<UserProfile> {
        return apiService({
            endpoint: `/api/users/${userId}`,
            method: 'PUT',
            data,
            token
        });
    }
}

