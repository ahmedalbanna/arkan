
'use client';

import { injectable } from "tsyringe";
import { apiService, ApiError } from '@/infrastructure/api/ApiService';
import { LoginCredentials } from '@/lib/utils/authUtils';
import { SignupCredentials } from '@/components/auth/SignupForm';
import { UserProfile } from '@/modules/users/domain/entities/User';
import { Result } from '@/lib/utils/result';

@injectable()
export class AuthApiClient {
    constructor() {}

    // --- Authentication Functions ---

    async loginWithEmail(credentials: LoginCredentials): Promise<Result<any, ApiError>> {
        try {
            const data = await apiService({
                endpoint: '/api/auth/login',
                method: 'POST',
                data: credentials
            });
            return Result.ok(data);
        } catch (error: any) {
            return Result.fail(error);
        }
    }

    async loginWithGoogle(): Promise<Result<any, ApiError>> {
        return Result.fail(new ApiError("Google Sign-In not supported in local auth", 400));
    }

    async serviceLogoutUser(): Promise<Result<any, ApiError>> {
        try {
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


    async forgotPasswordService(email: string): Promise<Result<any, ApiError>> {
        try {
            const data = await apiService({
                endpoint: '/api/auth/forgot-password',
                method: 'POST',
                data: { email }
            });
            return Result.ok(data);
        } catch (error: any) {
            return Result.fail(error);
        }
    }

    async resetPasswordApi(token: string, password: string): Promise<Result<any, ApiError>> {
        try {
            const data = await apiService({
                endpoint: '/api/auth/reset-password',
                method: 'POST',
                data: { token, password }
            });
            return Result.ok(data);
        } catch (error: any) {
            return Result.fail(error);
        }
    }

    async changePasswordApi(passwords: { currentPassword: string, newPassword: string }): Promise<Result<any, ApiError>> {
        try {
            const data = await apiService({
                endpoint: '/api/auth/change-password',
                method: 'POST',
                data: passwords
            });
            return Result.ok(data);
        } catch (error: any) {
            return Result.fail(error);
        }
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

