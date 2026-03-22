
'use client';

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
import { apiService, ApiError } from '@/infrastructure/api/ApiService';
import { LoginCredentials } from '@/lib/utils/authUtils';
import { SignupCredentials } from '@/components/auth/SignupForm';
import { UserProfile } from '@/modules/users/domain/entities/User';
import { Result } from '@/lib/utils/result';

@injectable()
export class AuthApiClient {
    private auth: Auth;

    constructor() {
        const { auth } = initializeFirebase();
        this.auth = auth;
    }

    // --- Authentication Functions ---

    async loginWithEmail(credentials: LoginCredentials): Promise<Result<UserCredential, Error>> {
        try {
            const result = await signInWithEmailAndPassword(
                this.auth,
                credentials.email,
                credentials.password
            );
            return Result.ok(result);
        } catch (error: any) {
            let message = error.message || "Login failed. Please try again.";
            if (
                error.code === "auth/invalid-credential" ||
                error.code === "auth/user-not-found" ||
                error.code === "auth/wrong-password" ||
                error.code === "auth/invalid-email"
            ) {
                message = "Invalid email or password.";
            }
            return Result.fail(new Error(message));
        }
    }

    async loginWithGoogle(): Promise<Result<{ user: UserCredential['user'], isNewUser: boolean }, Error>> {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(this.auth, provider);
            const info = getAdditionalUserInfo(result);
            return Result.ok({ user: result.user, isNewUser: !!info?.isNewUser });
        } catch (error: any) {
            return Result.fail(new Error(error.message || "Google Sign-In failed."));
        }
    }

    async serviceLogoutUser(): Promise<Result<any, ApiError>> {
        try {
            await signOut(this.auth);
            const data = await apiService({ endpoint: '/api/auth/logout', method: 'POST' });
            return Result.ok(data);
        } catch (error: any) {
            return Result.fail(error);
        }
    }

    /**
     * Signs up a new user via the dedicated API endpoint.
     * This now handles both auth creation and profile creation in one go.
     */
    async serviceSignupUser(credentials: SignupCredentials): Promise<Result<any, ApiError>> {
        try {
            const data = await apiService({
                endpoint: '/api/auth/signup',
                method: 'POST',
                data: credentials
            });
            return Result.ok(data);
        } catch (error: any) {
            return Result.fail(error);
        }
    }


    async forgotPasswordService(email: string) {
        return sendPasswordResetEmail(this.auth, email);
    }

    async sendPasswordResetEmailApi(userId: string, token: string): Promise<Result<any, ApiError>> {
        try {
            const data = await apiService({
                endpoint: `/api/users/${userId}/reset-password`,
                method: 'POST',
                token,
            });
            return Result.ok(data);
        } catch (error: any) {
            return Result.fail(error);
        }
    }

    /**
     * Creates or updates a user profile document in Firestore.
     * This is now the single source of truth for creating profiles.
     */
    async createOrUpdateUserProfileApi(userId: string, data: Partial<UserProfile>, token: string): Promise<Result<UserProfile, ApiError>> {
        try {
            const result = await apiService<Partial<UserProfile>, UserProfile>({
                endpoint: `/api/users/${userId}`,
                method: 'PUT',
                data,
                token
            });
            return Result.ok(result);
        } catch (error: any) {
            return Result.fail(error);
        }
    }
}

